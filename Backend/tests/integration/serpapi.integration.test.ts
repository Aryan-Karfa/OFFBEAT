import { describe, it, expect, beforeEach, vi } from "vitest";
import { SerpApiService } from "../../src/integrations/serpapi/serpapi.service.js";
import { SerpApiClient } from "../../src/integrations/serpapi/serpapi.client.js";
import { SerpApiCache } from "../../src/integrations/serpapi/serpapi.cache.js";
import {
  SerpApiAuthenticationError,
  SerpApiProviderError,
} from "../../src/integrations/serpapi/serpapi.errors.js";
import type {
  NormalizedExternalPlace,
  SerpApiMapsSearchResponse,
  SerpApiMapsPlaceResponse,
  SerpApiMapsReviewsResponse,
} from "../../src/integrations/serpapi/serpapi.types.js";

describe("SerpApi Integration Service", () => {
  let mockClient: SerpApiClient;
  let service: SerpApiService;

  beforeEach(() => {
    SerpApiCache.clearMemoryCache();
    SerpApiService.clearMemoryReferences();

    mockClient = new SerpApiClient({ apiKey: "mock_test_key" });
    service = new SerpApiService(mockClient);
  });

  describe("searchPlaces", () => {
    it("should search and normalize places from Google Maps search results", async () => {
      const mockResponse: SerpApiMapsSearchResponse = {
        local_results: [
          {
            title: "Tiger Hill Sunrise Point",
            place_id: "place_tiger_hill_ext",
            rating: 4.7,
            reviews: 3200,
            type: "scenic viewpoint",
            types: ["scenic viewpoint"],
            address: "Darjeeling, West Bengal",
            gps_coordinates: { latitude: 27.012, longitude: 88.261 },
          },
        ],
      };

      vi.spyOn(mockClient, "execute").mockResolvedValueOnce(mockResponse);

      const places = await service.searchPlaces({
        destination: "Darjeeling",
        region: "West Bengal",
        country: "India",
        travelTaste: ["mountains", "photography"],
      });

      expect(places).toHaveLength(1);
      const place = places[0];
      expect(place?.name).toBe("Tiger Hill Sunrise Point");
      expect(place?.externalId).toBe("place_tiger_hill_ext");
      expect(place?.rating).toBe(4.7);
      expect(place?.categories).toContain("Photography");
      expect(place?.latitude).toBe(27.012);
      expect(place?.longitude).toBe(88.261);
    });

    it("should return cached results on subsequent identical search without calling client", async () => {
      const mockResponse: SerpApiMapsSearchResponse = {
        local_results: [{ title: "Kolkata Tram Depot", place_id: "place_tram_1" }],
      };

      const executeSpy = vi.spyOn(mockClient, "execute").mockResolvedValue(mockResponse);

      const context = { destination: "Kolkata", country: "India" };

      // First call (cache miss)
      const res1 = await service.searchPlaces(context);
      expect(res1).toHaveLength(1);
      expect(executeSpy).toHaveBeenCalledTimes(1);

      // Second call (cache hit)
      const res2 = await service.searchPlaces(context);
      expect(res2).toHaveLength(1);
      expect(res2[0]?.name).toBe("Kolkata Tram Depot");
      expect(executeSpy).toHaveBeenCalledTimes(1); // Still 1! Client was NOT invoked again
    });

    it("should return empty array without errors when search has no local results", async () => {
      vi.spyOn(mockClient, "execute").mockResolvedValueOnce({ local_results: [] });

      const places = await service.searchPlaces({ destination: "Remote Place" });
      expect(places).toEqual([]);
    });

    it("should deduplicate simultaneous identical requests via single-flight mechanism", async () => {
      const mockResponse: SerpApiMapsSearchResponse = {
        local_results: [{ title: "Digha Beach Walkway", place_id: "place_digha_walk" }],
      };

      const executeSpy = vi.spyOn(mockClient, "execute").mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 40));
        return mockResponse;
      });

      const context = { destination: "Digha", region: "West Bengal" };

      // Execute 3 concurrent requests simultaneously
      const [res1, res2, res3] = await Promise.all([
        service.searchPlaces(context),
        service.searchPlaces(context),
        service.searchPlaces(context),
      ]);

      expect(res1[0]?.name).toBe("Digha Beach Walkway");
      expect(res2[0]?.name).toBe("Digha Beach Walkway");
      expect(res3[0]?.name).toBe("Digha Beach Walkway");
      expect(executeSpy).toHaveBeenCalledTimes(1); // Coalesced into 1 external call
    });

    it("should provide graceful degradation by serving stale cache during provider outage", async () => {
      const mockResponse: SerpApiMapsSearchResponse = {
        local_results: [{ title: "Mehrangarh Fort", place_id: "fort_rj_1" }],
      };

      // 1. Populate cache initially
      vi.spyOn(mockClient, "execute").mockResolvedValueOnce(mockResponse);
      const initial = await service.searchPlaces({ destination: "Jodhpur" });
      expect(initial[0]?.name).toBe("Mehrangarh Fort");

      // 2. Now provider fails with 500 error
      vi.spyOn(mockClient, "execute").mockRejectedValue(
        new SerpApiProviderError("Provider unavailable"),
      );

      // 3. Service gracefully returns stale cached data instead of crashing!
      const fallback = await service.searchPlaces({ destination: "Jodhpur", travelTaste: [] });
      expect(fallback).toHaveLength(1);
      expect(fallback[0]?.name).toBe("Mehrangarh Fort");
    });
  });

  describe("getPlaceDetails", () => {
    it("should retrieve and normalize place details", async () => {
      const mockResponse: SerpApiMapsPlaceResponse = {
        place_results: {
          title: "Victoria Memorial Hall",
          place_id: "ChIJ_vm_123",
          rating: 4.8,
          reviews: 15000,
          type: "memorial",
          address: "Victoria Memorial Hall, 1, Queens Way, Kolkata 700071",
          phone: "+91 33 2223 1890",
          gps_coordinates: { latitude: 22.5448, longitude: 88.3426 },
        },
      };

      vi.spyOn(mockClient, "execute").mockResolvedValueOnce(mockResponse);

      const place = await service.getPlaceDetails({ placeId: "ChIJ_vm_123" });

      expect(place.name).toBe("Victoria Memorial Hall");
      expect(place.externalId).toBe("ChIJ_vm_123");
      expect(place.categories).toContain("Historical");
      expect(place.latitude).toBe(22.5448);
      expect(place.longitude).toBe(88.3426);
    });
  });

  describe("getPlaceReviews", () => {
    it("should retrieve and normalize place reviews with pagination token", async () => {
      const mockResponse: SerpApiMapsReviewsResponse = {
        place_info: {
          title: "Munnar Hills",
          rating: 4.8,
          reviews: 200,
        },
        reviews: [
          {
            review_id: "rev_001",
            user: { name: "Aditi S." },
            rating: 5,
            snippet: "Tranquil tea plantations and rolling fog.",
            date: "1 month ago",
          },
        ],
        serpapi_pagination: {
          next_page_token: "next_page_token_abc",
        },
      };

      vi.spyOn(mockClient, "execute").mockResolvedValueOnce(mockResponse);

      const reviewsResult = await service.getPlaceReviews({ placeId: "ChIJ_munnar" });

      expect(reviewsResult.placeInfo?.title).toBe("Munnar Hills");
      expect(reviewsResult.reviews).toHaveLength(1);
      const firstReview = reviewsResult.reviews[0];
      expect(firstReview?.authorName).toBe("Aditi S.");
      expect(firstReview?.text).toContain("Tranquil tea plantations");
      expect(reviewsResult.nextPageToken).toBe("next_page_token_abc");
    });
  });

  describe("syncExternalPlaceReference", () => {
    it("should persist an external place reference and link to place if provided", async () => {
      const normalized: NormalizedExternalPlace = {
        provider: "SERPAPI",
        externalId: "place_ext_999",
        name: "Test Scenic Point",
        categories: ["Nature"],
        sourceUrl: "https://maps.google.com/directions",
        rawMetadata: { customKey: "val" },
      };

      const ref = await service.syncExternalPlaceReference(normalized, "internal_place_123");

      expect(ref.provider).toBe("SERPAPI");
      expect(ref.externalId).toBe("place_ext_999");
      expect(ref.placeId).toBe("internal_place_123");
      expect(ref.sourceUrl).toBe("https://maps.google.com/directions");
      expect(ref.lastSyncedAt).toBeDefined();
    });

    it("should update existing reference on subsequent sync", async () => {
      const normalized: NormalizedExternalPlace = {
        provider: "SERPAPI",
        externalId: "place_ext_repeat",
        name: "Repeat Place",
        categories: [],
        sourceUrl: "https://old.url",
      };

      const firstSync = await service.syncExternalPlaceReference(normalized);
      expect(firstSync.externalId).toBe("place_ext_repeat");

      const updated = await service.syncExternalPlaceReference(
        { ...normalized, sourceUrl: "https://new.url" },
        "linked_internal_id",
      );

      expect(updated.id).toBe(firstSync.id);
      expect(updated.placeId).toBe("linked_internal_id");
      expect(updated.sourceUrl).toBe("https://new.url");
    });
  });

  describe("Error propagation", () => {
    it("should propagate authentication error without retrying indefinitely", async () => {
      vi.spyOn(mockClient, "execute").mockRejectedValueOnce(
        new SerpApiAuthenticationError("Invalid API key"),
      );

      await expect(service.searchPlaces({ destination: "Nowhere" })).rejects.toThrow(
        SerpApiAuthenticationError,
      );
    });
  });
});
