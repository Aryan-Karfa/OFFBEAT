import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { serpApiService } from "../../src/integrations/serpapi/serpapi.service.js";
import { placeRepository } from "../../src/modules/places/places.repository.js";
import type { NormalizedExternalPlace } from "@offbeat/shared";

describe("Discovery Engine API Integration Tests", () => {
  const app = createApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockExternalPlaces: NormalizedExternalPlace[] = [
    {
      provider: "SERPAPI",
      externalId: "ext_sandakphu",
      placeId: "ChIJ_sandakphu",
      name: "Sandakphu Trekker Viewpoint",
      description: "Highest panoramic ridge in West Bengal overlooking Everest and Kanchenjunga.",
      address: "Singalila, Darjeeling, West Bengal",
      latitude: 27.1,
      longitude: 88.0,
      categories: ["Scenic viewpoint", "Mountain peak", "Sunrise view"],
      rating: 4.9,
      reviewCount: 980,
      thumbnailUrl: "https://example.com/sandakphu.jpg",
      openingHours: ["Open 24 hours"],
    },
  ];

  it("POST /api/v1/discover — should return 200 with ranked results, explanations, and metadata for valid context", async () => {
    vi.spyOn(serpApiService, "searchPlaces").mockResolvedValueOnce(mockExternalPlaces);

    const payload = {
      regionId: "IN-WB",
      travelTaste: ["mountains", "photography"],
      experienceTaste: ["sunrise", "peaceful", "nature"],
      dayNight: "DAY",
      preferredTime: "EARLY_MORNING",
      intent: "DISCOVER_PLACES",
      page: 1,
      limit: 12,
    };

    const res = await request(app)
      .post("/api/v1/discover")
      .send(payload)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.context).toBeDefined();
    expect(data.context.regionId).toBe("IN-WB");
    expect(data.context.region).toBe("West Bengal");
    expect(data.context.travelTaste).toEqual(["mountains", "photography"]);
    expect(data.context.experienceTaste).toEqual(["sunrise", "peaceful", "nature"]);
    expect(data.context.dayNight).toBe("DAY");

    // Results evaluation
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(0);

    const topResult = data.results[0];
    expect(topResult.place).toBeDefined();
    expect(topResult.place.name).toBeDefined();
    expect(topResult.score).toBeGreaterThan(0);
    expect(Array.isArray(topResult.why)).toBe(true);
    expect(topResult.why.length).toBeGreaterThan(0);
    expect(topResult.source).toBeDefined();
    expect(["INTERNAL", "EXTERNAL", "COMBINED"]).toContain(topResult.source.type);

    // Verify pagination envelope
    expect(data.pagination).toEqual({
      page: 1,
      limit: 12,
      total: expect.any(Number),
      totalPages: expect.any(Number),
      hasMore: expect.any(Boolean),
    });

    // Request ID tracking
    expect(res.body.meta.requestId).toBeDefined();
  });

  it("POST /api/v1/discover — should return 400 VALIDATION_ERROR for missing regionId", async () => {
    const res = await request(app)
      .post("/api/v1/discover")
      .send({
        travelTaste: ["mountains"],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.meta.requestId).toBeDefined();
  });

  it("POST /api/v1/discover — should return 404 NOT_FOUND for non-existent region identifier", async () => {
    const res = await request(app).post("/api/v1/discover").send({
      regionId: "non-existent-region-id-999",
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.meta.requestId).toBeDefined();
  });

  it("POST /api/v1/discover — should gracefully degrade to internal places when SerpApi fails (partial failure)", async () => {
    // Simulate SerpApi failure (network error or provider outage)
    vi.spyOn(serpApiService, "searchPlaces").mockRejectedValueOnce(
      new Error("SerpApi network timeout"),
    );

    const res = await request(app)
      .post("/api/v1/discover")
      .send({
        regionId: "IN-WB",
        travelTaste: ["mountains"],
        experienceTaste: ["sunrise"],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fallback).toBe(true);
    expect(res.body.data.notice).toContain("temporarily unavailable");
    expect(res.body.data.results.length).toBeGreaterThan(0);

    // All results in fallback should be internal
    expect(res.body.data.results[0].source.type).toBe("INTERNAL");
  });

  it("POST /api/v1/discover — should return 200 with empty results when no candidates exist (not an error)", async () => {
    // Simulate empty internal and empty external
    vi.spyOn(placeRepository, "findPlacesByRegion").mockResolvedValueOnce([]);
    vi.spyOn(serpApiService, "searchPlaces").mockResolvedValueOnce([]);

    const res = await request(app).post("/api/v1/discover").send({
      regionId: "IN-WB",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results).toEqual([]);
    expect(res.body.data.pagination.total).toBe(0);
    expect(res.body.data.pagination.hasMore).toBe(false);
  });

  it("POST /api/v1/discover — should correctly respect pagination windows", async () => {
    vi.spyOn(serpApiService, "searchPlaces").mockResolvedValueOnce(mockExternalPlaces);

    const res = await request(app).post("/api/v1/discover").send({
      regionId: "IN-WB",
      page: 1,
      limit: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.results.length).toBe(1);
    expect(res.body.data.pagination.limit).toBe(1);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.hasMore).toBe(true);
  });
});
