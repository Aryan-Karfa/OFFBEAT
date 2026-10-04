import { describe, it, expect } from "vitest";
import { discoveryReasoningOutputSchema } from "../../src/integrations/gemini/gemini.schemas.js";

describe("Phase 11: Gemini Schemas & Structured Output Validation", () => {
  it("should successfully parse valid structured reasoning output", () => {
    const raw = {
      selectedPlaceIds: ["place_1", "place_2"],
      primaryRecommendationId: "place_1",
      recommendationSummary:
        "Place 1 is the strongest fit based on verified sunrise timing and lower morning crowds.",
      reasons: [
        "Strong mountain and sunrise viewpoint match",
        "Community observations confirm best window between 05:00 and 06:15",
      ],
      tradeoffs: ["Requires early departure"],
      contextualNotes: ["Clear morning visibility expected in autumn"],
    };

    const result = discoveryReasoningOutputSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.primaryRecommendationId).toBe("place_1");
      expect(result.data.selectedPlaceIds).toHaveLength(2);
      expect(result.data.reasons).toHaveLength(2);
      expect(result.data.tradeoffs).toHaveLength(1);
    }
  });

  it("should apply defaults for optional tradeoffs and contextualNotes", () => {
    const raw = {
      selectedPlaceIds: ["place_1"],
      primaryRecommendationId: "place_1",
      recommendationSummary: "Place 1 is an excellent recommendation.",
      reasons: ["Ideal scenic alignment"],
    };

    const result = discoveryReasoningOutputSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tradeoffs).toEqual([]);
      expect(result.data.contextualNotes).toEqual([]);
    }
  });

  it("should reject output missing selectedPlaceIds", () => {
    const raw = {
      primaryRecommendationId: "place_1",
      recommendationSummary: "Place 1 is an excellent recommendation.",
      reasons: ["Reason 1"],
    };

    const result = discoveryReasoningOutputSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });

  it("should reject output with empty selectedPlaceIds array", () => {
    const raw = {
      selectedPlaceIds: [],
      primaryRecommendationId: "place_1",
      recommendationSummary: "Place 1 is an excellent recommendation.",
      reasons: ["Reason 1"],
    };

    const result = discoveryReasoningOutputSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });

  it("should reject output missing recommendationSummary or having too short summary", () => {
    const raw = {
      selectedPlaceIds: ["place_1"],
      primaryRecommendationId: "place_1",
      recommendationSummary: "bad",
      reasons: ["Reason 1"],
    };

    const result = discoveryReasoningOutputSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });

  it("should reject output with more than 5 reasons", () => {
    const raw = {
      selectedPlaceIds: ["place_1"],
      primaryRecommendationId: "place_1",
      recommendationSummary: "Place 1 matches the traveler's preferences.",
      reasons: ["R1", "R2", "R3", "R4", "R5", "R6"],
    };

    const result = discoveryReasoningOutputSchema.safeParse(raw);
    expect(result.success).toBe(false);
  });
});
