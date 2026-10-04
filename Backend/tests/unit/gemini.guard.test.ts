import { describe, it, expect } from "vitest";
import {
  validateCandidateAllowlist,
  checkBusinessAndHallucinationGuards,
} from "../../src/integrations/gemini/gemini.guard.js";
import type { DiscoveryReasoningOutput } from "../../src/integrations/gemini/gemini.schemas.js";
import type { DiscoveryReasoningInputDto } from "../../src/integrations/gemini/gemini.types.js";

describe("Phase 11: Gemini Guardrails & Candidate Allowlisting", () => {
  const allowedCandidates = ["place_tiger_hill", "place_batasia_loop", "place_peace_pagoda"];

  const validOutput: DiscoveryReasoningOutput = {
    primaryRecommendationId: "place_tiger_hill",
    selectedPlaceIds: ["place_tiger_hill", "place_batasia_loop"],
    recommendationSummary:
      "Tiger Hill is the optimal choice for sunrise views and lower morning crowds.",
    reasons: ["Optimal sunrise panoramic views", "Low weekday crowd between 04:30 and 06:00"],
    tradeoffs: ["Requires departure before dawn"],
    contextualNotes: ["Check seasonal cloud cover"],
  };

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
        bestTime: { start: "04:30", end: "06:00", source: "COMMUNITY" },
        crowd: { level: "LOW", source: "COMMUNITY" },
        timeFit: "GOOD",
        crowdFit: "LOWER_CROWD_MATCH",
      },
      {
        id: "place_batasia_loop",
        name: "Batasia Loop",
        categories: ["Heritage", "Railway"],
        destination: "Darjeeling",
        bestTime: { start: "08:00", end: "10:00", source: "EXTERNAL" },
        crowd: { level: "MODERATE", source: "EXTERNAL" },
        timeFit: "GOOD",
        crowdFit: "NEUTRAL",
      },
    ],
  };

  describe("validateCandidateAllowlist", () => {
    it("should accept reasoning output containing only approved candidate IDs", () => {
      const result = validateCandidateAllowlist(validOutput, allowedCandidates);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should strictly reject unknown or hallucinated primary candidate IDs", () => {
      const hallucinatedOutput: DiscoveryReasoningOutput = {
        ...validOutput,
        primaryRecommendationId: "place_hallucinated_resort_999",
      };

      const result = validateCandidateAllowlist(hallucinatedOutput, allowedCandidates);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not in allowed candidate set");
    });

    it("should strictly reject any unapproved ID in selectedPlaceIds", () => {
      const hallucinatedOutput: DiscoveryReasoningOutput = {
        ...validOutput,
        selectedPlaceIds: ["place_tiger_hill", "place_random_unverified"],
      };

      const result = validateCandidateAllowlist(hallucinatedOutput, allowedCandidates);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "Selected place ID 'place_random_unverified' is not in allowed candidate set",
      );
    });
  });

  describe("checkBusinessAndHallucinationGuards", () => {
    it("should validate well-formed reasoning consistent with candidate data", () => {
      const result = checkBusinessAndHallucinationGuards(validOutput, sampleInput);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject reasoning if primary candidate is not in candidate list", () => {
      const missingCandidateOutput: DiscoveryReasoningOutput = {
        ...validOutput,
        primaryRecommendationId: "place_batasia_loop_extra",
      };

      const result = checkBusinessAndHallucinationGuards(missingCandidateOutput, sampleInput);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not found in candidates list");
    });

    it("should reject reasoning if reasons array is empty", () => {
      const emptyReasonsOutput: DiscoveryReasoningOutput = {
        ...validOutput,
        reasons: [],
      };

      const result = checkBusinessAndHallucinationGuards(emptyReasonsOutput, sampleInput);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Reasoning output must contain at least one grounded reason");
    });

    it("should detect conflict when user requests NIGHT and candidate conflicts without tradeoff explanation", () => {
      const nightInput: DiscoveryReasoningInputDto = {
        ...sampleInput,
        userContext: {
          ...sampleInput.userContext,
          dayNight: "NIGHT",
        },
        candidates: [
          {
            ...sampleInput.candidates[0]!,
            timeFit: "CONFLICT",
          },
        ],
      };

      const noTradeoffOutput: DiscoveryReasoningOutput = {
        ...validOutput,
        tradeoffs: [],
        contextualNotes: [],
      };

      const result = checkBusinessAndHallucinationGuards(noTradeoffOutput, nightInput);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "conflicts with user NIGHT preference without explaining the tradeoff",
      );
    });
  });
});
