import { describe, it, expect } from "vitest";
import { DiscoveryDiversity } from "../../src/modules/discovery/discovery.diversity.js";
import type { ScoredCandidate } from "../../src/modules/discovery/discovery.types.js";

describe("DiscoveryDiversity Unit Tests", () => {
  const createMockScored = (
    id: string,
    name: string,
    category: string,
    destination: string,
    score: number,
  ): ScoredCandidate => ({
    candidate: {
      id,
      name,
      destination,
      region: "West Bengal",
      categories: [category],
      location: { lat: 27.0, lng: 88.0 },
      source: "INTERNAL",
      provider: "OFFBEAT",
    },
    score,
    why: ["Matches taste"],
    breakdown: {
      travelTasteScore: score,
      experienceTasteScore: score,
      categoryScore: score,
      geographicScore: score,
      dayNightScore: score,
      ratingScore: score,
      completenessScore: score,
      totalScore: score,
    },
  });

  it("should prevent 3 consecutive items from having identical categories when a comparable alternative exists", () => {
    const list: ScoredCandidate[] = [
      createMockScored("1", "Peak A", "Mountain", "Darjeeling", 95),
      createMockScored("2", "Peak B", "Mountain", "Darjeeling", 94),
      createMockScored("3", "Peak C", "Mountain", "Darjeeling", 93),
      createMockScored("4", "Forest A", "Nature", "Darjeeling", 91), // Close score, different category!
    ];

    const diversified = DiscoveryDiversity.diversify(list, 2, 2);

    expect(diversified).toHaveLength(4);
    // Position 2 (the 3rd item) should be Forest A to prevent 3 consecutive Mountain items
    expect(diversified[2]?.candidate.categories[0]).toBe("Nature");
    expect(diversified[3]?.candidate.categories[0]).toBe("Mountain");
  });

  it("should preserve original candidate when no close alternative exists", () => {
    const list: ScoredCandidate[] = [
      createMockScored("1", "Peak A", "Mountain", "Darjeeling", 95),
      createMockScored("2", "Peak B", "Mountain", "Darjeeling", 94),
      createMockScored("3", "Peak C", "Mountain", "Darjeeling", 93),
      createMockScored("4", "Distant Place", "Nature", "Kolkata", 50), // Score difference > 12
    ];

    const diversified = DiscoveryDiversity.diversify(list, 2, 2);

    expect(diversified).toHaveLength(4);
    // Should NOT pick the 50-score item at position 2
    expect(diversified[2]?.candidate.id).toBe("3");
  });
});
