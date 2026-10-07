import { describe, it, expect } from "vitest";
import { TakeHomeScorer } from "../../src/modules/take-home/take-home.scorer.js";
import type {
  TakeHomeItemDto,
  TakeHomeQueryDto,
} from "../../src/modules/take-home/take-home.types.js";

describe("Phase 14: TakeHomeScorer Unit Tests", () => {
  const baseItem: TakeHomeItemDto = {
    id: "item_darjeeling_tea",
    name: "Darjeeling First Flush Tea",
    category: "TEA_COFFEE",
    categories: ["TEA_COFFEE", "FOOD", "GIFT"],
    destinationId: "dest_darjeeling",
    destinationName: "Darjeeling",
    whyTakeHome: "Signature high-altitude Himalayan tea with GI status.",
    localRelevance: "SIGNATURE",
    goodFor: ["GIFT", "PERSONAL"],
    source: "INTERNAL",
    confidence: {
      score: 0.95,
      evidenceStrength: "HIGH",
    },
    community: {
      submissionCount: 3,
      helpfulCount: 5,
      verifiedCount: 2,
      status: "COMMUNITY_VERIFIED",
      supportCount: 4,
    },
    placesToFind: [
      {
        name: "Nathmulls Tea Boutique",
        type: "STORE",
        source: "INTERNAL",
      },
      {
        name: "Happy Valley Tea Estate",
        type: "TEA_ESTATE",
        source: "INTERNAL",
      },
    ],
  };

  it("prioritizes SIGNATURE local relevance over REGIONAL and UNKNOWN", () => {
    const signatureItem = { ...baseItem, id: "sig", localRelevance: "SIGNATURE" as const };
    const regionalItem = { ...baseItem, id: "reg", localRelevance: "REGIONAL" as const };
    const unknownItem = { ...baseItem, id: "unk", localRelevance: "UNKNOWN" as const };

    const scoredSig = TakeHomeScorer.scoreItem(signatureItem, {}, "dest_darjeeling");
    const scoredReg = TakeHomeScorer.scoreItem(regionalItem, {}, "dest_darjeeling");
    const scoredUnk = TakeHomeScorer.scoreItem(unknownItem, {}, "dest_darjeeling");

    expect(scoredSig.rawScore).toBeGreaterThan(scoredReg.rawScore);
    expect(scoredReg.rawScore).toBeGreaterThan(scoredUnk.rawScore);
    expect(scoredSig.scoreBreakdown.localRelevanceScore).toBe(1.0);
    expect(scoredReg.scoreBreakdown.localRelevanceScore).toBe(0.55);
  });

  it("rewards community verification and support count", () => {
    const verifiedItem = {
      ...baseItem,
      community: {
        submissionCount: 2,
        helpfulCount: 3,
        verifiedCount: 1,
        status: "COMMUNITY_VERIFIED",
        supportCount: 5,
      },
    };
    const unsupportedItem = {
      ...baseItem,
      community: undefined,
    };

    const scoredVerified = TakeHomeScorer.scoreItem(verifiedItem, {}, "dest_darjeeling");
    const scoredUnverified = TakeHomeScorer.scoreItem(unsupportedItem, {}, "dest_darjeeling");

    expect(scoredVerified.scoreBreakdown.communityScore).toBeGreaterThan(
      scoredUnverified.scoreBreakdown.communityScore,
    );
  });

  it("aligns scores with traveler taste preferences", () => {
    const teaItem = { ...baseItem, category: "TEA_COFFEE" as const };
    const craftItem: TakeHomeItemDto = {
      ...baseItem,
      id: "item_craft",
      name: "Tibetan Woodcarvings",
      category: "HANDICRAFT",
      categories: ["HANDICRAFT", "ART"],
    };

    const foodQuery: TakeHomeQueryDto = { travelTaste: ["food"] };
    const cultureQuery: TakeHomeQueryDto = { travelTaste: ["culture"] };

    const scoredTeaFood = TakeHomeScorer.scoreItem(teaItem, foodQuery, "dest_darjeeling");
    const scoredCraftFood = TakeHomeScorer.scoreItem(craftItem, foodQuery, "dest_darjeeling");

    expect(scoredTeaFood.scoreBreakdown.tasteMatchScore).toBeGreaterThan(
      scoredCraftFood.scoreBreakdown.tasteMatchScore,
    );

    const scoredTeaCulture = TakeHomeScorer.scoreItem(teaItem, cultureQuery, "dest_darjeeling");
    const scoredCraftCulture = TakeHomeScorer.scoreItem(craftItem, cultureQuery, "dest_darjeeling");

    expect(scoredCraftCulture.scoreBreakdown.tasteMatchScore).toBeGreaterThan(
      scoredTeaCulture.scoreBreakdown.tasteMatchScore,
    );
  });

  it("boosts items matching requested gift recipient", () => {
    const giftQuery: TakeHomeQueryDto = { giftFor: "GIFT" };
    const collectorQuery: TakeHomeQueryDto = { giftFor: "COLLECTOR" };

    const itemGoodForGift = { ...baseItem, goodFor: ["GIFT" as const] };

    const scoredGift = TakeHomeScorer.scoreItem(itemGoodForGift, giftQuery, "dest_darjeeling");
    const scoredCollector = TakeHomeScorer.scoreItem(
      itemGoodForGift,
      collectorQuery,
      "dest_darjeeling",
    );

    expect(scoredGift.rawScore).toBeGreaterThan(scoredCollector.rawScore);
    expect(scoredGift.scoreBreakdown.giftFitScore).toBe(1.0);
    expect(scoredCollector.scoreBreakdown.giftFitScore).toBe(0.3);
  });

  it("strictly filters items when verifiedOnly is set", () => {
    const highConfItem = {
      ...baseItem,
      id: "high",
      confidence: { score: 0.9, evidenceStrength: "HIGH" as const },
    };
    const lowConfItem = {
      ...baseItem,
      id: "low",
      confidence: { score: 0.5, evidenceStrength: "EMERGING" as const },
      community: undefined,
    };

    const result = TakeHomeScorer.scoreCandidates(
      [highConfItem, lowConfItem],
      { verifiedOnly: true },
      "dest_darjeeling",
    );

    expect(result.map((r) => r.id)).toContain("high");
    expect(result.map((r) => r.id)).not.toContain("low");
  });
});
