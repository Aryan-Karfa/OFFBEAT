import type {
  VerificationStatus,
  VerificationMethod,
  EvidenceStrength,
  VerificationExplanationDto,
  VerificationDetailDto,
  VerificationSummaryDto,
} from "@offbeat/shared";

export type {
  VerificationStatus,
  VerificationMethod,
  EvidenceStrength,
  VerificationExplanationDto,
  VerificationDetailDto,
  VerificationSummaryDto,
};

export interface VerificationRecordSnapshot {
  id: string;
  submissionId: string;
  status: VerificationStatus;
  method: VerificationMethod;
  reviewer?: string | null;
  reasoning?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VerificationAssessmentResult {
  status: VerificationStatus;
  method: VerificationMethod;
  reasoning: string;
}

export interface VerificationThresholds {
  verifiedMinScore: number;
  verifiedMinSupports: number;
  verifiedMinEvidence: number;
  verifiedMaxContradictions: number;
  supportedMinScore: number;
  supportedMinSupports: number;
  supportedMaxContradictions: number;
  flaggedMaxScore: number;
  flaggedMinContradictions: number;
}
