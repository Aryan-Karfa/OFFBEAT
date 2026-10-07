import { describe, it, expect } from "vitest";
import { MemoryRules } from "../../src/modules/memory/memory.rules.js";

describe("Phase 15: MemoryRules Unit Tests", () => {
  describe("Privacy & Data Minimization Guard", () => {
    it("detects and rejects sensitive personal attribute signals", () => {
      expect(MemoryRules.isSensitiveSignal("medical_condition", "asthma")).toBe(true);
      expect(MemoryRules.isSensitiveSignal("political_views", "election_stance")).toBe(true);
      expect(MemoryRules.isSensitiveSignal("religion", "daily_prayer")).toBe(true);
      expect(MemoryRules.isSensitiveSignal("finance", "income_level")).toBe(true);
      expect(MemoryRules.isSensitiveSignal("sexuality", "orientation")).toBe(true);
    });

    it("allows travel-specific non-sensitive signals", () => {
      expect(MemoryRules.isSensitiveSignal("mountains", "High Altitude Trek")).toBe(false);
      expect(MemoryRules.isSensitiveSignal("photography", "Golden Hour Viewpoint")).toBe(false);
      expect(MemoryRules.isSensitiveSignal("sunrise", "Tiger Hill Viewpoint")).toBe(false);
      expect(MemoryRules.isSensitiveSignal("pace", "BALANCED")).toBe(false);
      expect(MemoryRules.isSensitiveSignal("tea_coffee", "Darjeeling First Flush")).toBe(false);
    });
  });

  describe("Deterministic Weight Decay", () => {
    it("decays inferred memory gradually with elapsed time", () => {
      const now = new Date("2026-10-08T00:00:00Z");
      const recentDate = new Date("2026-10-07T00:00:00Z"); // 1 day ago
      const oldDate = new Date("2026-09-08T00:00:00Z"); // 30 days ago

      const initialWeight = 0.9;
      const recentWeight = MemoryRules.calculateDecayedWeight(
        initialWeight,
        "INFERRED",
        recentDate,
        now,
      );
      const oldWeight = MemoryRules.calculateDecayedWeight(initialWeight, "INFERRED", oldDate, now);

      expect(recentWeight).toBeLessThan(initialWeight);
      expect(oldWeight).toBeLessThan(recentWeight);
      expect(oldWeight).toBeGreaterThanOrEqual(0.05); // Bounded lower limit
    });

    it("preserves explicit preferences with minimal decay", () => {
      const now = new Date("2026-10-08T00:00:00Z");
      const thirtyDaysAgo = new Date("2026-09-08T00:00:00Z");

      const explicitWeight = MemoryRules.calculateDecayedWeight(
        1.0,
        "EXPLICIT",
        thirtyDaysAgo,
        now,
      );

      // Explicit preferences stay strong and do not drop below 0.85
      expect(explicitWeight).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe("Weight Updates & Confidence", () => {
    it("increases weight and elevates confidence upon repeated corroboration", () => {
      const result = MemoryRules.updateWeight(0.5, 2, 0.6, "INTERACTION");
      expect(result.newWeight).toBeGreaterThan(0.5);
      expect(result.newCount).toBe(3);
    });

    it("assigns HIGH confidence to explicit signals or heavily reinforced signals", () => {
      const explicit = MemoryRules.updateWeight(0.5, 1, 1.0, "EXPLICIT");
      expect(explicit.newConfidence).toBe("HIGH");

      const reinforced = MemoryRules.updateWeight(0.7, 3, 0.4, "INTERACTION");
      expect(reinforced.newConfidence).toBe("HIGH");
    });

    it("bounds weights strictly between 0.05 and 1.0", () => {
      const clampedMax = MemoryRules.updateWeight(0.95, 5, 1.0, "INTERACTION");
      expect(clampedMax.newWeight).toBeLessThanOrEqual(1.0);

      const clampedMin = MemoryRules.updateWeight(0.1, 1, -0.8, "INTERACTION");
      expect(clampedMin.newWeight).toBeGreaterThanOrEqual(0.05);
    });
  });

  describe("Transparent Explanation Generation", () => {
    it("generates truthful distinct wording for explicit vs inferred memories", () => {
      const explicitExpl = MemoryRules.generateExplanation(
        "TASTE",
        "mountains",
        "Mountains",
        "EXPLICIT",
        3,
      );
      expect(explicitExpl).toContain("You directly selected Mountains");

      const inferredExpl = MemoryRules.generateExplanation(
        "CATEGORY_AFFINITY",
        "scenic",
        "Scenic",
        "INFERRED",
        4,
      );
      expect(inferredExpl).toContain("Inferred from your repeated interest");

      const paceExpl = MemoryRules.generateExplanation(
        "PACE",
        "pace_preference",
        "BALANCED",
        "ITINERARY",
        3,
      );
      expect(paceExpl).toContain("Preferred pace inferred from 3 generated itineraries");
    });
  });
});
