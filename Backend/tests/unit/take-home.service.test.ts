import { describe, it, expect, vi } from "vitest";
import { TakeHomeService } from "../../src/modules/take-home/take-home.service.js";
import type { TakeHomeCandidateCollector } from "../../src/modules/take-home/take-home.candidate-collector.js";
import type { GeminiService } from "../../src/integrations/gemini/gemini.service.js";
import type { TakeHomeItemDto } from "../../src/modules/take-home/take-home.types.js";

describe("Phase 14: TakeHomeService Unit Tests", () => {
  const mockCandidates: TakeHomeItemDto[] = [
    {
      id: "item_darjeeling_tea",
      name: "Darjeeling First Flush Tea",
      category: "TEA_COFFEE",
      categories: ["TEA_COFFEE", "FOOD", "GIFT"],
      destinationId: "dest_darjeeling",
      destinationName: "Darjeeling",
      whyTakeHome: "Muscatel flavored tea with GI status.",
      localRelevance: "SIGNATURE",
      goodFor: ["GIFT", "PERSONAL"],
      source: "INTERNAL",
      confidence: { score: 0.95, evidenceStrength: "HIGH" },
      placesToFind: [
        {
          name: "Nathmulls Tea Boutique",
          type: "STORE",
          source: "INTERNAL",
        },
      ],
    },
    {
      id: "item_darjeeling_crafts",
      name: "Tibetan Woodcarvings",
      category: "HANDICRAFT",
      categories: ["HANDICRAFT", "ART"],
      destinationId: "dest_darjeeling",
      destinationName: "Darjeeling",
      whyTakeHome: "Handmade wooden curios.",
      localRelevance: "STRONGLY_ASSOCIATED",
      goodFor: ["GIFT", "COLLECTOR"],
      source: "INTERNAL",
      confidence: { score: 0.88, evidenceStrength: "HIGH" },
      placesToFind: [],
    },
  ];

  const mockCollector = {
    resolveDestination: vi.fn(async (destId?: string, placeId?: string) => ({
      id: destId || "dest_darjeeling",
      name: "Darjeeling",
      regionId: "IN-WB",
      place: placeId ? { id: placeId, name: "Tiger Hill" } : undefined,
    })),
    collectCandidates: vi.fn(async () => [...mockCandidates]),
  } as unknown as TakeHomeCandidateCollector;

  const mockGemini = {
    reasonAboutTakeHome: vi.fn(async () => ({
      selectedItemIds: ["item_darjeeling_tea", "item_darjeeling_crafts"],
      primaryItemId: "item_darjeeling_tea",
      explanation: "Darjeeling tea is the signature pick.",
      itemReasons: [{ itemId: "item_darjeeling_tea", reason: "Signature tea harvest." }],
      source: "GEMINI" as const,
    })),
    generateDeterministicTakeHomeFallback: vi.fn(() => ({
      selectedItemIds: ["item_darjeeling_tea"],
      primaryItemId: "item_darjeeling_tea",
      explanation: "Deterministic fallback explanation.",
      itemReasons: [],
      source: "DETERMINISTIC" as const,
    })),
  } as unknown as GeminiService;

  it("orchestrates destination retrieval successfully with AI reasoning", async () => {
    const service = new TakeHomeService(mockCollector, mockGemini);

    const result = await service.getTakeHomeByDestination("dest_darjeeling", {
      category: "TEA_COFFEE",
    });

    expect(result.destination.id).toBe("dest_darjeeling");
    expect(result.destination.name).toBe("Darjeeling");
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.id).toBe("item_darjeeling_tea");
    expect(result.source).toBe("GEMINI");
    expect(result.fallback).toBe(false);
  });

  it("orchestrates place-level contextual retrieval successfully", async () => {
    const service = new TakeHomeService(mockCollector, mockGemini);

    const result = await service.getTakeHomeByPlace("place_tiger_hill", {});

    expect(result.destination.name).toBe("Darjeeling");
    expect(result.place?.id).toBe("place_tiger_hill");
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("handles empty candidates truthfully without inventing products", async () => {
    const emptyCollector = {
      resolveDestination: vi.fn(async () => ({
        id: "dest_unknown",
        name: "Unknown Remote Valley",
        regionId: "IN-WB",
      })),
      collectCandidates: vi.fn(async () => []),
    } as unknown as TakeHomeCandidateCollector;

    const service = new TakeHomeService(emptyCollector, mockGemini);

    const result = await service.getTakeHomeByDestination("dest_unknown", {});

    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(result.reasoning?.explanation).toContain(
      "doesn't have enough reliable local information",
    );
  });

  it("gracefully falls back when Gemini throws an exception", async () => {
    const failingGemini = {
      reasonAboutTakeHome: vi.fn(async () => {
        throw new Error("Upstream Gemini 503 Provider Error");
      }),
      generateDeterministicTakeHomeFallback: vi.fn(() => ({
        selectedItemIds: ["item_darjeeling_tea"],
        primaryItemId: "item_darjeeling_tea",
        explanation: "Deterministic fallback applied due to timeout.",
        itemReasons: [],
        source: "DETERMINISTIC" as const,
      })),
    } as unknown as GeminiService;

    const service = new TakeHomeService(mockCollector, failingGemini);

    const result = await service.getTakeHomeByDestination("dest_darjeeling", {});

    expect(result.source).toBe("DETERMINISTIC");
    expect(result.fallback).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
  });
});
