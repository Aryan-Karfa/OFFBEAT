import type {
  VerificationAssessmentResult,
  VerificationMethod,
  VerificationThresholds,
} from "./verification.types.js";
import type { ConfidenceResult } from "../confidence/confidence.types.js";

export const VERIFICATION_THRESHOLDS: VerificationThresholds = {
  verifiedMinScore: 0.7,
  verifiedMinSupports: 4,
  verifiedMinEvidence: 1,
  verifiedMaxContradictions: 0,
  supportedMinScore: 0.4,
  supportedMinSupports: 2,
  supportedMaxContradictions: 1,
  flaggedMaxScore: 0.35,
  flaggedMinContradictions: 2,
};

/**
 * Deterministic Verification State Engine
 *
 * Derives the trust and verification status of a community submission from its
 * confidence calculation, evidence items, support signals, and reports.
 *
 * Lifecycle:
 * PENDING -> COMMUNITY_SUPPORTED -> COMMUNITY_VERIFIED (or FLAGGED / REJECTED)
 */
export function assessVerificationState(
  confidenceResult: ConfidenceResult,
  extraSignals?: {
    confirmCount?: number;
    isModerationRejected?: boolean;
  },
): VerificationAssessmentResult {
  const { score, evidenceCount, supportCount, contradictionCount, externalCorroboration } =
    confidenceResult;

  const confirmCount = extraSignals?.confirmCount ?? 0;

  // 1. Explicit or extreme rejection
  if (extraSignals?.isModerationRejected || (contradictionCount >= 3 && score < 0.15)) {
    return {
      status: "REJECTED",
      method: "DETERMINISTIC_RULES",
      reasoning:
        "Discovery flagged and rejected due to severe contradiction signals or policy violation.",
    };
  }

  // 2. Problematic or contested state
  if (
    contradictionCount >= VERIFICATION_THRESHOLDS.flaggedMinContradictions ||
    (contradictionCount >= 1 && score <= VERIFICATION_THRESHOLDS.flaggedMaxScore) ||
    (contradictionCount > 0 && contradictionCount >= supportCount)
  ) {
    return {
      status: "FLAGGED",
      method: "DETERMINISTIC_RULES",
      reasoning: `Contradiction signals (${contradictionCount} reports) significantly outweigh supporting evidence. Under review.`,
    };
  }

  // 3. Community Verified
  const meetsVerifiedSupport =
    supportCount >= VERIFICATION_THRESHOLDS.verifiedMinSupports || confirmCount >= 2;
  const meetsVerifiedEvidence = evidenceCount >= VERIFICATION_THRESHOLDS.verifiedMinEvidence;
  const meetsVerifiedContradictions =
    contradictionCount <= VERIFICATION_THRESHOLDS.verifiedMaxContradictions;
  const meetsVerifiedScore = score >= VERIFICATION_THRESHOLDS.verifiedMinScore;

  if (
    meetsVerifiedScore &&
    meetsVerifiedSupport &&
    meetsVerifiedEvidence &&
    meetsVerifiedContradictions
  ) {
    let method: VerificationMethod = "COMMUNITY_SIGNAL";
    if (externalCorroboration && confirmCount >= 1) {
      method = "EXTERNAL_CORROBORATION";
    } else if (evidenceCount >= 2) {
      method = "EVIDENCE_REVIEW";
    }

    return {
      status: "COMMUNITY_VERIFIED",
      method,
      reasoning: `Multi-signal verification achieved: high confidence (${score}), ${supportCount} traveler supports, valid evidence attached, zero contradictions.`,
    };
  }

  // 4. Community Supported
  const meetsSupportedSupport =
    supportCount >= VERIFICATION_THRESHOLDS.supportedMinSupports || evidenceCount >= 1;
  const meetsSupportedContradictions =
    contradictionCount <= VERIFICATION_THRESHOLDS.supportedMaxContradictions;
  const meetsSupportedScore = score >= VERIFICATION_THRESHOLDS.supportedMinScore;

  if (meetsSupportedScore && meetsSupportedSupport && meetsSupportedContradictions) {
    const method: VerificationMethod =
      supportCount >= 2 ? "COMMUNITY_SIGNAL" : "DETERMINISTIC_RULES";

    return {
      status: "COMMUNITY_SUPPORTED",
      method,
      reasoning: `Meaningful traveler support (${supportCount} supports, ${evidenceCount} evidence items) confirms initial validity.`,
    };
  }

  // 5. Emerging / Pending
  return {
    status: "PENDING",
    method: "DETERMINISTIC_RULES",
    reasoning: "Emerging discovery awaiting additional traveler confirmation and evidence items.",
  };
}
