import { describe, it, expect, beforeEach } from "vitest";
import { SerpApiCache } from "../../src/integrations/serpapi/serpapi.cache.js";

describe("SerpApiCache", () => {
  beforeEach(() => {
    SerpApiCache.clearMemoryCache();
  });

  describe("generateCacheKey", () => {
    it("should generate deterministic hash regardless of parameter object key order", () => {
      const params1 = {
        engine: "google_maps",
        q: "mountain photography Darjeeling",
        ll: "@27.041,88.266,14z",
        hl: "en",
      };

      const params2 = {
        hl: "en",
        ll: "@27.041,88.266,14z",
        q: "mountain photography Darjeeling",
        engine: "google_maps",
      };

      const key1 = SerpApiCache.generateCacheKey("SERPAPI", params1);
      const key2 = SerpApiCache.generateCacheKey("SERPAPI", params2);

      expect(key1).toBe(key2);
      expect(key1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex string
    });

    it("should generate distinct hash when query parameters change", () => {
      const key1 = SerpApiCache.generateCacheKey("SERPAPI", { q: "Kolkata" });
      const key2 = SerpApiCache.generateCacheKey("SERPAPI", { q: "Darjeeling" });

      expect(key1).not.toBe(key2);
    });
  });

  describe("TTL resolution", () => {
    it("should return configured TTLs for categories", () => {
      expect(SerpApiCache.getTtlSeconds("placeMetadata")).toBe(7 * 86400);
      expect(SerpApiCache.getTtlSeconds("searchResults")).toBe(24 * 3600);
      expect(SerpApiCache.getTtlSeconds("currentOpenState")).toBe(15 * 60);
      expect(SerpApiCache.getTtlSeconds("default")).toBe(24 * 3600);
    });
  });

  describe("In-Memory Caching", () => {
    it("should store and retrieve cached entry before expiration", async () => {
      const key = "test_cache_key_1";
      const payload = [{ name: "Victoria Memorial" }];

      await SerpApiCache.set("SERPAPI", key, { q: "Kolkata" }, payload, 60);
      const cached = await SerpApiCache.get(key);

      expect(cached).toEqual(payload);
    });

    it("should return null for non-existent cache key", async () => {
      const cached = await SerpApiCache.get("non_existent_key");
      expect(cached).toBeNull();
    });

    it("should return stale entry via getStale even if expired", async () => {
      const key = "test_stale_key";
      const payload = { place: "Darjeeling Mall" };

      // Set with negative TTL (already expired)
      await SerpApiCache.set("SERPAPI", key, {}, payload, -10);

      // Normal get should return null
      expect(await SerpApiCache.get(key)).toBeNull();

      // getStale should return the payload for graceful fallback
      expect(await SerpApiCache.getStale(key)).toEqual(payload);
    });
  });

  describe("executeSingleFlight (Request Deduplication)", () => {
    it("should coalesce simultaneous calls with the same key into a single invocation", async () => {
      let callCount = 0;

      const slowTask = async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { result: "ok" };
      };

      const key = "shared_single_flight_key";

      // Trigger 3 concurrent executions
      const [res1, res2, res3] = await Promise.all([
        SerpApiCache.executeSingleFlight(key, slowTask),
        SerpApiCache.executeSingleFlight(key, slowTask),
        SerpApiCache.executeSingleFlight(key, slowTask),
      ]);

      expect(res1).toEqual({ result: "ok" });
      expect(res2).toEqual({ result: "ok" });
      expect(res3).toEqual({ result: "ok" });
      expect(callCount).toBe(1); // Invoked exactly once!
    });
  });
});
