import { describe, it, expect } from "vitest";
import { AlternativesScorer } from "../../src/modules/alternatives/alternatives.scorer.js";
import type { PlaceWithDetails } from "../../src/modules/places/places.types.js";
import type { RawCandidatePlace, CandidateGenerationQuery } from "../../src/modules/alternatives/alternatives.types.js";
import { DestinationStatus, PlaceStatus } from "@prisma/client";

describe("Phase 12: AlternativesScorer Unit Tests Across All 6 Modes", () => {
  const scorer = new AlternativesScorer();

  const originalPlace: PlaceWithDetails = {
    id: "place_tiger_hill",
    name: "Tiger Hill",
    slug: "tiger-hill",
    destinationId: "dest_darjeeling",
    description: "Iconic high-altitude sunrise summit",
    latitude: 27.012,
    longitude: 88.261,
    address: "Senchal Forest, Darjeeling",
    website: null,
    phone: null,
    imageUrl: null,
    status: PlaceStatus.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    destination: {
      id: "dest_darjeeling",
      regionId: "IN-WB",
      name: "Darjeeling",
      slug: "darjeeling",
      description: null,
      coordinates: null,
      imageUrl: null,
      status: DestinationStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
    categories: [
      {
        id: "rel_1",
        placeId: "place_tiger_hill",
        categoryId: "cat_mountain",
        createdAt: new Date("2026-01-01"),
        category: {
          id: "cat_mountain",
          name: "Mountain",
          slug: "mountain",
          description: null,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      },
      {
        id: "rel_2",
        placeId: "place_tiger_hill",
        categoryId: "cat_sunrise",
        createdAt: new Date("2026-01-01"),
        category: {
          id: "cat_sunrise",
          name: "Sunrise",
          slug: "sunrise",
          description: null,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      },
    ],
  };

  const similarCandidate: RawCandidatePlace = {
    id: "place_sandakphu",
    name: "Sandakphu Ridge",
    destination: "Darjeeling",
    categories: ["Mountain", "Sunrise", "Photography"],
    location: { lat: 27.105, lng: 88.002 },
    source: "INTERNAL",
  };

  const nearbyEnhancementCandidate: RawCandidatePlace = {
    id: "place_batasia_loop",
    name: "Batasia Loop",
    destination: "Darjeeling",
    categories: ["Heritage", "Railway", "Mountain"],
    location: { lat: 27.0168, lng: 88.2464 }, // very close geographically
    source: "INTERNAL",
  };

  const complementaryCandidate: RawCandidatePlace = {
    id: "place_glenarys_bakery",
    name: "Glenary's Bakery",
    destination: "Darjeeling",
    categories: ["Restaurant", "Culture", "Local Business"],
    location: { lat: 27.042, lng: 88.266 },
    source: "INTERNAL",
  };

  const baseQuery: CandidateGenerationQuery = {
    mode: "REPLACEMENT",
    country: "India",
    region: "IN-WB",
    destination: "Darjeeling",
    travelTaste: ["mountain"],
    experienceTaste: ["sunrise"],
    dayNight: "DAY",
    limit: 5,
  };

  it("Mode 1: REPLACEMENT prioritizes category and taste similarity", () => {
    const scored = scorer.scoreCandidate(similarCandidate, originalPlace, {
      ...baseQuery,
      mode: "REPLACEMENT",
    });

    expect(scored.score).toBeGreaterThan(50);
    expect(scored.why).toContain("substitute for Tiger Hill");
    expect(scored.scoringBreakdown.categorySimilarity).toBeGreaterThan(0.4);
  });

  it("Mode 2: ENHANCEMENT prioritizes proximity and pairing relationship", () => {
    const scored = scorer.scoreCandidate(nearbyEnhancementCandidate, originalPlace, {
      ...baseQuery,
      mode: "ENHANCEMENT",
    });

    expect(scored.score).toBeGreaterThan(50);
    expect(scored.relationshipContext).toContain("Pairs naturally with Tiger Hill");
    expect(scored.why).toContain("Pairs naturally with Tiger Hill");
  });

  it("Mode 3: COMPLEMENTARY scores different categories positively to balance journey", () => {
    const scored = scorer.scoreCandidate(complementaryCandidate, originalPlace, {
      ...baseQuery,
      mode: "COMPLEMENTARY",
    });

    expect(scored.score).toBeGreaterThan(40);
    expect(scored.relationshipContext).toContain("Complements Tiger Hill");
    expect(scored.why).toContain("Complements Tiger Hill");
  });

  it("Mode 4: NEARBY_DISCOVERY rewards verified community signals and proximity", () => {
    const scored = scorer.scoreCandidate(
      nearbyEnhancementCandidate,
      originalPlace,
      {
        ...baseQuery,
        mode: "NEARBY_DISCOVERY",
      },
      {
        community: { submissionCount: 8, helpfulCount: 15, verifiedCount: 3 },
      },
    );

    expect(scored.score).toBeGreaterThan(50);
    expect(scored.why).toContain("community-verified");
  });

  it("Mode 5: TIMING_ALTERNATIVE boosts candidates with GOOD timeFit and visit window", () => {
    const scoredGood = scorer.scoreCandidate(
      similarCandidate,
      originalPlace,
      {
        ...baseQuery,
        mode: "TIMING_ALTERNATIVE",
      },
      {
        timeFit: "GOOD",
        bestTime: { start: "04:30", end: "06:00", reason: "Optimal sunrise" },
      },
    );

    const scoredConflict = scorer.scoreCandidate(
      similarCandidate,
      originalPlace,
      {
        ...baseQuery,
        mode: "TIMING_ALTERNATIVE",
      },
      {
        timeFit: "CONFLICT",
      },
    );

    expect(scoredGood.score!).toBeGreaterThan(scoredConflict.score!);
    expect(scoredGood.timeFit).toBe("GOOD");
    expect(scoredGood.why).toContain("optimal visiting window");
  });

  it("Mode 6: LOWER_CROWD rewards reliable low crowd levels and avoids fabricating claims", () => {
    const scoredLowCrowd = scorer.scoreCandidate(
      similarCandidate,
      originalPlace,
      {
        ...baseQuery,
        mode: "LOWER_CROWD",
      },
      {
        crowdLevel: "LOW",
        crowdFit: "LOWER_CROWD_MATCH",
      },
    );

    const scoredHighCrowd = scorer.scoreCandidate(
      similarCandidate,
      originalPlace,
      {
        ...baseQuery,
        mode: "LOWER_CROWD",
      },
      {
        crowdLevel: "HIGH",
        crowdFit: "HIGHER_CROWD",
      },
    );

    expect(scoredLowCrowd.score!).toBeGreaterThan(scoredHighCrowd.score!);
    expect(scoredLowCrowd.crowdFit).toBe("GOOD");
    expect(scoredLowCrowd.why).toContain("low visitor density");
  });
});
