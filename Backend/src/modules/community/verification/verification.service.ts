import { logger } from "../../../lib/logger/logger.js";
import { isDatabaseConnected, prisma } from "../../../lib/db/prisma.js";
import { verificationRepository, type VerificationRepository } from "./verification.repository.js";
import { confidenceService, type ConfidenceService } from "../confidence/confidence.service.js";
import { assessVerificationState } from "./verification.engine.js";
import { buildVerificationDetail, buildVerificationSummary } from "./verification.explanations.js";
import type {
  VerificationAssessmentResult,
  VerificationDetailDto,
  VerificationRecordSnapshot,
  VerificationSummaryDto,
} from "./verification.types.js";
import type {
  ConfidenceCalculationSignals,
  ConfidenceResult,
  ConfidenceRecordSnapshot,
} from "../confidence/confidence.types.js";
import { NotFoundError } from "../../../lib/errors/AppError.js";
import type { SubmissionRecord } from "../community.types.js";

export class VerificationService {
  constructor(
    private verifRepo: VerificationRepository = verificationRepository,
    private confService: ConfidenceService = confidenceService,
  ) {}

  /**
   * Recalculates confidence and verification state for a community submission.
   * Can be called whenever a submission is created, supported, reported, or manually refreshed.
   */
  async evaluateSubmission(
    submission: SubmissionRecord,
    requestId?: string,
  ): Promise<{
    verification: VerificationRecordSnapshot;
    confidence: ConfidenceResult;
    confidenceSnapshot: ConfidenceRecordSnapshot;
    summary: VerificationSummaryDto;
  }> {
    const submissionId = submission.id;

    // 1. Gather signals
    const evidenceInputs = (submission.evidence || []).map((e) => ({
      type: e.type,
      source: e.source,
      content: e.content,
      mediaUrl: e.mediaUrl,
      externalReference: e.externalReference,
    }));

    const supportInputs = (submission.supports || []).map((s) => ({
      userId: s.userId,
      type: s.type,
    }));

    const reportInputs = (submission.reports || []).map((r) => {
      const rep = r as { userId?: string; reason?: unknown; description?: string | null };
      return {
        userId: rep.userId || "anonymous",
        reason: (rep.reason as import("@offbeat/shared").ReportReason) || "OTHER",
        description: rep.description,
      };
    });

    const confirmCount = supportInputs.filter((s) => s.type === "CONFIRM").length;

    // 2. Determine external corroboration
    const externalCorroboration = await this.checkExternalCorroboration(submission.placeId);

    const calculationSignals: ConfidenceCalculationSignals = {
      evidence: evidenceInputs,
      supports: supportInputs,
      reports: reportInputs,
      externalCorroboration,
      hasConsistentMetadata: Boolean(submission.placeId || submission.destinationId),
    };

    // 3. Calculate and record confidence snapshot
    const { result: confidenceResult, snapshot: confidenceSnapshot } =
      await this.confService.evaluateAndRecord(submissionId, calculationSignals, requestId);

    // 4. Assess verification state deterministically
    const assessment: VerificationAssessmentResult = assessVerificationState(confidenceResult, {
      confirmCount,
      isModerationRejected: submission.status === "REJECTED",
    });

    // 5. Upsert verification state
    const verification = await this.verifRepo.upsertVerification(
      submissionId,
      assessment,
      "system:verification-engine",
    );

    const summary = buildVerificationSummary(verification.status, confidenceResult);

    logger.info("Evaluated verification state for submission", requestId, {
      submissionId,
      status: verification.status,
      method: verification.method,
      score: confidenceResult.score,
      externalCorroboration,
    });

    return {
      verification,
      confidence: confidenceResult,
      confidenceSnapshot,
      summary,
    };
  }

  /**
   * Retrieves full verification details for a submission.
   */
  async getVerificationDetail(
    submissionId: string,
    submissionGetter: (id: string) => Promise<SubmissionRecord | null>,
  ): Promise<VerificationDetailDto> {
    const submission = await submissionGetter(submissionId);
    if (!submission) {
      throw new NotFoundError(`Community submission with id '${submissionId}' not found`);
    }

    // Try finding latest verification snapshot
    let latestVerification = await this.verifRepo.findLatestBySubmissionId(submissionId);
    let latestConfidenceSnapshot = await this.confService.getLatestConfidence(submissionId);

    // If missing, evaluate now on-the-fly
    if (!latestVerification || !latestConfidenceSnapshot) {
      const evaluation = await this.evaluateSubmission(submission);
      latestVerification = evaluation.verification;
      latestConfidenceSnapshot = evaluation.confidenceSnapshot;
    }

    const confirmCount = (submission.supports || []).filter((s) => s.type === "CONFIRM").length;
    const hasPhoto = (submission.evidence || []).some((e) => e.type === "PHOTO");

    const confidenceResult: ConfidenceResult = {
      score: latestConfidenceSnapshot.score,
      evidenceCount: latestConfidenceSnapshot.evidenceCount,
      supportCount: latestConfidenceSnapshot.supportCount,
      contradictionCount: latestConfidenceSnapshot.contradictionCount,
      externalCorroboration: latestConfidenceSnapshot.externalCorroboration,
      reasoning:
        (latestConfidenceSnapshot.reasoning as unknown as import("../confidence/confidence.types.js").ConfidenceCalculationBreakdown) || {
          baseEvidenceScore: 0,
          supportScore: 0,
          diversityScore: 0,
          confirmingSignalScore: 0,
          corroborationScore: 0,
          consistencyScore: 0,
          rawPositiveScore: 0,
          penaltyScore: 0,
          penaltiesApplied: [],
        },
      version: latestConfidenceSnapshot.version,
    };

    return buildVerificationDetail(submissionId, latestVerification, confidenceResult, {
      confirmCount,
      hasPhoto,
    });
  }

  /**
   * Checks whether the associated place has verified external references in SerpApi or internal canonical store.
   */
  private async checkExternalCorroboration(placeId?: string | null): Promise<boolean> {
    if (!placeId) {
      return false;
    }

    // In PostgreSQL DB mode
    if (isDatabaseConnected()) {
      try {
        const ref = await prisma.externalPlaceReference.findFirst({
          where: { placeId },
        });
        if (ref) return true;

        const place = await prisma.place.findUnique({
          where: { id: placeId },
          select: { id: true, rating: true, reviewCount: true },
        });
        if (place && (place.rating != null || (place.reviewCount ?? 0) > 0)) {
          return true;
        }
      } catch {
        // Fall back to memory check
      }
    }

    // Known seeded places corroborated by external references
    const seededCorroboratedPlaces = [
      "place_tiger_hill",
      "place_batasia_loop",
      "place_victoria_memorial",
      "place_darjeeling_mall",
      "place_ghoom_monastery",
      "place_howrah_bridge",
      "place_dakshineswar",
    ];

    if (seededCorroboratedPlaces.includes(placeId)) {
      return true;
    }

    return false;
  }
}

export const verificationService = new VerificationService();
