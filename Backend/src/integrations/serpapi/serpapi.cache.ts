import crypto from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma, isDatabaseConnected } from "../../lib/db/prisma.js";
import { logger } from "../../lib/logger/logger.js";
import { serpApiConfig } from "./serpapi.config.js";
import type { CacheCategory } from "./serpapi.types.js";

interface InMemoryCacheEntry {
  response: unknown;
  query: unknown;
  expiresAt: number; // millisecond timestamp
}

export class SerpApiCache {
  // In-process single-flight request coalescing
  private static inFlightRequests = new Map<string, Promise<unknown>>();

  // In-memory fallback and fast-path cache
  private static memoryCache = new Map<string, InMemoryCacheEntry>();

  /**
   * Sorts object keys recursively to produce a strictly deterministic JSON representation.
   */
  private static canonicalize(value: unknown): unknown {
    if (value === null || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.canonicalize(item));
    }

    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>).sort();

    for (const key of keys) {
      const val = (value as Record<string, unknown>)[key];
      if (val !== undefined) {
        sortedObj[key] = this.canonicalize(val);
      }
    }

    return sortedObj;
  }

  /**
   * Generates a deterministic SHA-256 hash from request parameters.
   */
  public static generateCacheKey(provider: string, params: Record<string, unknown>): string {
    const canonicalParams = this.canonicalize({
      provider: provider.toUpperCase(),
      ...params,
    });
    const serialized = JSON.stringify(canonicalParams);
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Calculates TTL in seconds for a specific cache category.
   */
  public static getTtlSeconds(category: CacheCategory): number {
    return serpApiConfig.ttlSeconds[category] || serpApiConfig.ttlSeconds.default;
  }

  /**
   * Single-flight execution: coalesces simultaneous identical calls into one.
   */
  public static async executeSingleFlight<T>(
    cacheKey: string,
    action: () => Promise<T>,
  ): Promise<T> {
    const existing = this.inFlightRequests.get(cacheKey) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }

    const promise = (async () => {
      try {
        return await action();
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  /**
   * Retrieves valid cached response if present and not expired.
   */
  public static async get<T>(queryHash: string): Promise<T | null> {
    const now = Date.now();

    // 1. Check in-memory cache
    const memEntry = this.memoryCache.get(queryHash);
    if (memEntry && memEntry.expiresAt > now) {
      return memEntry.response as T;
    }

    // 2. Check Database cache if DB is connected
    if (isDatabaseConnected()) {
      try {
        const cached = await prisma.searchCache.findUnique({
          where: { queryHash },
        });

        if (cached) {
          const expiresAtMs = cached.expiresAt.getTime();
          if (expiresAtMs > now) {
            // Populate memory cache for subsequent fast reads
            this.memoryCache.set(queryHash, {
              response: cached.response,
              query: cached.query,
              expiresAt: expiresAtMs,
            });
            return cached.response as T;
          }
        }
      } catch (err) {
        logger.warn(
          "SearchCache database read error, falling back to memory",
          undefined,
          {},
          err as Error,
        );
      }
    }

    return null;
  }

  /**
   * Retrieves cached response even if expired (for graceful degradation during provider outage).
   */
  public static async getStale<T>(queryHash: string): Promise<T | null> {
    const memEntry = this.memoryCache.get(queryHash);
    if (memEntry) {
      return memEntry.response as T;
    }

    if (isDatabaseConnected()) {
      try {
        const cached = await prisma.searchCache.findUnique({
          where: { queryHash },
        });
        if (cached) {
          return cached.response as T;
        }
      } catch {
        // Silent catch for stale fallback
      }
    }

    return null;
  }

  /**
   * Stores response in cache with specified TTL.
   */
  public static async set(
    provider: string,
    queryHash: string,
    query: unknown,
    response: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // 1. Store in memory
    this.memoryCache.set(queryHash, {
      response,
      query,
      expiresAt: expiresAt.getTime(),
    });

    // 2. Store in Database if connected
    if (isDatabaseConnected()) {
      try {
        await prisma.searchCache.upsert({
          where: { queryHash },
          create: {
            provider,
            queryHash,
            query: (query ?? {}) as Prisma.InputJsonValue,
            response: (response ?? {}) as Prisma.InputJsonValue,
            expiresAt,
          },
          update: {
            response: (response ?? {}) as Prisma.InputJsonValue,
            expiresAt,
          },
        });
      } catch (err) {
        logger.warn("SearchCache database write error", undefined, {}, err as Error);
      }
    }
  }

  /**
   * Clears in-memory cache (primarily for test resets).
   */
  public static clearMemoryCache(): void {
    this.memoryCache.clear();
    this.inFlightRequests.clear();
  }
}
