import { describe, it, expect } from "vitest";
import { SerpApiQueryBuilder } from "../../src/integrations/serpapi/serpapi.query-builder.js";
import type { SearchQueryContext } from "../../src/integrations/serpapi/serpapi.types.js";

describe("SerpApiQueryBuilder", () => {
  it("should build a deterministic search query from full travel context", () => {
    const context: SearchQueryContext = {
      country: "India",
      region: "West Bengal",
      destination: "Darjeeling",
      travelTaste: ["mountains", "photography"],
      experienceTaste: ["sunrise", "peaceful"],
      dayNight: "DAY",
      placeType: "viewpoint",
      coordinates: {
        lat: 27.041,
        lng: 88.266,
      },
    };

    const params = SerpApiQueryBuilder.buildMapsSearchQuery(context);

    expect(params.engine).toBe("google_maps");
    expect(params.type).toBe("search");
    expect(params.hl).toBe("en");
    expect(params.ll).toBe("@27.041,88.266,14z");
    expect(params.q).toContain(
      "mountains photography sunrise peaceful viewpoint places in Darjeeling, West Bengal, India",
    );
  });

  it("should sanitize and deduplicate terms in search query", () => {
    const context: SearchQueryContext = {
      destination: "Kolkata",
      region: "West Bengal",
      country: "India",
      travelTaste: ["History", "heritage", "history!"],
      experienceTaste: ["Culture", "culture"],
    };

    const params = SerpApiQueryBuilder.buildMapsSearchQuery(context);

    expect(params.q).toBe("history heritage culture places in Kolkata, West Bengal, India");
  });

  it("should format coordinates accurately with custom zoom", () => {
    const coords = { lat: 22.572645, lng: 88.363892 };
    const formatted = SerpApiQueryBuilder.formatCoordinates(coords, 12);
    expect(formatted).toBe("@22.572645,88.363892,12z");
  });

  it("should handle empty or minimal search context gracefully", () => {
    const params = SerpApiQueryBuilder.buildMapsSearchQuery({});
    expect(params.engine).toBe("google_maps");
    expect(params.type).toBe("search");
    expect(params.q).toBe("travel destinations");
    expect(params.ll).toBeUndefined();
  });

  it("should build place details query with place_id", () => {
    const params = SerpApiQueryBuilder.buildPlaceDetailsQuery({
      placeId: "ChIJ12345PlaceId",
      coordinates: { lat: 27.0, lng: 88.2 },
    });

    expect(params.engine).toBe("google_maps");
    expect(params.place_id).toBe("ChIJ12345PlaceId");
    expect(params.ll).toBe("@27,88.2,14z");
  });

  it("should build place details query with data_id if place_id is not provided", () => {
    const params = SerpApiQueryBuilder.buildPlaceDetailsQuery({
      dataId: "0x1234:0x5678",
    });

    expect(params.engine).toBe("google_maps");
    expect(params.data_id).toBe("0x1234:0x5678");
    expect(params.place_id).toBeUndefined();
  });

  it("should build reviews query with data_id, place_id and next_page_token", () => {
    const params = SerpApiQueryBuilder.buildReviewsQuery({
      dataId: "0x1234:0x5678",
      placeId: "ChIJ12345",
      nextPageToken: "token_abc123",
    });

    expect(params.engine).toBe("google_maps_reviews");
    expect(params.data_id).toBe("0x1234:0x5678");
    expect(params.next_page_token).toBe("token_abc123");
  });
});
