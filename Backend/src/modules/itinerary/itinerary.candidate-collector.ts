import { placeRepository, type PlaceRepository } from "../places/places.repository.js";
import { timeService, type TimeService } from "../intelligence/time/time.service.js";
import { crowdService, type CrowdService } from "../intelligence/crowd/crowd.service.js";
import { communityService, type CommunityService } from "../community/community.service.js";
import { logger } from "../../lib/logger/logger.js";
import type { ValidatedCreateItineraryRequest } from "./itinerary.schema.js";
import type { CandidatePlaceWithSignals } from "./itinerary.types.js";
import type { PlaceWithDetails } from "../places/places.types.js";

export class ItineraryCandidateCollector {
  constructor(
    private placesRepo: PlaceRepository = placeRepository,
    private time: TimeService = timeService,
    private crowd: CrowdService = crowdService,
    private community: CommunityService = communityService,
  ) {}

  public async collectCandidates(
    request: ValidatedCreateItineraryRequest,
    options?: { requestId?: string },
  ): Promise<CandidatePlaceWithSignals[]> {
    const requestId = options?.requestId;
    const avoidSet = new Set(request.avoidPlaceIds || []);
    const mustVisitSet = new Set(request.mustVisitPlaceIds || []);
    const alternativeSet = new Set(request.selectedAlternativePlaceIds || []);

    const rawPlacesMap = new Map<string, PlaceWithDetails>();

    // 1. Explicitly fetch Must-Visit and Selected Alternative places
    const explicitIds = [...mustVisitSet, ...alternativeSet];
    for (const placeId of explicitIds) {
      if (avoidSet.has(placeId)) continue;
      try {
        const place = await this.placesRepo.findPlaceByIdOrSlug(placeId);
        if (place) {
          rawPlacesMap.set(place.id, place);
        }
      } catch {
        // non-blocking
      }
    }

    // 2. Fetch destination places if destinationId provided
    if (request.destinationId) {
      try {
        const destPlaces = await this.placesRepo.findPlacesByDestination(request.destinationId);
        for (const place of destPlaces) {
          if (!avoidSet.has(place.id) && !rawPlacesMap.has(place.id)) {
            rawPlacesMap.set(place.id, place);
          }
        }
      } catch (err) {
        logger.warn("Failed fetching destination places for itinerary", requestId, {
          destinationId: request.destinationId,
          error: (err as Error)?.message,
        });
      }
    }

    // 3. Fetch regional places to ensure breadth
    try {
      const regionPlaces = await this.placesRepo.findPlacesByRegion(request.regionId);
      for (const place of regionPlaces) {
        if (!avoidSet.has(place.id) && !rawPlacesMap.has(place.id)) {
          rawPlacesMap.set(place.id, place);
        }
      }
    } catch (err) {
      logger.warn("Failed fetching regional places for itinerary", requestId, {
        regionId: request.regionId,
        error: (err as Error)?.message,
      });
    }

    // Fallback: If no places found for region/destination, retrieve Darjeeling/WB defaults
    if (rawPlacesMap.size === 0) {
      const fallbackList = await this.placesRepo.findPlacesByRegion("IN-WB");
      for (const place of fallbackList) {
        if (!avoidSet.has(place.id)) {
          rawPlacesMap.set(place.id, place);
        }
      }
    }

    const rawPlaces = Array.from(rawPlacesMap.values());

    // 4. Enrich each candidate with Time, Crowd, Community, and Confidence
    const enrichedCandidates: CandidatePlaceWithSignals[] = await Promise.all(
      rawPlaces.map(async (place) => {
        let timeFit: "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN" = "UNKNOWN";
        let bestTime: { start?: string; end?: string; reason?: string } | undefined;

        try {
          const timeIntel = await this.time.getTimeIntelligenceForPlace(place.id, {
            dayNight: request.dayNight,
            preferredTime: request.preferredStartTime || undefined,
            experienceTaste: request.experienceTaste,
          });
          timeFit = timeIntel.timeFit || "UNKNOWN";
          if (timeIntel.recommendedTimes[0]) {
            bestTime = {
              start: timeIntel.recommendedTimes[0].start,
              end: timeIntel.recommendedTimes[0].end,
              reason: timeIntel.recommendedTimes[0].reason,
            };
          }
        } catch {
          // non-blocking
        }

        let crowdLevel: import("@offbeat/shared").CrowdLevel = "UNKNOWN";
        let crowdFit: "GOOD" | "PARTIAL" | "UNKNOWN" = "UNKNOWN";

        try {
          const crowdIntel = await this.crowd.getCrowdIntelligenceForPlace(place.id, {
            timeWindow: request.preferredStartTime || undefined,
          });
          crowdLevel = crowdIntel.overall;
          crowdFit =
            crowdIntel.crowdFit === "LOWER_CROWD_MATCH"
              ? "GOOD"
              : crowdIntel.crowdFit === "NEUTRAL"
                ? "PARTIAL"
                : "UNKNOWN";
        } catch {
          // non-blocking
        }

        let communitySignals:
          { submissionCount: number; helpfulCount: number; verifiedCount: number } | undefined;
        try {
          const commData = await this.community.getCommunitySignalsForPlace(place.id);
          if (commData.submissionCount > 0) {
            communitySignals = {
              submissionCount: commData.submissionCount,
              helpfulCount: (commData.usefulCount || 0) + (commData.confirmCount || 0),
              verifiedCount: commData.verifiedCount ?? 0,
            };
          }
        } catch {
          // non-blocking
        }

        // Phase 9 Confidence calculation
        const confidenceData = {
          score:
            communitySignals && communitySignals.submissionCount > 0
              ? Math.min(1.0, 0.82 + communitySignals.verifiedCount * 0.04)
              : 0.88,
          evidenceStrength: (communitySignals && communitySignals.submissionCount >= 2
            ? "STRONG"
            : "MODERATE") as import("@offbeat/shared").EvidenceStrength,
          status: communitySignals?.verifiedCount ? "VERIFIED" : "COMMUNITY_BACKED",
        };

        // Categories string array
        const categoryNames = place.categories.map(
          (c: { category: { name: string } }) => c.category.name,
        );

        // Calculate taste alignment score
        const lowerTastes = (request.travelTaste || []).map((t: string) => t.toLowerCase());
        const placeCats = categoryNames.map((c: string) => c.toLowerCase());
        const tasteMatches = placeCats.filter((c: string) =>
          lowerTastes.some((t: string) => c.includes(t) || t.includes(c)),
        );
        const tasteScore = lowerTastes.length > 0 ? tasteMatches.length / lowerTastes.length : 0.5;

        // Base score prioritizing must-visit, alternatives, and taste match
        const isMustVisit = mustVisitSet.has(place.id) || mustVisitSet.has(place.slug || "");
        const isAlternative = alternativeSet.has(place.id) || alternativeSet.has(place.slug || "");

        let score =
          tasteScore * 0.4 + (timeFit === "GOOD" ? 0.3 : 0.1) + (crowdFit === "GOOD" ? 0.3 : 0.1);
        if (isMustVisit) score += 10.0;
        if (isAlternative) score += 5.0;

        return {
          id: place.id,
          name: place.name,
          slug: place.slug,
          destination: place.destination?.name || "Local Destination",
          destinationId: place.destinationId || undefined,
          regionId: place.destination?.regionId || undefined,
          categories: categoryNames,
          location:
            place.latitude && place.longitude
              ? { lat: place.latitude, lng: place.longitude }
              : undefined,
          description: place.description || undefined,
          timeFit,
          crowdFit,
          crowdLevel,
          recommendedTime: bestTime,
          community: communitySignals,
          confidence: confidenceData,
          isMustVisit,
          isAlternative,
          score,
        };
      }),
    );

    // Sort by priority score descending
    enrichedCandidates.sort((a, b) => b.score - a.score);

    logger.info("Itinerary candidates collected and enriched", requestId, {
      totalCollected: enrichedCandidates.length,
      mustVisitCount: mustVisitSet.size,
      alternativeCount: alternativeSet.size,
    });

    return enrichedCandidates;
  }
}

export const itineraryCandidateCollector = new ItineraryCandidateCollector();
