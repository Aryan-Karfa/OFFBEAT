import { describe, it, expect } from "vitest";
import { SerpApiNormalizer } from "../../src/integrations/serpapi/serpapi.normalizer.js";
import {
  GoogleMapsSearchAdapter,
  GoogleMapsPlaceAdapter,
  GoogleMapsReviewsAdapter,
} from "../../src/integrations/serpapi/serpapi.adapter.js";
import { SerpApiInvalidResponseError } from "../../src/integrations/serpapi/serpapi.errors.js";

describe("SerpApiNormalizer & Adapters", () => {
  describe("normalizeLocalResult", () => {
    it("should normalize a complete Google Maps local result", () => {
      const raw = {
        position: 1,
        title: "Tiger Hill Sunrise Point",
        place_id: "ChIJ_tiger_hill",
        data_id: "0x39e440:0x123",
        reviews: 4500,
        rating: 4.6,
        type: "scenic viewpoint",
        types: ["scenic viewpoint", "tourist attraction"],
        address: "Senchal Forest, Darjeeling, West Bengal 734102",
        hours: "Open 24 hours",
        phone: "+91 354 225 4200",
        website: "https://darjeeling.gov.in",
        thumbnail: "https://lh5.googleusercontent.com/p/tiger_hill.jpg",
        gps_coordinates: {
          latitude: 27.01234,
          longitude: 88.26123,
        },
        links: {
          directions: "https://maps.google.com/directions?tiger_hill",
        },
      };

      const normalized = SerpApiNormalizer.normalizeLocalResult(raw);

      expect(normalized.provider).toBe("SERPAPI");
      expect(normalized.externalId).toBe("ChIJ_tiger_hill");
      expect(normalized.name).toBe("Tiger Hill Sunrise Point");
      expect(normalized.latitude).toBe(27.01234);
      expect(normalized.longitude).toBe(88.26123);
      expect(normalized.rating).toBe(4.6);
      expect(normalized.reviewCount).toBe(4500);
      expect(normalized.categories).toContain("Photography");
      expect(normalized.categories).toContain("Tourist attraction");
      expect(normalized.address).toBe("Senchal Forest, Darjeeling, West Bengal 734102");
      expect(normalized.sourceUrl).toBe("https://maps.google.com/directions?tiger_hill");
    });

    it("should preserve null for omitted fields rather than injecting fake zeroes", () => {
      const partial = {
        title: "Unnamed Viewpoint",
        place_id: "place_999",
      };

      const normalized = SerpApiNormalizer.normalizeLocalResult(partial);

      expect(normalized.name).toBe("Unnamed Viewpoint");
      expect(normalized.rating).toBeNull();
      expect(normalized.reviewCount).toBeNull();
      expect(normalized.latitude).toBeNull();
      expect(normalized.longitude).toBeNull();
      expect(normalized.phone).toBeNull();
      expect(normalized.website).toBeNull();
    });

    it("should handle missing title with fallback without throwing", () => {
      const result = SerpApiNormalizer.normalizeLocalResult({});
      expect(result.name).toBe("Unknown Place");
      expect(result.externalId).toBeDefined();
    });
  });

  describe("normalizeCategories", () => {
    it("should map known aliases to canonical OFFBEAT categories", () => {
      const categories = SerpApiNormalizer.normalizeCategories([
        "mountain peak",
        "historic site",
        "art museum",
        "scenic viewpoint",
        "nature reserve",
        "fortress",
      ]);

      expect(categories).toContain("Mountain");
      expect(categories).toContain("Historical");
      expect(categories).toContain("Culture");
      expect(categories).toContain("Photography");
      expect(categories).toContain("Nature");
      expect(categories).toContain("Heritage");
    });
  });

  describe("GoogleMapsSearchAdapter", () => {
    it("should adapt valid local_results array", () => {
      const mockResponse = {
        local_results: [
          { title: "Place A", place_id: "id_a", rating: 4.5 },
          { title: "Place B", place_id: "id_b", rating: 4.0 },
        ],
      };

      const places = GoogleMapsSearchAdapter.adapt(mockResponse);
      expect(places).toHaveLength(2);
      expect(places[0]?.name).toBe("Place A");
      expect(places[1]?.name).toBe("Place B");
    });

    it("should return empty array when local_results is missing or empty", () => {
      expect(GoogleMapsSearchAdapter.adapt({})).toEqual([]);
      expect(GoogleMapsSearchAdapter.adapt({ local_results: [] })).toEqual([]);
    });

    it("should throw SerpApiInvalidResponseError for non-object responses", () => {
      expect(() => GoogleMapsSearchAdapter.adapt(null)).toThrow(SerpApiInvalidResponseError);
      expect(() => GoogleMapsSearchAdapter.adapt("invalid string")).toThrow(
        SerpApiInvalidResponseError,
      );
    });
  });

  describe("GoogleMapsPlaceAdapter", () => {
    it("should adapt place_results into NormalizedExternalPlace", () => {
      const mockResponse = {
        place_results: {
          title: "Victoria Memorial",
          place_id: "place_vm_123",
          rating: 4.8,
          reviews: 12000,
          type: "history museum",
          gps_coordinates: { latitude: 22.5448, longitude: 88.3426 },
        },
      };

      const place = GoogleMapsPlaceAdapter.adapt(mockResponse);
      expect(place.name).toBe("Victoria Memorial");
      expect(place.externalId).toBe("place_vm_123");
      expect(place.latitude).toBe(22.5448);
      expect(place.categories).toContain("Historical");
    });

    it("should throw SerpApiInvalidResponseError if place_results is missing", () => {
      expect(() => GoogleMapsPlaceAdapter.adapt({})).toThrow(SerpApiInvalidResponseError);
    });
  });

  describe("GoogleMapsReviewsAdapter", () => {
    it("should adapt reviews and place_info", () => {
      const mockResponse = {
        place_info: {
          title: "Munnar Tea Gardens",
          rating: 4.7,
          reviews: 500,
        },
        reviews: [
          {
            review_id: "rev_1",
            user: { name: "Traveler Jane" },
            rating: 5,
            snippet: "Breathtaking views and fresh air!",
            date: "2 weeks ago",
          },
        ],
        serpapi_pagination: {
          next_page_token: "page_token_xyz",
        },
      };

      const result = GoogleMapsReviewsAdapter.adapt(mockResponse);
      expect(result.placeInfo?.title).toBe("Munnar Tea Gardens");
      expect(result.reviews).toHaveLength(1);
      const firstReview = result.reviews[0];
      expect(firstReview?.authorName).toBe("Traveler Jane");
      expect(firstReview?.rating).toBe(5);
      expect(firstReview?.text).toBe("Breathtaking views and fresh air!");
      expect(result.nextPageToken).toBe("page_token_xyz");
    });
  });
});
