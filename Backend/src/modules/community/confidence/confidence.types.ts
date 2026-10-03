import type {
  EvidenceType,
  SupportType,
  ReportReason,
  ConfidenceSummaryDto,
} from "@offbeat/shared";

export interface ConfidenceEvidenceInput {
  type: EvidenceType;
  source?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  externalReference?: string | null;
}

export interface ConfidenceSupportInput {
  userId: string;
  type: SupportType;
}

export interface ConfidenceReportInput {
  userId: string;
  reason: ReportReason;
  description?: string | null;
}

export interface ConfidenceCalculationSignals {
  evidence: ConfidenceEvidenceInput[];
  supports: ConfidenceSupportInput[];
  reports: ConfidenceReportInput[];
  externalCorroboration: boolean;
  hasConsistentMetadata?: boolean;
}

export interface ConfidenceCalculationBreakdown {
  baseEvidenceScore: number;
  supportScore: number;
  diversityScore: number;
  confirmingSignalScore: number;
  corroborationScore: number;
  consistencyScore: number;
  rawPositiveScore: number;
  penaltyScore: number;
  penaltiesApplied: Array<{ reason: ReportReason; penalty: number }>;
}

export interface ConfidenceResult {
  score: number;
  evidenceCount: number;
  supportCount: number;
  contradictionCount: number;
  externalCorroboration: boolean;
  reasoning: ConfidenceCalculationBreakdown;
  version: string;
}

export interface ConfidenceRecordSnapshot extends ConfidenceSummaryDto {
  id: string;
  submissionId: string;
  reasoning?: unknown;
  calculatedAt: Date | string;
}
