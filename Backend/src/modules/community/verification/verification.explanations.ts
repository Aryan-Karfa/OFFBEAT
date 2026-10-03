import type {
  VerificationStatus,
  VerificationSummaryDto,
  VerificationDetailDto,
} from "@offbeat/shared";
import type { ConfidenceResult } from "../confidence/confidence.types.js";
import {
  deriveEvidenceStrength,
  generateConfidenceExplanation,
} from "../confidence/confidence.explanations.js";
import type { VerificationRecordSnapshot } from "./verification.types.js";

/**
 * Maps verification snapshot and confidence result to user-facing summary DTO.
 */
export function buildVerificationSummary(
  status: VerificationStatus,
  confidence: ConfidenceResult,
): VerificationSummaryDto {
  const strength = deriveEvidenceStrength(confidence);
  const explanation = generateConfidenceExplanation(confidence);

  return {
    status,
    strength,
    score: confidence.score,
    headline: explanation.headline,
    supportedCount: confidence.supportCount,
    externalCorroborated: confidence.externalCorroboration,
  };
}

/**
 * Builds full detail DTO for GET /submissions/:id/verification endpoint.
 */
export function buildVerificationDetail(
  submissionId: string,
  verification: VerificationRecordSnapshot,
  confidence: ConfidenceResult,
  extraSignals?: {
    confirmCount?: number;
    hasPhoto?: boolean;
  },
): VerificationDetailDto {
  const strength = deriveEvidenceStrength(confidence);
  const explanation = generateConfidenceExplanation(confidence, extraSignals);

  return {
    submissionId,
    status: verification.status,
    method: verification.method,
    confidence: {
      score: confidence.score,
      evidenceCount: confidence.evidenceCount,
      supportCount: confidence.supportCount,
      contradictionCount: confidence.contradictionCount,
      externalCorroboration: confidence.externalCorroboration,
      version: confidence.version,
    },
    strength,
    explanation,
    updatedAt:
      typeof verification.updatedAt === "string"
        ? verification.updatedAt
        : verification.updatedAt.toISOString(),
  };
}
