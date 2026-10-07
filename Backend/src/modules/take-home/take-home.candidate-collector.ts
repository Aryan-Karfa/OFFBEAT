import { placeRepository, type PlaceRepository } from "../places/places.repository.js";
import { communityService, type CommunityService } from "../community/community.service.js";
import { serpApiService, type SerpApiService } from "../../integrations/serpapi/serpapi.service.js";
import { SEED_DESTINATIONS } from "../geography/geography.seed-data.js";
import { CANONICAL_TAKE_HOME_ITEMS } from "./take-home.seed-data.js";
import { logger } from "../../lib/logger/logger.js";
import type {
  TakeHomeItemDto,
  TakeHomeQueryDto,
  TakeHomeSourceDto,
  CanonicalTakeHomeDefinition,
} from "./take-home.types.js";
import type { PlaceWithDetails } from "../places/places.types.js";

export interface ResolvedDestinationInfo {
  id: string;
  name: string;
  regionId?: string;
  place?: PlaceWithDetails;
}

export class TakeHomeCandidateCollector {
  constructor(
    private placesRepo: PlaceRepository = placeRepository,
    private communitySvc: CommunityService = communityService,
    private serpApi: SerpApiService = serpApiService,
  ) {}

  /**
   * Resolves destination context from either a destination identifier or a place identifier.
   */
  public async resolveDestination(
    destinationIdentifier?: string,
    placeId?: string,
  ): Promise<ResolvedDestinationInfo> {
    // 1. If placeId is provided, resolve place first
    if (placeId) {
      const place = await this.placesRepo.findPlaceByIdOrSlug(placeId);
      if (place) {
        const destId = place.destinationId || place.destination?.id || "dest_darjeeling";
        const destName = place.destination?.name || "Darjeeling";
        const regionId = place.destination?.regionId || "IN-WB";
        return {
          id: destId,
          name: destName,
          regionId,
          place,
        };
      }
    }

    const raw = (destinationIdentifier || "dest_darjeeling").trim();
    const lower = raw.toLowerCase();

    // 2. Match in seed destinations
    const matchedSeed = SEED_DESTINATIONS.find(
      (d) =>
        d.id.toLowerCase() === lower ||
        d.slug.toLowerCase() === lower ||
        d.name.toLowerCase() === lower,
    );
    if (matchedSeed) {
      return {
        id: matchedSeed.id,
        name: matchedSeed.name,
        regionId: matchedSeed.regionId,
      };
    }

    // 3. Match in canonical items
    const matchedItem = CANONICAL_TAKE_HOME_ITEMS.find(
      (item) =>
        item.destinationId.toLowerCase() === lower || item.destinationName.toLowerCase() === lower,
    );
    if (matchedItem) {
      return {
        id: matchedItem.destinationId,
        name: matchedItem.destinationName,
        regionId: matchedItem.regionId,
      };
    }

    // 4. Fallback safe resolution
    const cleanName = raw.replace(/^dest_/, "").replace(/[_-]/g, " ");
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    return {
      id: raw,
      name: formattedName,
      regionId: "IN-WB",
    };
  }

  /**
   * Collects internal, community, and external candidates for a resolved destination.
   */
  public async collectCandidates(
    destination: ResolvedDestinationInfo,
    query: TakeHomeQueryDto,
    options?: { requestId?: string },
  ): Promise<TakeHomeItemDto[]> {
    const requestId = options?.requestId;

    // 1. Gather internal canonical items matching this destination or region
    const canonicalMatches = CANONICAL_TAKE_HOME_ITEMS.filter((item) => {
      const matchesDestId = item.destinationId.toLowerCase() === destination.id.toLowerCase();
      const matchesDestName = item.destinationName.toLowerCase() === destination.name.toLowerCase();
      return matchesDestId || matchesDestName;
    });

    const items: TakeHomeItemDto[] = canonicalMatches.map((item) => this.mapCanonicalToDto(item));

    // 2. Fetch authentic community intelligence for this destination
    try {
      const communityData = await this.communitySvc.listSubmissions({
        destinationId: destination.id,
        page: 1,
        limit: 30,
      });

      const relevantSubmissions = communityData.items.filter((sub) =>
        [
          "LOCAL_SPECIALTY",
          "TAKE_HOME",
          "LOCAL_BUSINESS",
          "RESTAURANT",
          "TRAVEL_TIP",
          "EXPERIENCE",
        ].includes(sub.type),
      );

      for (const sub of relevantSubmissions) {
        const subText = `${sub.title} ${sub.content}`.toLowerCase();

        // Check if it corroborates any existing canonical item
        const matchedItem = items.find((item) => {
          const itemNameParts = item.name.toLowerCase().split(/\s+/);
          return (
            itemNameParts.some((part) => part.length > 3 && subText.includes(part)) ||
            subText.includes(item.category.toLowerCase().replace(/_/g, " "))
          );
        });

        if (matchedItem) {
          // Enrich item with authentic community signals
          matchedItem.community = {
            submissionId: sub.id,
            authorName: sub.author.displayName || sub.author.username,
            status: sub.verification?.status || "COMMUNITY_VERIFIED",
            supportCount: sub.support?.count || 1,
            evidenceStrength: sub.evidence && sub.evidence.length > 0 ? "HIGH" : "MODERATE",
            quote: sub.content.slice(0, 150),
          };
          if (sub.verification?.status === "COMMUNITY_VERIFIED") {
            matchedItem.confidence = {
              score: Math.max(matchedItem.confidence?.score || 0.8, 0.9),
              evidenceStrength: "HIGH",
            };
          }
        } else if (
          (sub.type === "LOCAL_SPECIALTY" || sub.type === "TAKE_HOME") &&
          sub.status === "APPROVED"
        ) {
          // Real community-discovered take home item not in seed
          items.push({
            id: `item_community_${sub.id}`,
            name: sub.title,
            category: "LOCAL_PRODUCT",
            categories: ["LOCAL_PRODUCT", "CULTURAL_GOOD"],
            destinationId: destination.id,
            destinationName: destination.name,
            description: sub.content,
            whyTakeHome: `Recommended directly by local community traveler ${sub.author.displayName || sub.author.username}.`,
            localRelevance: "LOCAL",
            goodFor: ["PERSONAL", "GIFT"],
            budget: "UNKNOWN",
            source: "COMMUNITY",
            confidence: {
              score: sub.verification?.score || 0.8,
              evidenceStrength: sub.evidence && sub.evidence.length > 0 ? "HIGH" : "MODERATE",
            },
            community: {
              submissionId: sub.id,
              authorName: sub.author.displayName || sub.author.username,
              status: sub.verification?.status || "COMMUNITY_SUPPORTED",
              supportCount: sub.support?.count || 1,
              evidenceStrength: sub.evidence && sub.evidence.length > 0 ? "HIGH" : "MODERATE",
              quote: sub.content.slice(0, 150),
            },
            placesToFind: [],
            alternatives: [],
            imageUrl: sub.evidence?.[0]?.mediaUrl || undefined,
          });
        }
      }
    } catch (err) {
      logger.warn(
        "Community submission retrieval failed for take-home candidate enrichment",
        requestId,
        { error: (err as Error).message },
      );
    }

    // 3. Where-to-Find Resolution via SerpApi (bounded to top 2 items needing sources)
    let serpApiCallCount = 0;
    for (const item of items) {
      if ((item.placesToFind?.length || 0) < 2 && serpApiCallCount < 2) {
        serpApiCallCount++;
        try {
          const externalPlaces = await this.serpApi.searchPlaces(
            {
              destination: destination.name,
              query: `${item.name} shop store`,
            },
            { requestId },
          );

          if (externalPlaces && externalPlaces.length > 0) {
            const currentSources = item.placesToFind || [];
            const seenNames = new Set(currentSources.map((s) => s.name.toLowerCase()));

            for (const ep of externalPlaces.slice(0, 3)) {
              if (!seenNames.has(ep.name.toLowerCase())) {
                seenNames.add(ep.name.toLowerCase());
                const sourceDto: TakeHomeSourceDto = {
                  externalId: ep.externalId,
                  name: ep.name,
                  type: "STORE",
                  address: ep.address || undefined,
                  location:
                    ep.latitude && ep.longitude
                      ? { lat: ep.latitude, lng: ep.longitude }
                      : undefined,
                  rating: ep.rating || undefined,
                  reviewCount: ep.reviewCount || undefined,
                  website: ep.website || undefined,
                  thumbnailUrl: ep.thumbnailUrl || undefined,
                  source: "SERPAPI",
                };
                currentSources.push(sourceDto);
              }
            }
            item.placesToFind = currentSources;
          }
        } catch {
          // Gracefully continue with internal default sources
        }
      }
    }

    return items;
  }

  private mapCanonicalToDto(canonical: CanonicalTakeHomeDefinition): TakeHomeItemDto {
    return {
      id: canonical.id,
      name: canonical.name,
      category: canonical.category,
      categories: canonical.categories || [canonical.category],
      destinationId: canonical.destinationId,
      destinationName: canonical.destinationName,
      description: canonical.description,
      whyTakeHome: canonical.whyTakeHome,
      localRelevance: canonical.localRelevance,
      goodFor: canonical.goodFor,
      budget: canonical.budget,
      source: "INTERNAL",
      confidence: {
        score: canonical.confidenceScore,
        evidenceStrength: canonical.evidenceStrength,
      },
      placesToFind: [...canonical.defaultSources],
      alternatives: canonical.alternatives ? [...canonical.alternatives] : [],
      imageUrl: canonical.imageUrl,
    };
  }
}

export const takeHomeCandidateCollector = new TakeHomeCandidateCollector();
