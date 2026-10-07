import { logger } from "../../lib/logger/logger.js";
import { NotFoundError } from "../../lib/errors/AppError.js";
import {
  geographyRepository,
  type GeographyRepository,
} from "../geography/geography.repository.js";
import { placeRepository, type PlaceRepository } from "../places/places.repository.js";
import { serpApiService, type SerpApiService } from "../../integrations/serpapi/serpapi.service.js";
import type {
  DiscoveryContextDto,
  DiscoveryResponseDataDto,
  DiscoveryResultItemDto,
  DiscoveryExecutionOptions,
  NormalizedExternalPlace,
  PlaceWithDetails,
} from "./discovery.types.js";
import type { ValidatedDiscoveryRequest } from "./discovery.schema.js";
import { CandidateMerger } from "./discovery.merger.js";
import { discoveryScorer, type DiscoveryScorer } from "./discovery.scorer.js";
import { DiscoveryDiversity } from "./discovery.diversity.js";
import { communityService } from "../community/community.service.js";
import { timeService } from "../intelligence/time/time.service.js";
import { crowdService } from "../intelligence/crowd/crowd.service.js";
import { geminiService } from "../../integrations/gemini/gemini.service.js";
import { memoryService } from "../memory/memory.service.js";
import type {
  SearchQueryContext,
  CommunitySignalSummaryDto,
  DiscoveryBestTimeDto,
  DiscoveryCrowdDto,
  TimeFit,
  CrowdFit,
  DiscoveryReasoningCandidateDto,
  DiscoveryReasoningInputDto,
  RecommendationReasoningDto,
} from "@offbeat/shared";

export class DiscoveryService {
  constructor(
    private geoRepo: GeographyRepository = geographyRepository,
    private placesRepo: PlaceRepository = placeRepository,
    private serpApi: SerpApiService = serpApiService,
    private scorer: DiscoveryScorer = discoveryScorer,
  ) {}

  /**
   * Primary entry point for OFFBEAT contextual place discovery.
   * Merges internal canonical data and external intelligence with deterministic ranking.
   */
  public async discover(
    request: ValidatedDiscoveryRequest,
    options?: DiscoveryExecutionOptions,
  ): Promise<DiscoveryResponseDataDto> {
    const startTime = Date.now();
    const requestId = options?.requestId;

    // 1. Resolve Geographic Boundary
    const region = await this.geoRepo.findRegionByIdOrSlug(request.regionId);
    if (!region) {
      logger.warn(`Discovery requested for unknown region: ${request.regionId}`, requestId);
      throw new NotFoundError(`Region with identifier '${request.regionId}' not found`);
    }

    // Resolve Country Name
    let countryName = request.country;
    if (!countryName) {
      const country = await this.geoRepo.findCountryByIdOrSlug(region.countryId);
      countryName = country?.name || "India";
    }

    // 2. Build Normalized DiscoveryContext (with Phase 15 Personalization if enabled)
    let personalization = undefined;
    if (options?.userId) {
      try {
        const profile = await memoryService.getPersonalizationProfile(options.userId);
        if (profile.memoryEnabled && profile.totalMemoriesCount > 0) {
          personalization = profile;
        }
      } catch {
        // Continue unpersonalized on error
      }
    }

    const context: DiscoveryContextDto = {
      country: countryName,
      regionId: region.id,
      region: region.name,
      destination: request.destination || null,
      travelTaste: request.travelTaste,
      experienceTaste: request.experienceTaste,
      dayNight: request.dayNight,
      preferredTime: request.preferredTime || null,
      placeType: request.placeType || null,
      intent: request.intent,
      personalization,
    };

    logger.info("Executing contextual place discovery", requestId, {
      regionId: context.regionId,
      regionName: context.region,
      travelTastes: context.travelTaste,
      experienceTastes: context.experienceTaste,
      dayNight: context.dayNight,
      intent: context.intent,
    });

    // 3. Concurrently Retrieve Internal and External Candidates
    let internalPlaces: PlaceWithDetails[] = [];
    let externalPlaces: NormalizedExternalPlace[] = [];
    let isFallback = false;
    let fallbackNotice: string | null = null;

    // Search query context for external retrieval
    const externalSearchContext: SearchQueryContext = {
      country: context.country,
      region: context.region,
      destination: context.destination || undefined,
      travelTaste: context.travelTaste,
      experienceTaste: context.experienceTaste,
      dayNight: context.dayNight,
      placeType: context.placeType || undefined,
    };

    const [internalResult, externalResult] = await Promise.allSettled([
      // A. Internal place retrieval
      this.placesRepo.findPlacesByRegion(region.id),

      // B. SerpApi external search retrieval
      this.serpApi.searchPlaces(externalSearchContext, {
        requestId,
        bypassCache: options?.bypassCache,
      }),
    ]);

    if (internalResult.status === "fulfilled") {
      internalPlaces = internalResult.value;
    } else {
      logger.error(
        "Failed to retrieve internal places during discovery",
        requestId,
        {},
        internalResult.reason as Error,
      );
    }

    if (externalResult.status === "fulfilled") {
      externalPlaces = externalResult.value;
    } else {
      const errorMsg =
        externalResult.reason instanceof Error
          ? externalResult.reason.message
          : String(externalResult.reason);

      logger.warn(
        "External SerpApi retrieval unavailable; gracefully continuing with internal data fallback",
        requestId,
        { error: errorMsg },
      );

      isFallback = true;
      fallbackNotice =
        "Displaying curated OFFBEAT places (live external search temporarily unavailable).";
    }

    // 4. Candidate Merging and Deduplication
    const mergedCandidates = CandidateMerger.merge(internalPlaces, externalPlaces, {
      regionName: context.region,
      defaultDestination: region.name,
    });

    // 5. Deterministic Scoring
    const scoredCandidates = mergedCandidates.map((candidate) =>
      this.scorer.scoreCandidate(candidate, context),
    );

    // 6. Sort Candidates Descending by Score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 7. Result Diversity Pass
    const diversifiedCandidates = DiscoveryDiversity.diversify(scoredCandidates);

    // 8. Pagination Window
    const page = request.page ?? 1;
    const limit = request.limit ?? 12;
    const total = diversifiedCandidates.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedWindow = diversifiedCandidates.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + paginatedWindow.length < total;

    // 9. Transform to Output DTOs with community signals where available
    const results: DiscoveryResultItemDto[] = await Promise.all(
      paginatedWindow.map(async (item) => {
        let community: CommunitySignalSummaryDto | undefined;
        let bestTime: DiscoveryBestTimeDto | undefined;
        let crowd: DiscoveryCrowdDto | undefined;
        let timeFit: TimeFit | undefined;
        let crowdFit: CrowdFit | undefined;

        if (item.candidate.id) {
          try {
            const signals = await communityService.getCommunitySignalsForPlace(item.candidate.id);
            if (signals.submissionCount > 0) {
              community = signals;
            }
          } catch {
            // Community signals non-blocking
          }

          try {
            const timeIntel = await timeService.getTimeIntelligenceForPlace(item.candidate.id, {
              dayNight: context.dayNight,
              preferredTime: context.preferredTime || undefined,
              experienceTaste: context.experienceTaste,
            });

            if (timeIntel.recommendedTimes.length > 0) {
              const topRec = timeIntel.recommendedTimes[0];
              if (topRec) {
                bestTime = {
                  start: topRec.start,
                  end: topRec.end,
                  dayType: topRec.dayType,
                  source: topRec.source,
                  reason: topRec.reason,
                };
              }
            }
            timeFit = timeIntel.timeFit;
          } catch {
            // Time intelligence non-blocking
          }

          try {
            const crowdIntel = await crowdService.getCrowdIntelligenceForPlace(item.candidate.id, {
              dayType: "ANY",
            });

            if (crowdIntel.overall !== "UNKNOWN") {
              const firstPattern = crowdIntel.patterns[0];
              crowd = {
                level: crowdIntel.overall,
                context: firstPattern?.time
                  ? `${firstPattern.dayType} ${firstPattern.time}`
                  : firstPattern?.dayType,
                source: crowdIntel.source,
                observation: firstPattern?.observation || undefined,
              };
            }
            crowdFit = crowdIntel.crowdFit;
          } catch {
            // Crowd intelligence non-blocking
          }
        }

        return {
          place: {
            id: item.candidate.id,
            name: item.candidate.name,
            slug: item.candidate.slug,
            destination: item.candidate.destination,
            region: item.candidate.region,
            categories: item.candidate.categories,
            location: item.candidate.location,
            address: item.candidate.address,
            description: item.candidate.description,
            imageUrl: item.candidate.imageUrl,
            rating: item.candidate.rating,
            reviewCount: item.candidate.reviewCount,
            openingHours: item.candidate.openingHours,
            sourceUrl: item.candidate.sourceUrl,
          },
          score: item.score,
          why: item.why,
          source: {
            type: item.candidate.source,
            provider: item.candidate.provider,
          },
          community,
          bestTime,
          crowd,
          timeFit,
          crowdFit,
        };
      }),
    );

    // 10. Gemini Contextual Intelligence Reasoning Layer
    let recommendationReasoning: RecommendationReasoningDto | undefined;
    if (results.length > 0) {
      // Reason over a bounded candidate set (top 5 candidates)
      const candidateSubset = results.slice(0, 5);
      const reasoningCandidates: DiscoveryReasoningCandidateDto[] = candidateSubset.map((item) => ({
        id: item.place.id,
        name: item.place.name,
        description: item.place.description,
        categories: item.place.categories,
        destination: item.place.destination,
        score: item.score,
        why: item.why,
        bestTime: item.bestTime,
        crowd: item.crowd,
        timeFit: item.timeFit,
        crowdFit: item.crowdFit,
        communityHighlights: item.community?.highlights.map((h) => ({
          title: h.title,
          content: h.content,
          verificationStatus: h.verification?.status,
          evidenceStrength: h.verification?.strength,
        })),
        sources: [item.source.type, item.source.provider],
      }));

      const reasoningInput: DiscoveryReasoningInputDto = {
        userContext: {
          region: context.region,
          destination: context.destination,
          travelTaste: context.travelTaste,
          experienceTaste: context.experienceTaste,
          dayNight: context.dayNight,
          preferredTime: context.preferredTime,
        },
        candidates: reasoningCandidates,
      };

      try {
        const reasoningResult = await geminiService.reasonAboutDiscovery(reasoningInput);
        recommendationReasoning = {
          source: reasoningResult.source,
          summary: reasoningResult.recommendationSummary,
          reasons: reasoningResult.reasons,
          tradeoffs: reasoningResult.tradeoffs,
          contextualNotes: reasoningResult.contextualNotes,
        };

        // Attach reasoning to the selected primary recommendation item
        const primaryItem =
          results.find((r) => r.place.id === reasoningResult.primaryRecommendationId) || results[0];
        if (primaryItem) {
          primaryItem.reasoning = recommendationReasoning;
        }

        // If reasoning chose another approved candidate from the subset, promote it to position 0
        if (
          reasoningResult.primaryRecommendationId &&
          results[0]?.place.id !== reasoningResult.primaryRecommendationId
        ) {
          const primaryIdx = results.findIndex(
            (r) => r.place.id === reasoningResult.primaryRecommendationId,
          );
          if (primaryIdx > 0) {
            const [promoted] = results.splice(primaryIdx, 1);
            if (promoted) {
              results.unshift(promoted);
            }
          }
        }
      } catch (reasoningErr) {
        logger.warn(
          "Discovery reasoning step encountered an unexpected error; continuing with deterministic fallback",
          requestId,
          {},
          reasoningErr as Error,
        );
      }
    }

    const durationMs = Date.now() - startTime;
    logger.info("Contextual discovery completed successfully", requestId, {
      region: context.region,
      internalCount: internalPlaces.length,
      externalCount: externalPlaces.length,
      mergedCount: total,
      returnedCount: results.length,
      page,
      limit,
      durationMs,
      fallback: isFallback,
      reasoningSource: recommendationReasoning?.source || "NONE",
    });

    return {
      context,
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
      fallback: isFallback,
      notice: fallbackNotice,
      reasoning: recommendationReasoning,
    };
  }
}

export const discoveryService = new DiscoveryService();
