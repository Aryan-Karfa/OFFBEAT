import { describe, it, expect } from "vitest";
import { DiscoveryScorer } from "../../src/modules/discovery/discovery.scorer.js";
import type {
  DiscoveryCandidate,
  DiscoveryContextDto,
} from "../../src/modules/discovery/discovery.types.js";

describe("DiscoveryScorer Unit Tests", () => {
  const scorer = new DiscoveryScorer();

  const benchmarkContext: DiscoveryContextDto = {
    country: "India",
    regionId: "IN-WB",
    region: "West Bengal",
    destination: "Darjeeling",
    travelTaste: ["mountains", "photography"],
    experienceTaste: ["sunrise", "peaceful", "nature"],
    dayNight: "DAY",
    intent: "DISCOVER_PLACES",
  };

  const tigerHillCandidate: DiscoveryCandidate = {
    id: "place_tiger_hill",
    source: "INTERNAL",
    provider: "OFFBEAT",
    name: "Tiger Hill",
    slug: "tiger-hill",
    destination: "Darjeeling",
    region: "West Bengal",
    categories: ["Mountain", "Sunrise", "Photography", "Nature"],
    location: { lat: 27.012, lng: 88.261 },
    address: "Senchal Forest, Darjeeling",
    description: "Renowned summit offering dawn panoramas of Mount Kanchenjunga.",
    imageUrl: "https://example.com/tiger-hill.jpg",
    rating: 4.8,
    reviewCount: 1250,
  };

  const genericRestaurantCandidate: DiscoveryCandidate = {
    id: "place_kolkata_restaurant",
    source: "EXTERNAL",
    provider: "SERPAPI",
    name: "Downtown Gourmet Kitchen",
    destination: "Kolkata",
    region: "West Bengal",
    categories: ["Restaurant", "Food"],
    location: { lat: 22.55, lng: 88.35 },
    address: "Park Street, Kolkata",
    description: "Award-winning continental dining in central Kolkata.",
    imageUrl: null,
    rating: 5.0, // High rating but wrong experience!
    reviewCount: 3400,
  };

  it("should score matching places significantly higher than high-rated irrelevant places", () => {
    const scoredTigerHill = scorer.scoreCandidate(tigerHillCandidate, benchmarkContext);
    const scoredRestaurant = scorer.scoreCandidate(genericRestaurantCandidate, benchmarkContext);

    expect(scoredTigerHill.score).toBeGreaterThan(scoredRestaurant.score);
    expect(scoredTigerHill.score).toBeGreaterThanOrEqual(75);
    expect(scoredRestaurant.score).toBeLessThan(55);
  });

  it("should generate concise product-level explanations for matches", () => {
    const scored = scorer.scoreCandidate(tigerHillCandidate, benchmarkContext);

    expect(scored.why.length).toBeGreaterThanOrEqual(2);
    expect(scored.why.some((w) => w.toLowerCase().includes("mountain"))).toBe(true);
    expect(scored.why.some((w) => w.toLowerCase().includes("sunrise"))).toBe(true);

    // Must NOT contain generic copy
    scored.why.forEach((reason) => {
      expect(reason.toLowerCase()).not.toContain("recommended for you");
    });
  });

  it("should produce deterministic scores on repeated runs", () => {
    const run1 = scorer.scoreCandidate(tigerHillCandidate, benchmarkContext);
    const run2 = scorer.scoreCandidate(tigerHillCandidate, benchmarkContext);

    expect(run1.score).toBe(run2.score);
    expect(run1.why).toEqual(run2.why);
    expect(run1.breakdown).toEqual(run2.breakdown);
  });

  it("should apply day/night compatibility correctly", () => {
    const nightContext: DiscoveryContextDto = {
      ...benchmarkContext,
      travelTaste: ["nightlife"],
      experienceTaste: ["night_bazaars"],
      dayNight: "NIGHT",
    };

    const nightMarketCandidate: DiscoveryCandidate = {
      id: "place_night_market",
      source: "EXTERNAL",
      provider: "SERPAPI",
      name: "Starlight Night Bazaar",
      destination: "Darjeeling",
      region: "West Bengal",
      categories: ["Nightlife", "Bazaar", "Night Market"],
      location: { lat: 27.03, lng: 88.26 },
      description: "Atmospheric lantern-lit evening bazaar with tea stalls.",
    };

    const scoredDay = scorer.scoreCandidate(nightMarketCandidate, benchmarkContext);
    const scoredNight = scorer.scoreCandidate(nightMarketCandidate, nightContext);

    expect(scoredNight.score).toBeGreaterThan(scoredDay.score);
    expect(scoredNight.breakdown.dayNightScore).toBeGreaterThanOrEqual(
      scoredDay.breakdown.dayNightScore,
    );
  });
});
