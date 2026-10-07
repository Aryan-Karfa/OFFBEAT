import { describe, it, expect } from "vitest";
import { DiscoveryScorer } from "../../src/modules/discovery/discovery.scorer.js";
import type {
  DiscoveryCandidate,
  DiscoveryContextDto,
} from "../../src/modules/discovery/discovery.types.js";

describe("Phase 15: Personalization Scorer Unit Tests", () => {
  const scorer = new DiscoveryScorer();

  const mockCandidate: DiscoveryCandidate = {
    id: "place_test_viewpoint",
    source: "INTERNAL",
    provider: "OFFBEAT",
    name: "Himalayan Ridge Viewpoint",
    destination: "Darjeeling",
    region: "West Bengal",
    categories: ["scenic", "viewpoint", "mountains", "nature"],
    location: { lat: 27.04, lng: 88.26 },
    rating: 4.8,
    reviewCount: 150,
  };

  const baseContext: DiscoveryContextDto = {
    country: "India",
    regionId: "IN-WB",
    region: "West Bengal",
    travelTaste: ["mountains"],
    experienceTaste: ["nature"],
    dayNight: "DAY",
    intent: "DISCOVER_PLACES",
  };

  it("applies a bounded personalization bonus when candidate matches remembered category affinities", () => {
    const unpersonalizedResult = scorer.scoreCandidate(mockCandidate, baseContext);

    const personalizedContext: DiscoveryContextDto = {
      ...baseContext,
      personalization: {
        userId: "user_test",
        memoryEnabled: true,
        travelTaste: ["mountains"],
        experienceTaste: ["nature"],
        categoryAffinities: [{ category: "viewpoint", weight: 0.9, confidence: "HIGH" }],
        destinationAffinities: [],
        topExplicitSignals: ["mountains"],
        topInferredSignals: ["viewpoint"],
        totalMemoriesCount: 2,
      },
    };

    const personalizedResult = scorer.scoreCandidate(mockCandidate, personalizedContext);

    // Personalization score bonus should be present and bounded
    expect(personalizedResult.score).toBeGreaterThan(unpersonalizedResult.score);
    expect(personalizedResult.breakdown.personalizationScore).toBeGreaterThan(0);
    expect(personalizedResult.breakdown.personalizationScore).toBeLessThanOrEqual(8);
    expect(
      personalizedResult.why.some((w) => w.includes("Matches your remembered preference")),
    ).toBe(true);
  });

  it("does not apply personalization when memory is disabled", () => {
    const disabledContext: DiscoveryContextDto = {
      ...baseContext,
      personalization: {
        userId: "user_test",
        memoryEnabled: false,
        travelTaste: ["mountains"],
        experienceTaste: ["nature"],
        categoryAffinities: [{ category: "viewpoint", weight: 0.9, confidence: "HIGH" }],
        destinationAffinities: [],
        topExplicitSignals: [],
        topInferredSignals: [],
        totalMemoriesCount: 0,
      },
    };

    const result = scorer.scoreCandidate(mockCandidate, disabledContext);
    expect(result.breakdown.personalizationScore).toBe(0);
  });
});
