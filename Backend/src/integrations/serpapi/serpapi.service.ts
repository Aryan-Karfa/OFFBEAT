import type { Prisma } from "@prisma/client";
import { prisma, isDatabaseConnected } from "../../lib/db/prisma.js";
import { logger } from "../../lib/logger/logger.js";
import { SerpApiClient } from "./serpapi.client.js";
import { SerpApiQueryBuilder } from "./serpapi.query-builder.js";
import {
  GoogleMapsSearchAdapter,
  GoogleMapsPlaceAdapter,
  GoogleMapsReviewsAdapter,
} from "./serpapi.adapter.js";
import { SerpApiCache } from "./serpapi.cache.js";
import type {
  NormalizedExternalPlace,
  NormalizedExternalReviewsResult,
  ExternalPlaceReferenceDto,
  SearchQueryContext,
  GeoLocation,
  SerpApiMapsSearchResponse,
  SerpApiMapsPlaceResponse,
  SerpApiMapsReviewsResponse,
} from "./serpapi.types.js";

export class SerpApiService {
  private client: SerpApiClient;

  // In-memory fallback for offline test environments and database resilience
  private static memoryReferences = new Map<string, ExternalPlaceReferenceDto>();

  constructor(client?: SerpApiClient) {
    this.client = client || new SerpApiClient();
  }

  /**
   * Searches for places on Google Maps via SerpApi with query normalization,
   * caching, request deduplication, and graceful degradation.
   */
  public async searchPlaces(
    context: SearchQueryContext,
    options?: { requestId?: string; bypassCache?: boolean },
  ): Promise<NormalizedExternalPlace[]> {
    const requestId = options?.requestId;
    const searchParams = SerpApiQueryBuilder.buildMapsSearchQuery(context);
    const cacheKey = SerpApiCache.generateCacheKey("SERPAPI", searchParams);

    // 1. Check cache if not bypassed
    if (!options?.bypassCache) {
      const cached = await SerpApiCache.get<NormalizedExternalPlace[]>(cacheKey);
      if (cached) {
        logger.info("Search cache hit for Google Maps search", requestId, {
          cacheKey,
          resultCount: cached.length,
        });
        return cached;
      }
    }

    // 2. Execute with single-flight request coalescing
    return SerpApiCache.executeSingleFlight(cacheKey, async () => {
      logger.info("Search cache miss, executing SerpApi search", requestId, {
        engine: searchParams.engine,
        query: searchParams.q,
      });

      try {
        const raw = await this.client.execute<SerpApiMapsSearchResponse>(searchParams, {
          requestId,
        });
        const normalized = GoogleMapsSearchAdapter.adapt(raw);

        // Populate search cache (TTL: 24 hours)
        const ttl = SerpApiCache.getTtlSeconds("searchResults");
        await SerpApiCache.set("SERPAPI", cacheKey, searchParams, normalized, ttl);

        logger.info("Successfully fetched and normalized places from SerpApi", requestId, {
          resultCount: normalized.length,
        });

        return normalized;
      } catch (err: unknown) {
        // Graceful degradation: attempt to return stale cached results during provider outages
        const stale = await SerpApiCache.getStale<NormalizedExternalPlace[]>(cacheKey);
        if (stale && stale.length > 0) {
          logger.warn(
            "SerpApi search failed; serving stale cached results as graceful fallback",
            requestId,
            {
              error: err instanceof Error ? err.message : String(err),
              staleCount: stale.length,
            },
          );
          return stale;
        }

        throw err;
      }
    });
  }

  /**
   * Retrieves detailed place information from Google Maps via SerpApi.
   */
  public async getPlaceDetails(
    params: { placeId?: string; dataId?: string; coordinates?: GeoLocation },
    options?: { requestId?: string; bypassCache?: boolean },
  ): Promise<NormalizedExternalPlace> {
    const requestId = options?.requestId;
    const searchParams = SerpApiQueryBuilder.buildPlaceDetailsQuery(params);
    const cacheKey = SerpApiCache.generateCacheKey("SERPAPI", searchParams);

    if (!options?.bypassCache) {
      const cached = await SerpApiCache.get<NormalizedExternalPlace>(cacheKey);
      if (cached) {
        logger.info("Search cache hit for place details", requestId, { cacheKey });
        return cached;
      }
    }

    return SerpApiCache.executeSingleFlight(cacheKey, async () => {
      logger.info("Fetching place details from SerpApi", requestId, { searchParams });

      try {
        const raw = await this.client.execute<SerpApiMapsPlaceResponse>(searchParams, {
          requestId,
        });
        const normalized = GoogleMapsPlaceAdapter.adapt(raw);

        // Cache place metadata (TTL: 7 days)
        const ttl = SerpApiCache.getTtlSeconds("placeMetadata");
        await SerpApiCache.set("SERPAPI", cacheKey, searchParams, normalized, ttl);

        return normalized;
      } catch (err: unknown) {
        const stale = await SerpApiCache.getStale<NormalizedExternalPlace>(cacheKey);
        if (stale) {
          logger.warn("SerpApi place details failed; serving stale cached result", requestId, {
            error: err instanceof Error ? err.message : String(err),
          });
          return stale;
        }
        throw err;
      }
    });
  }

  /**
   * Retrieves place reviews from Google Maps via SerpApi.
   */
  public async getPlaceReviews(
    params: { dataId?: string; placeId?: string; nextPageToken?: string },
    options?: { requestId?: string; bypassCache?: boolean },
  ): Promise<NormalizedExternalReviewsResult> {
    const requestId = options?.requestId;
    const searchParams = SerpApiQueryBuilder.buildReviewsQuery(params);
    const cacheKey = SerpApiCache.generateCacheKey("SERPAPI", searchParams);

    if (!options?.bypassCache) {
      const cached = await SerpApiCache.get<NormalizedExternalReviewsResult>(cacheKey);
      if (cached) {
        logger.info("Search cache hit for place reviews", requestId, { cacheKey });
        return cached;
      }
    }

    return SerpApiCache.executeSingleFlight(cacheKey, async () => {
      logger.info("Fetching reviews from SerpApi", requestId, { searchParams });

      try {
        const raw = await this.client.execute<SerpApiMapsReviewsResponse>(searchParams, {
          requestId,
        });
        const normalized = GoogleMapsReviewsAdapter.adapt(raw);

        // Cache reviews (TTL: 24 hours)
        const ttl = SerpApiCache.getTtlSeconds("reviews");
        await SerpApiCache.set("SERPAPI", cacheKey, searchParams, normalized, ttl);

        return normalized;
      } catch (err: unknown) {
        const stale = await SerpApiCache.getStale<NormalizedExternalReviewsResult>(cacheKey);
        if (stale) {
          logger.warn("SerpApi reviews failed; serving stale cached reviews", requestId, {
            error: err instanceof Error ? err.message : String(err),
          });
          return stale;
        }
        throw err;
      }
    });
  }

  /**
   * Persists or updates an ExternalPlaceReference in the database.
   * Deterministically links with an internal place if matched or passed.
   */
  public async syncExternalPlaceReference(
    place: NormalizedExternalPlace,
    targetPlaceId?: string,
  ): Promise<ExternalPlaceReferenceDto> {
    const provider = place.provider.toUpperCase();
    const externalId = place.externalId;
    let resolvedPlaceId = targetPlaceId || place.placeId || null;

    // Check DB connectivity
    if (isDatabaseConnected()) {
      try {
        // If not directly specified, attempt deterministic match against internal Place by exact slug/name
        if (!resolvedPlaceId) {
          const slugCandidate = place.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-");
          const existingPlace = await prisma.place.findFirst({
            where: {
              OR: [{ slug: slugCandidate }, { name: { equals: place.name, mode: "insensitive" } }],
            },
          });
          if (existingPlace) {
            resolvedPlaceId = existingPlace.id;
          }
        }

        const now = new Date();
        const upserted = await prisma.externalPlaceReference.upsert({
          where: {
            provider_externalId: {
              provider,
              externalId,
            },
          },
          create: {
            provider,
            externalId,
            placeId: resolvedPlaceId,
            sourceUrl: place.sourceUrl || null,
            metadata: (place.rawMetadata || {}) as Prisma.InputJsonValue,
            lastSyncedAt: now,
          },
          update: {
            placeId: resolvedPlaceId || undefined,
            sourceUrl: place.sourceUrl || undefined,
            metadata: (place.rawMetadata || {}) as Prisma.InputJsonValue,
            lastSyncedAt: now,
          },
        });

        return {
          id: upserted.id,
          placeId: upserted.placeId,
          provider: upserted.provider,
          externalId: upserted.externalId,
          sourceUrl: upserted.sourceUrl,
          metadata: upserted.metadata as Record<string, unknown> | null,
          lastSyncedAt: upserted.lastSyncedAt.toISOString(),
          createdAt: upserted.createdAt.toISOString(),
        };
      } catch (err) {
        logger.warn(
          "Database error syncing ExternalPlaceReference, using memory fallback",
          undefined,
          {},
          err as Error,
        );
      }
    }

    // In-memory fallback
    const key = `${provider}:${externalId}`;
    const now = new Date().toISOString();
    const existing = SerpApiService.memoryReferences.get(key);

    const dto: ExternalPlaceReferenceDto = {
      id: existing ? existing.id : `ref_${Math.random().toString(36).substring(7)}`,
      placeId: resolvedPlaceId || (existing ? existing.placeId : null),
      provider,
      externalId,
      sourceUrl: place.sourceUrl || (existing ? existing.sourceUrl : null),
      metadata: place.rawMetadata || (existing ? existing.metadata : null),
      lastSyncedAt: now,
      createdAt: existing ? existing.createdAt : now,
    };

    SerpApiService.memoryReferences.set(key, dto);
    return dto;
  }

  /**
   * Resets in-memory references (useful for unit tests).
   */
  public static clearMemoryReferences(): void {
    this.memoryReferences.clear();
  }
}

export const serpApiService = new SerpApiService();
