import { describe, it, expect, beforeEach } from "vitest";
import { GeminiService } from "../../src/integrations/gemini/gemini.service.js";
import { MockReasoningProvider } from "../../src/integrations/gemini/gemini.mock.js";
import type { DiscoveryReasoningInputDto } from "../../src/integrations/gemini/gemini.types.js";
import { GeminiProviderError } from "../../src/integrations/gemini/gemini.errors.js";

describe("Phase 11: GeminiService Unit Tests", () => {
  let mockProvider: MockReasoningProvider;
  let service: GeminiService;

  const sampleInput: DiscoveryReasoningInputDto = {
    userContext: {
      region: "West Bengal",
      destination: "Darjeeling",
      travelTaste: ["mountains", "photography"],
      experienceTaste: ["sunrise", "peaceful"],
      dayNight: "DAY",
      preferredTime: "05:00",
    },
    candidates: [
      {
        id: "place_tiger_hill",
        name: "Tiger Hill",
        categories: ["Scenic Point", "Mountain View"],
        destination: "Darjeeling",
        score: 95,
        why: ["Strong match for sunrise view", "Fits peaceful morning mountain atmosphere"],
        bestTime: { start: "04:30", end: "06:00", source: "COMMUNITY", reason: "Optimal sunrise" },
        crowd: { level: "LOW", source: "COMMUNITY", context: "Weekday early morning" },
        timeFit: "GOOD",
        crowdFit: "LOWER_CROWD_MATCH",
        communityHighlights: [
          {
            title: "Early Arrival Tip",
            content: "Arrive by 5 AM for clear views before mist sets in.",
            verificationStatus: "COMMUNITY_VERIFIED",
            evidenceStrength: "HIGH",
          },
        ],
      },
      {
        id: "place_batasia_loop",
        name: "Batasia Loop",
        categories: ["Heritage", "Railway"],
        destination: "Darjeeling",
        score: 82,
        why: ["Historic loop with toy train panoramic vista"],
      },
    ],
  };

  beforeEach(() => {
    mockProvider = new MockReasoningProvider();
    service = new GeminiService(mockProvider, {
      apiKey: "test-key",
      model: "gemini-3.8-flash",
      timeoutMs: 5000,
      maxRetries: 1,
      enabled: true,
    });
  });

  it("should return empty fallback recommendation when candidate list is empty", async () => {
    const emptyInput: DiscoveryReasoningInputDto = {
      ...sampleInput,
      candidates: [],
    };

    const result = await service.reasonAboutDiscovery(emptyInput);
    expect(result.source).toBe("DETERMINISTIC");
    expect(result.primaryRecommendationId).toBe("");
    expect(result.selectedPlaceIds).toHaveLength(0);
  });

  it("should successfully return AI reasoning result via ReasoningProvider", async () => {
    const result = await service.reasonAboutDiscovery(sampleInput);
    expect(result.source).toBe("GEMINI");
    expect(result.primaryRecommendationId).toBe("place_tiger_hill");
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.recommendationSummary).toContain("Tiger Hill");
  });

  it("should gracefully fall back to deterministic reasoning when provider times out", async () => {
    mockProvider.setOptions({ shouldTimeout: true });

    const result = await service.reasonAboutDiscovery(sampleInput);
    expect(result.source).toBe("DETERMINISTIC");
    expect(result.primaryRecommendationId).toBe("place_tiger_hill");
    expect(result.recommendationSummary).toContain("Tiger Hill");
    expect(result.contextualNotes[1]).toContain("Reasoning fallback applied");
  });

  it("should gracefully fall back to deterministic reasoning when provider throws an error", async () => {
    mockProvider.setOptions({
      shouldFail: true,
      failError: new GeminiProviderError("Simulated upstream provider outage"),
    });

    const result = await service.reasonAboutDiscovery(sampleInput);
    expect(result.source).toBe("DETERMINISTIC");
    expect(result.primaryRecommendationId).toBe("place_tiger_hill");
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("should use deterministic reasoning directly when geminiConfig.enabled is false", async () => {
    const disabledService = new GeminiService(mockProvider, {
      apiKey: "test-key",
      model: "gemini-3.8-flash",
      timeoutMs: 5000,
      maxRetries: 1,
      enabled: false,
    });

    const result = await disabledService.reasonAboutDiscovery(sampleInput);
    expect(result.source).toBe("DETERMINISTIC");
    expect(result.primaryRecommendationId).toBe("place_tiger_hill");
  });

  it("should generate grounded evidence reasons in deterministic fallback", () => {
    const fallback = service.generateDeterministicFallback(sampleInput);
    expect(fallback.source).toBe("DETERMINISTIC");
    expect(fallback.primaryRecommendationId).toBe("place_tiger_hill");
    // Verify evidence reasons reflect candidate signals
    const combinedReasons = fallback.reasons.join(" ");
    expect(combinedReasons).toContain("sunrise");
    expect(combinedReasons).toContain("04:30");
    expect(combinedReasons).toContain("low");
    expect(combinedReasons).toContain("verified community");
  });
});
