import { calculateConfidence, CONFIDENCE_ENGINE_VERSION } from "./confidence.engine.js";
import { confidenceRepository, type ConfidenceRepository } from "./confidence.repository.js";
import type {
  ConfidenceCalculationSignals,
  ConfidenceRecordSnapshot,
  ConfidenceResult,
} from "./confidence.types.js";
import { logger } from "../../../lib/logger/logger.js";

export class ConfidenceService {
  constructor(private repo: ConfidenceRepository = confidenceRepository) {}

  /**
   * Evaluates signals and records a new immutable confidence snapshot.
   */
  async evaluateAndRecord(
    submissionId: string,
    signals: ConfidenceCalculationSignals,
    requestId?: string,
  ): Promise<{ result: ConfidenceResult; snapshot: ConfidenceRecordSnapshot }> {
    const result = calculateConfidence(signals);

    const snapshot = await this.repo.createSnapshot(submissionId, result);

    logger.info("Recorded confidence snapshot", requestId, {
      submissionId,
      score: result.score,
      evidenceCount: result.evidenceCount,
      supportCount: result.supportCount,
      contradictionCount: result.contradictionCount,
      externalCorroboration: result.externalCorroboration,
      version: CONFIDENCE_ENGINE_VERSION,
    });

    return { result, snapshot };
  }

  /**
   * Retrieves the latest confidence calculation for a submission.
   */
  async getLatestConfidence(submissionId: string): Promise<ConfidenceRecordSnapshot | null> {
    return this.repo.findLatestBySubmissionId(submissionId);
  }

  /**
   * Retrieves the calculation history for a submission.
   */
  async getConfidenceHistory(submissionId: string): Promise<ConfidenceRecordSnapshot[]> {
    return this.repo.findHistoryBySubmissionId(submissionId);
  }
}

export const confidenceService = new ConfidenceService();
