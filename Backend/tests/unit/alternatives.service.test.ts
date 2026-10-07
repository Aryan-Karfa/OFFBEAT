import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlternativesService } from "../../src/modules/alternatives/alternatives.service.js";
import { MockReasoningProvider } from "../../src/integrations/gemini/gemini.mock.js";
import { GeminiService } from "../../src/integrations/gemini/gemini.service.js";
import type { PlaceWithDetails } from "../../src/modules/places/places.types.js";
import { DestinationStatus, PlaceStatus } from "@prisma/client";

describe("Phase 12: AlternativesService Unit Tests", () => {
  let mockPlacesRepo: any;
  let mockGenerator: any;
  let mockScorer: any;
  let mockCommunity: any;
  let mockTime: any;
  let mockCrowd: any;
  let geminiService: GeminiService;
  let service: AlternativesService;

  const sampleOriginalPlace: PlaceWithDetails = {
    id: "place_tiger_hill",
    name: "Tiger Hill",
    slug: "tiger-hill",
    destinationId: "dest_darjeeling",
    description: "Famous sunrise point",
    latitude: 27.012,
    longitude: 88.261,
    address: "Senchal Forest",
    website: null,
    phone: null,
    imageUrl: null,
    status: PlaceStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    destination: {
      id: "dest_darjeeling",
      regionId: "IN-WB",
      name: "Darjeeling",
      slug: "darjeeling",
      description: null,
      coordinates: null,
      imageUrl: null,
      status: DestinationStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: [],
  };

  const sampleCandidate = {
    id: "place_batasia_loop",
    name: "Batasia Loop",
    destination: "Darjeeling",
    categories: ["Mountain"],
    description: "Spiral railway viewpoint",
    source: "INTERNAL" as const,
  };

  beforeEach(() => {
    mockPlacesRepo = {
      findPlaceByIdOrSlug: vi.fn().mockResolvedValue(sampleOriginalPlace),
    };
    mockGenerator = {
      generateCandidates: vi.fn().mockResolvedValue([sampleCandidate]),
    };
    mockScorer = {
      scoreCandidate: vi.fn().mockReturnValue({
        placeId: "place_batasia_loop",
        name: "Batasia Loop",
        destination: "Darjeeling",
        categories: ["Mountain"],
        source: "INTERNAL",
        why: "Pairs naturally with Tiger Hill",
        timeFit: "GOOD",
        crowdFit: "GOOD",
        score: 85,
        rawScore: 0.85,
      }),
    };
    mockCommunity = {
      getCommunitySignalsForPlace: vi.fn().mockResolvedValue({
        submissionCount: 2,
        usefulCount: 5,
        confirmCount: 2,
        verifiedCount: 1,
        highlights: [],
      }),
    };
    mockTime = {
      getTimeIntelligenceForPlace: vi.fn().mockResolvedValue({
        timeFit: "GOOD",
        recommendedTimes: [{ start: "05:00", end: "06:00", reason: "Dawn" }],
      }),
    };
    mockCrowd = {
      getCrowdIntelligenceForPlace: vi.fn().mockResolvedValue({
        overall: "LOW",
        crowdFit: "LOWER_CROWD_MATCH",
      }),
    };

    const mockReasoningProvider = new MockReasoningProvider();
    geminiService = new GeminiService(mockReasoningProvider, {
      apiKey: "test-key",
      model: "gemini-3.8-flash",
      timeoutMs: 5000,
      maxRetries: 1,
      enabled: true,
    });

    service = new AlternativesService(
      mockPlacesRepo,
      mockGenerator,
      mockScorer,
      mockCommunity,
      mockTime,
      mockCrowd,
      geminiService,
    );
  });

  it("finds alternatives successfully and returns structured recommendation", async () => {
    const result = await service.findAlternatives("place_tiger_hill", {
      mode: "ENHANCEMENT",
      travelTaste: ["mountain"],
      experienceTaste: ["sunrise"],
      dayNight: "DAY",
      limit: 5,
    });

    expect(result.originalPlace.name).toBe("Tiger Hill");
    expect(result.mode).toBe("ENHANCEMENT");
    expect(result.alternatives.length).toBe(1);
    expect(result.alternatives[0]?.name).toBe("Batasia Loop");
    expect(result.reasoning).toBeDefined();
    expect(result.reasoning?.explanation).toContain("Batasia Loop");
    expect(result.fallback).toBe(false);
  });

  it("gracefully falls back to deterministic reasoning on Gemini error", async () => {
    const failingProvider = new MockReasoningProvider({ shouldFail: true });
    const failingGeminiService = new GeminiService(failingProvider, {
      apiKey: "test-key",
      model: "gemini-3.8-flash",
      timeoutMs: 1000,
      maxRetries: 0,
      enabled: true,
    });

    const fallbackService = new AlternativesService(
      mockPlacesRepo,
      mockGenerator,
      mockScorer,
      mockCommunity,
      mockTime,
      mockCrowd,
      failingGeminiService,
    );

    const result = await fallbackService.findAlternatives("place_tiger_hill", {
      mode: "ENHANCEMENT",
      travelTaste: ["mountain"],
      experienceTaste: ["sunrise"],
      dayNight: "DAY",
      limit: 5,
    });

    expect(result.fallback).toBe(true);
    expect(result.reasoning?.source).toBe("DETERMINISTIC");
    expect(result.reasoning?.explanation).toContain("Batasia Loop");
    expect(result.alternatives.length).toBe(1);
  });

  it("returns clean empty state when candidate generator finds no places", async () => {
    mockGenerator.generateCandidates.mockResolvedValue([]);

    const result = await service.findAlternatives("place_tiger_hill", {
      mode: "NEARBY_DISCOVERY",
      travelTaste: [],
      experienceTaste: [],
      dayNight: "DAY",
      limit: 5,
    });

    expect(result.alternatives).toHaveLength(0);
    expect(result.fallback).toBe(true);
    expect(result.reasoning?.explanation).toContain("couldn't find a strong alternative");
  });

  it("throws NotFoundError when place is not found in database", async () => {
    mockPlacesRepo.findPlaceByIdOrSlug.mockResolvedValue(null);

    await expect(
      service.findAlternatives("non_existent_place", {
        mode: "REPLACEMENT",
        travelTaste: [],
        experienceTaste: [],
        dayNight: "DAY",
        limit: 5,
      }),
    ).rejects.toThrow("Place with identifier 'non_existent_place' not found");
  });
});
