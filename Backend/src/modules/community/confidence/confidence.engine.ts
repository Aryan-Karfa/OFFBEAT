import type {
  ConfidenceCalculationSignals,
  ConfidenceResult,
  ConfidenceCalculationBreakdown,
} from "./confidence.types.js";
import type { ReportReason } from "@offbeat/shared";

export const CONFIDENCE_ENGINE_VERSION = "confidence-v1";

export const CONFIDENCE_WEIGHTS = {
  baseEvidenceMax: 0.2,
  supportMax: 0.25,
  diversityMax: 0.15,
  confirmingSignalMax: 0.15,
  corroborationMax: 0.15,
  consistencyMax: 0.1,
} as const;

export const SUPPORT_WEIGHTS = {
  CONFIRM: 0.05,
  AGREE: 0.04,
  USEFUL: 0.03,
} as const;

export const REPORT_PENALTIES: Record<ReportReason, number> = {
  SPAM: 0.25,
  MISLEADING: 0.25,
  INAPPROPRIATE: 0.25,
  INCORRECT: 0.15,
  OUTDATED: 0.15,
  DUPLICATE: 0.08,
  OTHER: 0.08,
};

/**
 * Deterministic Confidence Engine (confidence-v1)
 *
 * Evaluates the strength of evidence supporting a piece of community knowledge.
 * Output is strictly clamped between 0.0 and 1.0.
 *
 * Core Principle: Confidence represents evidence strength, not absolute truth.
 */
export function calculateConfidence(signals: ConfidenceCalculationSignals): ConfidenceResult {
  const {
    evidence = [],
    supports = [],
    reports = [],
    externalCorroboration = false,
    hasConsistentMetadata = true,
  } = signals;

  // 1. Base Evidence (max 0.20)
  const evidenceCount = evidence.length;
  let baseEvidenceScore = 0.0;
  if (evidenceCount === 1) {
    baseEvidenceScore = 0.1;
  } else if (evidenceCount >= 2) {
    baseEvidenceScore = CONFIDENCE_WEIGHTS.baseEvidenceMax;
  }

  // 2. Community Support (max 0.25)
  // Ensure unique supports per user per type (though DB constraint already handles this)
  let rawSupportScore = 0.0;
  for (const s of supports) {
    const weight = SUPPORT_WEIGHTS[s.type] ?? SUPPORT_WEIGHTS.USEFUL;
    rawSupportScore += weight;
  }
  const supportScore = Math.min(rawSupportScore, CONFIDENCE_WEIGHTS.supportMax);

  // 3. Evidence Diversity (max 0.15)
  const distinctEvidenceTypes = new Set(evidence.map((e) => e.type));
  let diversityScore = 0.0;
  if (distinctEvidenceTypes.size === 1) {
    diversityScore = 0.05;
  } else if (distinctEvidenceTypes.size === 2) {
    diversityScore = 0.1;
  } else if (distinctEvidenceTypes.size >= 3) {
    diversityScore = CONFIDENCE_WEIGHTS.diversityMax;
  }

  // 4. Repeated / Confirming Signals (max 0.15)
  const confirmCount = supports.filter((s) => s.type === "CONFIRM").length;
  const totalSupports = supports.length;
  let confirmingSignalScore = 0.0;
  if (confirmCount >= 2) {
    confirmingSignalScore = CONFIDENCE_WEIGHTS.confirmingSignalMax;
  } else if (confirmCount === 1 && totalSupports >= 3) {
    confirmingSignalScore = 0.1;
  } else if (totalSupports >= 5) {
    confirmingSignalScore = 0.08;
  }

  // 5. External Corroboration (max 0.15)
  const corroborationScore = externalCorroboration ? CONFIDENCE_WEIGHTS.corroborationMax : 0.0;

  // 6. Consistency with Metadata (max 0.10)
  const consistencyScore = hasConsistentMetadata ? CONFIDENCE_WEIGHTS.consistencyMax : 0.0;

  // Sum raw positive signals (clamped to 1.0)
  const rawPositiveScore = Math.min(
    1.0,
    baseEvidenceScore +
      supportScore +
      diversityScore +
      confirmingSignalScore +
      corroborationScore +
      consistencyScore,
  );

  // 7. Contradictions & Reports Penalties
  let totalPenalty = 0.0;
  const penaltiesApplied: Array<{ reason: ReportReason; penalty: number }> = [];

  for (const report of reports) {
    const penalty = REPORT_PENALTIES[report.reason] ?? 0.08;
    totalPenalty += penalty;
    penaltiesApplied.push({ reason: report.reason, penalty });
  }

  // Compute final score
  const rawFinalScore = rawPositiveScore - totalPenalty;
  const clampedScore = Math.max(0.0, Math.min(1.0, rawFinalScore));
  const roundedScore = Math.round(clampedScore * 100) / 100;

  const breakdown: ConfidenceCalculationBreakdown = {
    baseEvidenceScore: Math.round(baseEvidenceScore * 100) / 100,
    supportScore: Math.round(supportScore * 100) / 100,
    diversityScore: Math.round(diversityScore * 100) / 100,
    confirmingSignalScore: Math.round(confirmingSignalScore * 100) / 100,
    corroborationScore: Math.round(corroborationScore * 100) / 100,
    consistencyScore: Math.round(consistencyScore * 100) / 100,
    rawPositiveScore: Math.round(rawPositiveScore * 100) / 100,
    penaltyScore: Math.round(totalPenalty * 100) / 100,
    penaltiesApplied,
  };

  return {
    score: roundedScore,
    evidenceCount: evidence.length,
    supportCount: supports.length,
    contradictionCount: reports.length,
    externalCorroboration,
    reasoning: breakdown,
    version: CONFIDENCE_ENGINE_VERSION,
  };
}
