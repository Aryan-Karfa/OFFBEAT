import { describe, it, expect } from "vitest";
import { takeHomeReasoningOutputSchema } from "../../src/integrations/gemini/gemini.schemas.js";
import {
  validateTakeHomeItemAllowlist,
  checkTakeHomeBusinessGuards,
} from "../../src/integrations/gemini/gemini.guard.js";
import { buildTakeHomeReasoningPrompt } from "../../src/integrations/gemini/gemini.prompts.js";
import { geminiService } from "../../src/integrations/gemini/gemini.service.js";
import type { TakeHomeReasoningInputDto } from "../../src/integrations/gemini/gemini.types.js";

describe("Phase 14: Gemini Take Home Schema & Guardrails Unit Tests", () => {
  const sampleInput: TakeHomeReasoningInputDto = {
    destination: {
      id: "dest_darjeeling",
      name: "Darjeeling",
      regionId: "IN-WB",
    },
    userContext: {
      travelTaste: ["tea", "culture"],
      giftFor: "GIFT",
    },
    candidateItems: [
      {
        id: "item_darjeeling_tea",
        name: "Darjeeling First Flush Tea",
        category: "TEA_COFFEE",
        whyTakeHome: "Signature GI tea harvested in the Himalayas.",
        localRelevance: "SIGNATURE",
        goodFor: ["GIFT", "PERSONAL"],
        source: "INTERNAL",
        confidence: { score: 0.95, evidenceStrength: "HIGH" },
        placesToFind: [
          {
            placeId: "store_nathmulls",
            name: "Nathmulls Tea Boutique",
            type: "STORE",
            source: "INTERNAL",
          },
        ],
      },
      {
        id: "item_darjeeling_crafts",
        name: "Tibetan Handcrafted Curios",
        category: "HANDICRAFT",
        whyTakeHome: "Woodcarvings from local refugee artisan centers.",
        localRelevance: "STRONGLY_ASSOCIATED",
        goodFor: ["GIFT", "COLLECTOR"],
        source: "INTERNAL",
        confidence: { score: 0.88, evidenceStrength: "HIGH" },
        placesToFind: [
          {
            placeId: "center_refugee",
            name: "Tibetan Refugee Self-Help Centre",
            type: "CRAFT_WORKSHOP",
            source: "INTERNAL",
          },
        ],
      },
    ],
  };

  it("validates well-formed Gemini Take Home structured output", () => {
    const validOutput = {
      selectedItemIds: ["item_darjeeling_tea", "item_darjeeling_crafts"],
      primaryItemId: "item_darjeeling_tea",
      explanation:
        "Darjeeling First Flush Tea represents the signature agricultural heritage of the region, complemented by authentic artisan woodcarvings.",
      itemReasons: [
        {
          itemId: "item_darjeeling_tea",
          reason: "An iconic geographical specialty reflecting high-altitude tea craftsmanship.",
        },
        {
          itemId: "item_darjeeling_crafts",
          reason: "Artisanal keepsake supporting indigenous mountain communities.",
        },
      ],
      suggestedSourceIds: ["store_nathmulls", "center_refugee"],
    };

    const parsed = takeHomeReasoningOutputSchema.safeParse(validOutput);
    expect(parsed.success).toBe(true);
  });

  it("rejects malformed output missing required fields", () => {
    const invalidOutput = {
      primaryItemId: "item_darjeeling_tea",
      // missing selectedItemIds, explanation, itemReasons
    };

    const parsed = takeHomeReasoningOutputSchema.safeParse(invalidOutput);
    expect(parsed.success).toBe(false);
  });

  it("enforces item and source allowlists, catching hallucinated IDs", () => {
    const allowlisted = validateTakeHomeItemAllowlist(
      {
        selectedItemIds: ["item_darjeeling_tea", "item_hallucinated_unknown"],
        primaryItemId: "item_darjeeling_tea",
        explanation: "Valid explanation",
        itemReasons: [],
        suggestedSourceIds: ["store_nathmulls"],
      },
      ["item_darjeeling_tea", "item_darjeeling_crafts"],
      ["store_nathmulls", "center_refugee"],
    );

    expect(allowlisted.valid).toBe(false);
    expect(allowlisted.errors.some((e) => e.includes("item_hallucinated_unknown"))).toBe(true);
  });

  it("enforces business guards against fabricated prices and claims", () => {
    const fabricatedPriceOutput = {
      selectedItemIds: ["item_darjeeling_tea"],
      primaryItemId: "item_darjeeling_tea",
      explanation: "Only ₹450 per packet at local shops.",
      itemReasons: [
        {
          itemId: "item_darjeeling_tea",
          reason: "Affordable price of $10 per box.",
        },
      ],
      suggestedSourceIds: [],
    };

    const guardCheck = checkTakeHomeBusinessGuards(fabricatedPriceOutput, sampleInput);
    expect(guardCheck.valid).toBe(false);
    expect(guardCheck.errors.some((e) => e.includes("Fabricated price"))).toBe(true);
  });

  it("enforces business guards against fabricated authenticity guarantees", () => {
    const fabricatedAuthenticityOutput = {
      selectedItemIds: ["item_darjeeling_tea"],
      primaryItemId: "item_darjeeling_tea",
      explanation: "We guarantee 100% authentic tea with certified pure leaves.",
      itemReasons: [],
      suggestedSourceIds: [],
    };

    const guardCheck = checkTakeHomeBusinessGuards(fabricatedAuthenticityOutput, sampleInput);
    expect(guardCheck.valid).toBe(false);
    expect(guardCheck.errors.some((e) => e.includes("authenticity claim"))).toBe(true);
  });

  it("builds prompt with strict instructions and untrusted community content guard", () => {
    const prompt = buildTakeHomeReasoningPrompt(sampleInput);

    expect(prompt).toContain("Darjeeling");
    expect(prompt).toContain("item_darjeeling_tea");
    expect(prompt).toContain("DO NOT invent items, shops, prices, or authenticity claims");
  });

  it("generates truthful deterministic fallback when Gemini is unavailable", () => {
    const fallback = geminiService.generateDeterministicTakeHomeFallback(
      sampleInput,
      "Simulated timeout",
    );

    expect(fallback.source).toBe("DETERMINISTIC");
    expect(fallback.primaryItemId).toBe("item_darjeeling_tea");
    expect(fallback.selectedItemIds).toContain("item_darjeeling_tea");
    expect(fallback.explanation).toContain("Darjeeling");
  });
});
