import { describe, it, expect } from "vitest";
import { assessVerificationState } from "../../src/modules/community/verification/verification.engine.js";
import type { ConfidenceResult } from "../../src/modules/community/confidence/confidence.types.js";

function mockConfidenceResult(overrides: Partial<ConfidenceResult>): ConfidenceResult {
  return {
    score: 0.5,
    evidenceCount: 1,
    supportCount: 2,
    contradictionCount: 0,
    externalCorroboration: false,
    reasoning: {
      baseEvidenceScore: 0.1,
      supportScore: 0.1,
      diversityScore: 0.05,
      confirmingSignalScore: 0,
      corroborationScore: 0,
      consistencyScore: 0.1,
      rawPositiveScore: 0.35,
      penaltyScore: 0,
      penaltiesApplied: [],
    },
    version: "confidence-v1",
    ...overrides,
  };
}

describe("Phase 9: Verification Engine Unit Tests", () => {
  it("assigns PENDING to emerging submissions with score below supported threshold", () => {
    const confidence = mockConfidenceResult({
      score: 0.25,
      evidenceCount: 0,
      supportCount: 1,
      contradictionCount: 0,
    });

    const result = assessVerificationState(confidence);

    expect(result.status).toBe("PENDING");
    expect(result.method).toBe("DETERMINISTIC_RULES");
  });

  it("transitions to COMMUNITY_SUPPORTED when score >= 0.40 and support is present", () => {
    const confidence = mockConfidenceResult({
      score: 0.55,
      evidenceCount: 1,
      supportCount: 3,
      contradictionCount: 0,
    });

    const result = assessVerificationState(confidence);

    expect(result.status).toBe("COMMUNITY_SUPPORTED");
    expect(result.method).toBe("COMMUNITY_SIGNAL");
  });

  it("transitions to COMMUNITY_VERIFIED when score >= 0.70 with strong supports and evidence", () => {
    const confidence = mockConfidenceResult({
      score: 0.85,
      evidenceCount: 2,
      supportCount: 8,
      contradictionCount: 0,
      externalCorroboration: true,
    });

    const result = assessVerificationState(confidence, { confirmCount: 4 });

    expect(result.status).toBe("COMMUNITY_VERIFIED");
    expect(result.method).toBe("EXTERNAL_CORROBORATION");
  });

  it("assigns EVIDENCE_REVIEW method when verified primarily through multiple evidence items", () => {
    const confidence = mockConfidenceResult({
      score: 0.75,
      evidenceCount: 3,
      supportCount: 5,
      contradictionCount: 0,
      externalCorroboration: false,
    });

    const result = assessVerificationState(confidence, { confirmCount: 0 });

    expect(result.status).toBe("COMMUNITY_VERIFIED");
    expect(result.method).toBe("EVIDENCE_REVIEW");
  });

  it("transitions to FLAGGED when contradiction count >= 2", () => {
    const confidence = mockConfidenceResult({
      score: 0.5,
      evidenceCount: 1,
      supportCount: 3,
      contradictionCount: 2,
    });

    const result = assessVerificationState(confidence);

    expect(result.status).toBe("FLAGGED");
    expect(result.method).toBe("DETERMINISTIC_RULES");
  });

  it("transitions to FLAGGED when contradictions equal or exceed supports", () => {
    const confidence = mockConfidenceResult({
      score: 0.45,
      evidenceCount: 1,
      supportCount: 1,
      contradictionCount: 1,
    });

    const result = assessVerificationState(confidence);

    expect(result.status).toBe("FLAGGED");
  });

  it("transitions to REJECTED on explicit moderation rejection", () => {
    const confidence = mockConfidenceResult({
      score: 0.7,
      evidenceCount: 2,
      supportCount: 6,
      contradictionCount: 0,
    });

    const result = assessVerificationState(confidence, { isModerationRejected: true });

    expect(result.status).toBe("REJECTED");
  });

  it("transitions to REJECTED on extreme spam reports and near-zero score", () => {
    const confidence = mockConfidenceResult({
      score: 0.05,
      evidenceCount: 0,
      supportCount: 0,
      contradictionCount: 4,
    });

    const result = assessVerificationState(confidence);

    expect(result.status).toBe("REJECTED");
  });
});
