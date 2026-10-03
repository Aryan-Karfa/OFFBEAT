import { describe, it, expect } from "vitest";
import {
  calculateConfidence,
  CONFIDENCE_ENGINE_VERSION,
  CONFIDENCE_WEIGHTS,
} from "../../src/modules/community/confidence/confidence.engine.js";
import type { ConfidenceCalculationSignals } from "../../src/modules/community/confidence/confidence.types.js";

describe("Phase 9: Confidence Engine Unit Tests", () => {
  it("returns zero or baseline score when no evidence or support exists", () => {
    const signals: ConfidenceCalculationSignals = {
      evidence: [],
      supports: [],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    };

    const result = calculateConfidence(signals);

    expect(result.score).toBe(0.0);
    expect(result.evidenceCount).toBe(0);
    expect(result.supportCount).toBe(0);
    expect(result.contradictionCount).toBe(0);
    expect(result.externalCorroboration).toBe(false);
    expect(result.version).toBe(CONFIDENCE_ENGINE_VERSION);
  });

  it("rewards base evidence with bounded score (max 0.20)", () => {
    const singleEvidence = calculateConfidence({
      evidence: [{ type: "TEXT", content: "Observation note" }],
      supports: [],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    const multiEvidence = calculateConfidence({
      evidence: [
        { type: "TEXT", content: "Note 1" },
        { type: "TEXT", content: "Note 2" },
      ],
      supports: [],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    expect(singleEvidence.reasoning.baseEvidenceScore).toBe(0.1);
    expect(multiEvidence.reasoning.baseEvidenceScore).toBe(CONFIDENCE_WEIGHTS.baseEvidenceMax);
  });

  it("calculates evidence diversity across distinct evidence types (max 0.15)", () => {
    const singleType = calculateConfidence({
      evidence: [
        { type: "TEXT", content: "Note 1" },
        { type: "TEXT", content: "Note 2" },
      ],
      supports: [],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    const twoTypes = calculateConfidence({
      evidence: [
        { type: "TEXT", content: "Note 1" },
        { type: "PHOTO", mediaUrl: "https://example.com/photo.jpg" },
      ],
      supports: [],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    const threeTypes = calculateConfidence({
      evidence: [
        { type: "TEXT", content: "Note 1" },
        { type: "PHOTO", mediaUrl: "https://example.com/photo.jpg" },
        { type: "EXTERNAL_REFERENCE", externalReference: "https://darjeeling.gov.in" },
      ],
      supports: [],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    expect(singleType.reasoning.diversityScore).toBe(0.05);
    expect(twoTypes.reasoning.diversityScore).toBe(0.1);
    expect(threeTypes.reasoning.diversityScore).toBe(CONFIDENCE_WEIGHTS.diversityMax);
  });

  it("aggregates community support weighting CONFIRM higher than USEFUL", () => {
    const usefulOnly = calculateConfidence({
      evidence: [],
      supports: [
        { userId: "u1", type: "USEFUL" },
        { userId: "u2", type: "USEFUL" },
      ],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    const confirmOnly = calculateConfidence({
      evidence: [],
      supports: [
        { userId: "u1", type: "CONFIRM" },
        { userId: "u2", type: "CONFIRM" },
      ],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    expect(confirmOnly.reasoning.supportScore).toBeGreaterThan(usefulOnly.reasoning.supportScore);
  });

  it("rewards repeated confirmation signals (confirmCount >= 2 grants +0.15)", () => {
    const withConfirms = calculateConfidence({
      evidence: [],
      supports: [
        { userId: "u1", type: "CONFIRM" },
        { userId: "u2", type: "CONFIRM" },
      ],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    expect(withConfirms.reasoning.confirmingSignalScore).toBe(
      CONFIDENCE_WEIGHTS.confirmingSignalMax,
    );
  });

  it("applies external corroboration boost (+0.15)", () => {
    const uncorroborated = calculateConfidence({
      evidence: [],
      supports: [],
      reports: [],
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    const corroborated = calculateConfidence({
      evidence: [],
      supports: [],
      reports: [],
      externalCorroboration: true,
      hasConsistentMetadata: false,
    });

    expect(corroborated.reasoning.corroborationScore).toBe(CONFIDENCE_WEIGHTS.corroborationMax);
    expect(corroborated.score).toBe(uncorroborated.score + CONFIDENCE_WEIGHTS.corroborationMax);
  });

  it("applies report penalties correctly", () => {
    const baseSignals: ConfidenceCalculationSignals = {
      evidence: [{ type: "PHOTO", mediaUrl: "https://example.com/p.jpg" }],
      supports: [
        { userId: "u1", type: "CONFIRM" },
        { userId: "u2", type: "CONFIRM" },
        { userId: "u3", type: "USEFUL" },
      ],
      reports: [],
      externalCorroboration: true,
      hasConsistentMetadata: true,
    };

    const cleanResult = calculateConfidence(baseSignals);

    const withSpam = calculateConfidence({
      ...baseSignals,
      reports: [{ userId: "u4", reason: "SPAM" }],
    });

    const withOutdated = calculateConfidence({
      ...baseSignals,
      reports: [{ userId: "u5", reason: "OUTDATED" }],
    });

    expect(withSpam.score).toBeLessThan(cleanResult.score);
    expect(withOutdated.score).toBeLessThan(cleanResult.score);
    expect(withSpam.reasoning.penaltyScore).toBe(0.25);
    expect(withOutdated.reasoning.penaltyScore).toBe(0.15);
  });

  it("strictly bounds score between 0.0 and 1.0 under all conditions", () => {
    // Massive positive signals
    const overflowPositive = calculateConfidence({
      evidence: [
        { type: "PHOTO", mediaUrl: "p1" },
        { type: "TEXT", content: "t1" },
        { type: "EXTERNAL_REFERENCE", externalReference: "ref1" },
      ],
      supports: Array.from({ length: 50 }, (_, i) => ({
        userId: `user_${i}`,
        type: "CONFIRM" as const,
      })),
      reports: [],
      externalCorroboration: true,
      hasConsistentMetadata: true,
    });

    expect(overflowPositive.score).toBe(1.0);

    // Massive penalties
    const overflowNegative = calculateConfidence({
      evidence: [{ type: "TEXT", content: "note" }],
      supports: [],
      reports: Array.from({ length: 10 }, (_, i) => ({
        userId: `user_rep_${i}`,
        reason: "SPAM" as const,
      })),
      externalCorroboration: false,
      hasConsistentMetadata: false,
    });

    expect(overflowNegative.score).toBe(0.0);
  });

  it("is purely deterministic and produces identical results for identical inputs", () => {
    const signals: ConfidenceCalculationSignals = {
      evidence: [{ type: "PHOTO", mediaUrl: "https://example.com/p.jpg" }],
      supports: [
        { userId: "u1", type: "CONFIRM" },
        { userId: "u2", type: "USEFUL" },
      ],
      reports: [],
      externalCorroboration: true,
      hasConsistentMetadata: true,
    };

    const run1 = calculateConfidence(signals);
    const run2 = calculateConfidence(signals);

    expect(run1.score).toBe(run2.score);
    expect(run1.reasoning).toEqual(run2.reasoning);
  });
});
