import { prisma, isDatabaseConnected } from "../../../lib/db/prisma.js";
import type { Prisma } from "@prisma/client";
import type { ConfidenceRecordSnapshot, ConfidenceResult } from "./confidence.types.js";

export class ConfidenceRepository {
  private inMemorySnapshots = new Map<string, ConfidenceRecordSnapshot[]>();

  /**
   * Save a new confidence snapshot.
   * Confidence records are immutable historical snapshots.
   */
  async createSnapshot(
    submissionId: string,
    result: ConfidenceResult,
  ): Promise<ConfidenceRecordSnapshot> {
    const id = `conf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();

    if (isDatabaseConnected()) {
      try {
        const record = await prisma.confidenceRecord.create({
          data: {
            submissionId,
            score: result.score,
            evidenceCount: result.evidenceCount,
            supportCount: result.supportCount,
            contradictionCount: result.contradictionCount,
            externalCorroboration: result.externalCorroboration,
            reasoning: result.reasoning as unknown as Prisma.InputJsonValue,
            calculatedAt: now,
            version: result.version,
          },
        });

        return {
          id: record.id,
          submissionId: record.submissionId,
          score: record.score,
          evidenceCount: record.evidenceCount,
          supportCount: record.supportCount,
          contradictionCount: record.contradictionCount,
          externalCorroboration: record.externalCorroboration,
          reasoning: record.reasoning,
          calculatedAt: record.calculatedAt,
          version: record.version,
        };
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    const snapshot: ConfidenceRecordSnapshot = {
      id,
      submissionId,
      score: result.score,
      evidenceCount: result.evidenceCount,
      supportCount: result.supportCount,
      contradictionCount: result.contradictionCount,
      externalCorroboration: result.externalCorroboration,
      reasoning: result.reasoning,
      calculatedAt: now,
      version: result.version,
    };

    const existing = this.inMemorySnapshots.get(submissionId) || [];
    existing.unshift(snapshot);
    this.inMemorySnapshots.set(submissionId, existing);

    return snapshot;
  }

  /**
   * Find the most recent confidence calculation for a submission.
   */
  async findLatestBySubmissionId(submissionId: string): Promise<ConfidenceRecordSnapshot | null> {
    if (isDatabaseConnected()) {
      try {
        const record = await prisma.confidenceRecord.findFirst({
          where: { submissionId },
          orderBy: { calculatedAt: "desc" },
        });

        if (record) {
          return {
            id: record.id,
            submissionId: record.submissionId,
            score: record.score,
            evidenceCount: record.evidenceCount,
            supportCount: record.supportCount,
            contradictionCount: record.contradictionCount,
            externalCorroboration: record.externalCorroboration,
            reasoning: record.reasoning,
            calculatedAt: record.calculatedAt,
            version: record.version,
          };
        }
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    const list = this.inMemorySnapshots.get(submissionId) || [];
    return list[0] || null;
  }

  /**
   * Find all historical confidence calculations for audit and trend inspection.
   */
  async findHistoryBySubmissionId(submissionId: string): Promise<ConfidenceRecordSnapshot[]> {
    if (isDatabaseConnected()) {
      try {
        const records = await prisma.confidenceRecord.findMany({
          where: { submissionId },
          orderBy: { calculatedAt: "desc" },
        });

        return records.map((record) => ({
          id: record.id,
          submissionId: record.submissionId,
          score: record.score,
          evidenceCount: record.evidenceCount,
          supportCount: record.supportCount,
          contradictionCount: record.contradictionCount,
          externalCorroboration: record.externalCorroboration,
          reasoning: record.reasoning,
          calculatedAt: record.calculatedAt,
          version: record.version,
        }));
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    return this.inMemorySnapshots.get(submissionId) || [];
  }
}

export const confidenceRepository = new ConfidenceRepository();
