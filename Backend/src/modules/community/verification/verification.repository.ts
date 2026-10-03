import { prisma, isDatabaseConnected } from "../../../lib/db/prisma.js";
import type {
  VerificationAssessmentResult,
  VerificationRecordSnapshot,
  VerificationStatus,
  VerificationMethod,
} from "./verification.types.js";

export class VerificationRepository {
  private inMemoryVerifications = new Map<string, VerificationRecordSnapshot[]>();

  /**
   * Save a new verification record or update existing verification state.
   */
  async upsertVerification(
    submissionId: string,
    assessment: VerificationAssessmentResult,
    reviewer: string = "system:deterministic-engine",
  ): Promise<VerificationRecordSnapshot> {
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const record = await prisma.verificationRecord.create({
          data: {
            submissionId,
            status: assessment.status as unknown as import("@prisma/client").VerificationStatus,
            method: assessment.method as unknown as import("@prisma/client").VerificationMethod,
            reviewer,
            reasoning: assessment.reasoning,
            createdAt: now,
            updatedAt: now,
          },
        });

        return {
          id: record.id,
          submissionId: record.submissionId,
          status: record.status as VerificationStatus,
          method: record.method as VerificationMethod,
          reviewer: record.reviewer,
          reasoning: record.reasoning,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    const id = `verif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const snapshot: VerificationRecordSnapshot = {
      id,
      submissionId,
      status: assessment.status,
      method: assessment.method,
      reviewer,
      reasoning: assessment.reasoning,
      createdAt: now,
      updatedAt: now,
    };

    const existing = this.inMemoryVerifications.get(submissionId) || [];
    existing.unshift(snapshot);
    this.inMemoryVerifications.set(submissionId, existing);

    return snapshot;
  }

  /**
   * Find the most recent verification record for a submission.
   */
  async findLatestBySubmissionId(submissionId: string): Promise<VerificationRecordSnapshot | null> {
    if (isDatabaseConnected()) {
      try {
        const record = await prisma.verificationRecord.findFirst({
          where: { submissionId },
          orderBy: { createdAt: "desc" },
        });

        if (record) {
          return {
            id: record.id,
            submissionId: record.submissionId,
            status: record.status as VerificationStatus,
            method: record.method as VerificationMethod,
            reviewer: record.reviewer,
            reasoning: record.reasoning,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          };
        }
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    const list = this.inMemoryVerifications.get(submissionId) || [];
    return list[0] || null;
  }

  /**
   * Find all verification history records for a submission.
   */
  async findHistoryBySubmissionId(submissionId: string): Promise<VerificationRecordSnapshot[]> {
    if (isDatabaseConnected()) {
      try {
        const records = await prisma.verificationRecord.findMany({
          where: { submissionId },
          orderBy: { createdAt: "desc" },
        });

        return records.map((record) => ({
          id: record.id,
          submissionId: record.submissionId,
          status: record.status as VerificationStatus,
          method: record.method as VerificationMethod,
          reviewer: record.reviewer,
          reasoning: record.reasoning,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        }));
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    return this.inMemoryVerifications.get(submissionId) || [];
  }
}

export const verificationRepository = new VerificationRepository();
