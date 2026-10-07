import { describe, it, expect } from "vitest";
import {
  formatTravelerMemoryPromptSection,
  GEMINI_SYSTEM_INSTRUCTION,
} from "../../src/integrations/gemini/gemini.prompts.js";
import { checkGeminiMemoryBoundaryGuards } from "../../src/integrations/gemini/gemini.guard.js";
import type { GeminiSanitizedMemoryContext } from "@offbeat/shared";

describe("Phase 15: Gemini Memory Boundary Unit Tests", () => {
  it("enforces Rule 11 in system instructions", () => {
    expect(GEMINI_SYSTEM_INSTRUCTION).toContain("Traveler Memory Boundary");
    expect(GEMINI_SYSTEM_INSTRUCTION).toContain("passive reference context only");
    expect(GEMINI_SYSTEM_INSTRUCTION).toContain("ZERO authority to write");
  });

  it("formats sanitized memory context cleanly within isolated tags", () => {
    const context: GeminiSanitizedMemoryContext = {
      explicitTravelTastes: ["mountains", "photography"],
      explicitExperienceTastes: ["sunrise"],
      inferredInterests: ["quiet trails"],
      preferredPace: "BALANCED",
      alternativeBias: "LOWER_CROWD",
      confidenceLevel: "HIGH",
    };

    const formatted = formatTravelerMemoryPromptSection(context);
    expect(formatted).toContain("<traveler_memory>");
    expect(formatted).toContain("</traveler_memory>");
    expect(formatted).toContain("mountains, photography");
    expect(formatted).toContain("BALANCED");
    expect(formatted).toContain("Current explicit user preferences always supersede");
  });

  it("guard rejects output containing sensitive inferences", () => {
    const invalidText =
      "Recommended because the traveler's medical condition or illness requires quiet areas.";
    const result = checkGeminiMemoryBoundaryGuards(invalidText);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("sensitive personal attribute references");
  });

  it("guard rejects output claiming unwarranted certainty on inferred preferences", () => {
    const invalidText = "We know with 100% certainty that you will love this remote spot.";
    const result = checkGeminiMemoryBoundaryGuards(invalidText);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("claims unwarranted certainty");
  });

  it("guard rejects output attempting to invoke persistent memory write commands", () => {
    const invalidText = "Great fit. WRITE_MEMORY: mountains=high.";
    const result = checkGeminiMemoryBoundaryGuards(invalidText);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("unauthorized memory mutations");
  });

  it("guard passes truthful grounded traveler explanations", () => {
    const validText =
      "This high-altitude viewpoint complements your interest in photography and scenic views.";
    const result = checkGeminiMemoryBoundaryGuards(validText);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
