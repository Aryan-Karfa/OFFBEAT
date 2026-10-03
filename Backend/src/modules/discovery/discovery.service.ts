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
import type { SearchQueryContext } from "@offbeat/shared";

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

    // 2. Build Normalized DiscoveryContext
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
    const page = request.page;
    const limit = request.limit;
    const total = diversifiedCandidates.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedWindow = diversifiedCandidates.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + paginatedWindow.length < total;

    // 9. Transform to Output DTOs
    const results: DiscoveryResultItemDto[] = paginatedWindow.map((item) => ({
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
    }));

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
    };
  }
}

export const discoveryService = new DiscoveryService();
