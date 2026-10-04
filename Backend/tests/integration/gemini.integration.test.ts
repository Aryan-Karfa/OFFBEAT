import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { geminiService } from "../../src/integrations/gemini/gemini.service.js";
import { MockReasoningProvider } from "../../src/integrations/gemini/gemini.mock.js";
import { serpApiService } from "../../src/integrations/serpapi/serpapi.service.js";
import type { NormalizedExternalPlace } from "../../src/integrations/serpapi/serpapi.types.js";

describe("Phase 11: Gemini Intelligence Layer Integration Tests", () => {
  const app = createApp();
  let mockProvider: MockReasoningProvider;

  const mockExternalPlaces: NormalizedExternalPlace[] = [
    {
      provider: "SERPAPI",
      externalId: "ext_tiger_hill_001",
      placeId: "ChIJ_tiger_hill",
      name: "Tiger Hill Sunrise Viewpoint",
      categories: ["Scenic Point", "Mountain View"],
      latitude: 27.0083,
      longitude: 88.2869,
      rating: 4.8,
      reviewCount: 3500,
      description: "Iconic mountain peak providing panoramic sunrise vistas of Kanchenjunga.",
    },
  ];

  beforeEach(() => {
    mockProvider = new MockReasoningProvider();
    geminiService.setProvider(mockProvider);
    vi.spyOn(serpApiService, "searchPlaces").mockResolvedValue(mockExternalPlaces);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POST /api/v1/discover — enriches discovery response with contextual reasoning", async () => {
    const res = await request(app)
      .post("/api/v1/discover")
      .send({
        regionId: "IN-WB",
        travelTaste: ["mountains", "photography"],
        experienceTaste: ["sunrise", "peaceful"],
        dayNight: "DAY",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.results.length).toBeGreaterThan(0);

    // Verify response-level reasoning metadata
    expect(data.reasoning).toBeDefined();
    expect(data.reasoning.source).toBe("GEMINI");
    expect(data.reasoning.summary).toBeDefined();
    expect(data.reasoning.reasons.length).toBeGreaterThan(0);

    // Verify primary item has reasoning attached
    const primaryItem = data.results[0];
    expect(primaryItem.reasoning).toBeDefined();
    expect(primaryItem.reasoning?.source).toBe("GEMINI");
    expect(primaryItem.reasoning?.summary).toBeDefined();

    // Verify candidate allowlist integrity
    const candidateIds = data.results.map((r: { place: { id: string } }) => r.place.id);
    expect(candidateIds).toContain(primaryItem.place.id);
  });

  it("POST /api/v1/discover — gracefully falls back to deterministic reasoning when provider fails", async () => {
    mockProvider.setOptions({
      shouldFail: true,
    });

    const res = await request(app)
      .post("/api/v1/discover")
      .send({
        regionId: "IN-WB",
        travelTaste: ["mountains"],
        experienceTaste: ["peaceful"],
        dayNight: "DAY",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.results.length).toBeGreaterThan(0);

    // Verify deterministic fallback reasoning is attached without crashing the endpoint
    expect(data.reasoning).toBeDefined();
    expect(data.reasoning.source).toBe("DETERMINISTIC");
    expect(data.reasoning.summary).toBeDefined();
    expect(data.reasoning.reasons.length).toBeGreaterThan(0);
    expect(data.reasoning.contextualNotes[1]).toContain("Reasoning fallback applied");
  });
});
