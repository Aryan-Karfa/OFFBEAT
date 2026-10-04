import { prisma, isDatabaseConnected } from "../../lib/db/prisma.js";
import type {
  SubmissionType,
  SubmissionStatus,
  EvidenceType,
  SupportType,
  ReportReason,
  ReportStatus,
  Prisma,
} from "@prisma/client";
import type { FindSubmissionsOptions } from "./community.types.js";
import type { VerificationRecordSnapshot } from "./verification/verification.types.js";
import type { ConfidenceRecordSnapshot } from "./confidence/confidence.types.js";

export interface DemoUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export const DEMO_USER_TRAVELER: DemoUser = {
  id: "user_demo_traveler",
  username: "offbeat_traveler",
  displayName: "Offbeat Traveler",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
};

export const DEMO_USER_SUPPORTER: DemoUser = {
  id: "user_demo_supporter",
  username: "darjeeling_explorer",
  displayName: "Darjeeling Explorer",
  avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120",
};

export const DEMO_USER_LOCAL: DemoUser = {
  id: "user_demo_local",
  username: "himalayan_wanderer",
  displayName: "Himalayan Wanderer",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
};

export const DEMO_USERS: DemoUser[] = [DEMO_USER_TRAVELER, DEMO_USER_SUPPORTER, DEMO_USER_LOCAL];

export interface InMemoryEvidence {
  id: string;
  submissionId: string;
  type: EvidenceType;
  source?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  externalReference?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface InMemorySupport {
  id: string;
  submissionId: string;
  userId: string;
  type: SupportType;
  createdAt: Date;
}

export interface InMemoryReport {
  id: string;
  submissionId: string;
  userId: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  createdAt: Date;
  resolvedAt?: Date | null;
}

export interface InMemorySubmission {
  id: string;
  userId: string;
  placeId?: string | null;
  destinationId?: string | null;
  type: SubmissionType;
  title: string;
  content: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
  evidence: InMemoryEvidence[];
  supports: InMemorySupport[];
  reports: InMemoryReport[];
  verifications?: VerificationRecordSnapshot[];
  confidenceRecords?: ConfidenceRecordSnapshot[];
}

export class CommunityRepository {
  private inMemorySubmissions: InMemorySubmission[] = [];
  private initialized = false;

  constructor() {
    this.initInMemoryData();
  }

  private initInMemoryData() {
    if (this.initialized) return;

    // Seeded Human-Feeling Discoveries for Tiger Hill
    const tigerHillBestTime: InMemorySubmission = {
      id: "sub_tiger_hill_best_time",
      userId: DEMO_USER_TRAVELER.id,
      placeId: "place_tiger_hill",
      destinationId: "dest_darjeeling",
      type: "BEST_TIME",
      title: "Arrive 30 minutes before first light",
      content:
        "Don't just aim for sunrise time—reach the summit ridge at least 30 to 40 minutes prior. The pre-dawn purple hue illuminating Mount Kanchenjunga before the crowds gather is unmatched.",
      status: "APPROVED",
      createdAt: new Date("2026-09-20T05:30:00Z"),
      updatedAt: new Date("2026-09-20T05:30:00Z"),
      evidence: [
        {
          id: "evi_th_1",
          submissionId: "sub_tiger_hill_best_time",
          type: "PHOTO",
          mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
          content: "Sunrise glow over Kanchenjunga seen from the upper ridge trail",
          createdAt: new Date("2026-09-20T05:35:00Z"),
        },
      ],
      supports: [
        {
          id: "sup_1",
          submissionId: "sub_tiger_hill_best_time",
          userId: DEMO_USER_SUPPORTER.id,
          type: "CONFIRM",
          createdAt: new Date("2026-09-21T06:00:00Z"),
        },
        {
          id: "sup_2",
          submissionId: "sub_tiger_hill_best_time",
          userId: DEMO_USER_LOCAL.id,
          type: "USEFUL",
          createdAt: new Date("2026-09-22T08:15:00Z"),
        },
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `sup_th_seed_${i + 3}`,
          submissionId: "sub_tiger_hill_best_time",
          userId: `seed_user_${i}`,
          type: i % 2 === 0 ? ("CONFIRM" as const) : ("USEFUL" as const),
          createdAt: new Date("2026-09-23T10:00:00Z"),
        })),
      ],
      reports: [],
      verifications: [
        {
          id: "verif_tiger_best_time",
          submissionId: "sub_tiger_hill_best_time",
          status: "COMMUNITY_VERIFIED",
          method: "EXTERNAL_CORROBORATION",
          reviewer: "system:verification-engine",
          reasoning:
            "Corroborated by verified external place records, 12 traveler supports (8 confirmations), and photo evidence.",
          createdAt: new Date("2026-09-24T10:00:00Z"),
          updatedAt: new Date("2026-09-24T10:00:00Z"),
        },
      ],
      confidenceRecords: [
        {
          id: "conf_tiger_best_time",
          submissionId: "sub_tiger_hill_best_time",
          score: 0.88,
          evidenceCount: 1,
          supportCount: 12,
          contradictionCount: 0,
          externalCorroboration: true,
          version: "confidence-v1",
          calculatedAt: new Date("2026-09-24T10:00:00Z"),
        },
      ],
    };

    const tigerHillPhotoSpot: InMemorySubmission = {
      id: "sub_tiger_hill_photo_spot",
      userId: DEMO_USER_SUPPORTER.id,
      placeId: "place_tiger_hill",
      destinationId: "dest_darjeeling",
      type: "PHOTO_SPOT",
      title: "Quieter side trail behind the observatory tower",
      content:
        "If the upper viewing deck is packed with tour groups, take the narrow pine needle path winding 150m south behind the tower. You get an unobstructed view with silhouetted prayer flags.",
      status: "APPROVED",
      createdAt: new Date("2026-09-22T06:10:00Z"),
      updatedAt: new Date("2026-09-22T06:10:00Z"),
      evidence: [
        {
          id: "evi_photo_1",
          submissionId: "sub_tiger_hill_photo_spot",
          type: "PHOTO",
          mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
          content: "Prayer flags over Kanchenjunga ridge from the side trail",
          createdAt: new Date("2026-09-22T06:12:00Z"),
        },
      ],
      supports: [
        {
          id: "sup_photo_1",
          submissionId: "sub_tiger_hill_photo_spot",
          userId: DEMO_USER_TRAVELER.id,
          type: "USEFUL",
          createdAt: new Date("2026-09-23T09:00:00Z"),
        },
        ...Array.from({ length: 8 }, (_, i) => ({
          id: `sup_photo_seed_${i + 2}`,
          submissionId: "sub_tiger_hill_photo_spot",
          userId: `seed_user_photo_${i}`,
          type: "USEFUL" as const,
          createdAt: new Date("2026-09-24T11:00:00Z"),
        })),
      ],
      reports: [],
      verifications: [
        {
          id: "verif_tiger_photo",
          submissionId: "sub_tiger_hill_photo_spot",
          status: "COMMUNITY_VERIFIED",
          method: "COMMUNITY_SIGNAL",
          reviewer: "system:verification-engine",
          reasoning: "Confirmed by 9 travelers and verified photo evidence.",
          createdAt: new Date("2026-09-24T12:00:00Z"),
          updatedAt: new Date("2026-09-24T12:00:00Z"),
        },
      ],
      confidenceRecords: [
        {
          id: "conf_tiger_photo",
          submissionId: "sub_tiger_hill_photo_spot",
          score: 0.82,
          evidenceCount: 1,
          supportCount: 9,
          contradictionCount: 0,
          externalCorroboration: true,
          version: "confidence-v1",
          calculatedAt: new Date("2026-09-24T12:00:00Z"),
        },
      ],
    };

    const tigerHillCrowdTip: InMemorySubmission = {
      id: "sub_tiger_hill_crowd_tip",
      userId: DEMO_USER_LOCAL.id,
      placeId: "place_tiger_hill",
      destinationId: "dest_darjeeling",
      type: "CROWD_TIP",
      title: "Weekends see heavy shared-jeep congestion from Ghum",
      content:
        "Leave Darjeeling town by 4:00 AM on Saturdays or Sundays. The single-lane road from Ghum backs up quickly. On weekdays, 4:30 AM is generally relaxed.",
      status: "APPROVED",
      createdAt: new Date("2026-09-25T07:20:00Z"),
      updatedAt: new Date("2026-09-25T07:20:00Z"),
      evidence: [],
      supports: [
        {
          id: "sup_crowd_1",
          submissionId: "sub_tiger_hill_crowd_tip",
          userId: DEMO_USER_TRAVELER.id,
          type: "CONFIRM",
          createdAt: new Date("2026-09-26T08:00:00Z"),
        },
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `sup_crowd_seed_${i + 2}`,
          submissionId: "sub_tiger_hill_crowd_tip",
          userId: `seed_user_crowd_${i}`,
          type: "CONFIRM" as const,
          createdAt: new Date("2026-09-27T09:00:00Z"),
        })),
      ],
      reports: [],
      verifications: [
        {
          id: "verif_tiger_crowd",
          submissionId: "sub_tiger_hill_crowd_tip",
          status: "COMMUNITY_SUPPORTED",
          method: "COMMUNITY_SIGNAL",
          reviewer: "system:verification-engine",
          reasoning: "Supported by 6 travelers (7 confirmations).",
          createdAt: new Date("2026-09-27T10:00:00Z"),
          updatedAt: new Date("2026-09-27T10:00:00Z"),
        },
      ],
      confidenceRecords: [
        {
          id: "conf_tiger_crowd",
          submissionId: "sub_tiger_hill_crowd_tip",
          score: 0.62,
          evidenceCount: 0,
          supportCount: 7,
          contradictionCount: 0,
          externalCorroboration: true,
          version: "confidence-v1",
          calculatedAt: new Date("2026-09-27T10:00:00Z"),
        },
      ],
    };

    // Batasia Loop Seed
    const batasiaLoopTip: InMemorySubmission = {
      id: "sub_batasia_loop_tip",
      userId: DEMO_USER_TRAVELER.id,
      placeId: "place_batasia_loop",
      destinationId: "dest_darjeeling",
      type: "TRAVEL_TIP",
      title: "Visit on the morning toy train loop",
      content:
        "Board the early joyride from Darjeeling to Ghum. The steam locomotive pauses at Batasia Loop for 10 minutes giving you time to step out into the war memorial garden.",
      status: "APPROVED",
      createdAt: new Date("2026-09-26T10:15:00Z"),
      updatedAt: new Date("2026-09-26T10:15:00Z"),
      evidence: [
        {
          id: "evi_batasia_1",
          submissionId: "sub_batasia_loop_tip",
          type: "PHOTO",
          mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
          content: "Darjeeling Himalayan Railway steam locomotive traversing Batasia spiral",
          createdAt: new Date("2026-09-26T10:20:00Z"),
        },
      ],
      supports: [
        {
          id: "sup_batasia_1",
          submissionId: "sub_batasia_loop_tip",
          userId: DEMO_USER_SUPPORTER.id,
          type: "CONFIRM",
          createdAt: new Date("2026-09-27T10:30:00Z"),
        },
        {
          id: "sup_batasia_2",
          submissionId: "sub_batasia_loop_tip",
          userId: DEMO_USER_LOCAL.id,
          type: "USEFUL",
          createdAt: new Date("2026-09-28T11:00:00Z"),
        },
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `sup_batasia_seed_${i + 3}`,
          submissionId: "sub_batasia_loop_tip",
          userId: `seed_user_batasia_${i}`,
          type: "CONFIRM" as const,
          createdAt: new Date("2026-09-28T14:00:00Z"),
        })),
      ],
      reports: [],
      verifications: [
        {
          id: "verif_batasia",
          submissionId: "sub_batasia_loop_tip",
          status: "COMMUNITY_VERIFIED",
          method: "COMMUNITY_SIGNAL",
          reviewer: "system:verification-engine",
          reasoning: "Confirmed by 7 travelers with photo evidence.",
          createdAt: new Date("2026-09-28T15:00:00Z"),
          updatedAt: new Date("2026-09-28T15:00:00Z"),
        },
      ],
      confidenceRecords: [
        {
          id: "conf_batasia",
          submissionId: "sub_batasia_loop_tip",
          score: 0.77,
          evidenceCount: 1,
          supportCount: 7,
          contradictionCount: 0,
          externalCorroboration: true,
          version: "confidence-v1",
          calculatedAt: new Date("2026-09-28T15:00:00Z"),
        },
      ],
    };

    // Victoria Memorial Seed
    const victoriaMemorialTip: InMemorySubmission = {
      id: "sub_victoria_memorial_tip",
      userId: DEMO_USER_SUPPORTER.id,
      placeId: "place_victoria_memorial",
      destinationId: "dest_kolkata",
      type: "BEST_TIME",
      title: "Golden hour around the North Pond",
      content:
        "Enter the gardens around 4:30 PM. The reflection of the white marble dome on the northern pond during sunset is far calmer than the main entrance.",
      status: "APPROVED",
      createdAt: new Date("2026-09-27T16:45:00Z"),
      updatedAt: new Date("2026-09-27T16:45:00Z"),
      evidence: [],
      supports: [
        {
          id: "sup_vm_1",
          submissionId: "sub_victoria_memorial_tip",
          userId: DEMO_USER_TRAVELER.id,
          type: "USEFUL",
          createdAt: new Date("2026-09-28T17:00:00Z"),
        },
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `sup_vm_seed_${i + 2}`,
          submissionId: "sub_victoria_memorial_tip",
          userId: `seed_user_vm_${i}`,
          type: "USEFUL" as const,
          createdAt: new Date("2026-09-29T18:00:00Z"),
        })),
      ],
      reports: [],
      verifications: [
        {
          id: "verif_vm",
          submissionId: "sub_victoria_memorial_tip",
          status: "COMMUNITY_SUPPORTED",
          method: "COMMUNITY_SIGNAL",
          reviewer: "system:verification-engine",
          reasoning: "Supported by 11 travelers.",
          createdAt: new Date("2026-09-29T19:00:00Z"),
          updatedAt: new Date("2026-09-29T19:00:00Z"),
        },
      ],
      confidenceRecords: [
        {
          id: "conf_vm",
          submissionId: "sub_victoria_memorial_tip",
          score: 0.58,
          evidenceCount: 0,
          supportCount: 11,
          contradictionCount: 0,
          externalCorroboration: true,
          version: "confidence-v1",
          calculatedAt: new Date("2026-09-29T19:00:00Z"),
        },
      ],
    };

    this.inMemorySubmissions = [
      tigerHillBestTime,
      tigerHillPhotoSpot,
      tigerHillCrowdTip,
      batasiaLoopTip,
      victoriaMemorialTip,
    ];

    this.initialized = true;
  }

  // ----------------------------------------------------
  // Read Operations
  // ----------------------------------------------------

  async findSubmissionById(id: string) {
    if (isDatabaseConnected()) {
      try {
        return await prisma.communitySubmission.findUnique({
          where: { id },
          include: {
            user: {
              include: { profile: true },
            },
            place: {
              include: { destination: true },
            },
            destination: true,
            evidence: true,
            supports: true,
            reports: true,
            verifications: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            confidenceRecords: {
              orderBy: { calculatedAt: "desc" },
              take: 1,
            },
          },
        });
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    return this.inMemorySubmissions.find((s) => s.id === id) || null;
  }

  async findSubmissions(options: FindSubmissionsOptions) {
    const { placeId, destinationId, type, status, userId, page, limit } = options;
    const skip = (page - 1) * limit;

    if (isDatabaseConnected()) {
      try {
        const where: Prisma.CommunitySubmissionWhereInput = {};
        if (placeId) where.placeId = placeId;
        if (destinationId) where.destinationId = destinationId;
        if (type) where.type = type;
        if (status) where.status = status;
        if (userId) where.userId = userId;

        const [items, total] = await Promise.all([
          prisma.communitySubmission.findMany({
            where,
            include: {
              user: {
                include: { profile: true },
              },
              place: {
                include: { destination: true },
              },
              destination: true,
              evidence: true,
              supports: true,
              reports: true,
              verifications: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              confidenceRecords: {
                orderBy: { calculatedAt: "desc" },
                take: 1,
              },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.communitySubmission.count({ where }),
        ]);

        return { items, total };
      } catch {
        // Fall back to in-memory on query failure
      }
    }

    let filtered = [...this.inMemorySubmissions];

    if (placeId) {
      filtered = filtered.filter((s) => s.placeId === placeId);
    }
    if (destinationId) {
      filtered = filtered.filter((s) => s.destinationId === destinationId);
    }
    if (type) {
      filtered = filtered.filter((s) => s.type === type);
    }
    if (status) {
      filtered = filtered.filter((s) => s.status === status);
    }
    if (userId) {
      filtered = filtered.filter((s) => s.userId === userId);
    }

    // Sort newest first
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const items = filtered.slice(skip, skip + limit);

    return { items, total };
  }

  async findSubmissionsByPlaceId(placeId: string) {
    return this.findSubmissions({
      placeId,
      page: 1,
      limit: 50,
    });
  }

  async findDuplicateSubmission(
    userId: string,
    placeId: string | null | undefined,
    type: SubmissionType,
    normalizedTitle: string,
  ): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const existing = await prisma.communitySubmission.findMany({
          where: {
            userId,
            placeId: placeId || null,
            type,
          },
          select: { title: true },
        });

        return existing.some((sub) => this.normalizeTitle(sub.title) === normalizedTitle);
      } catch {
        // Fallback
      }
    }

    return this.inMemorySubmissions.some(
      (sub) =>
        sub.userId === userId &&
        (sub.placeId || null) === (placeId || null) &&
        sub.type === type &&
        this.normalizeTitle(sub.title) === normalizedTitle,
    );
  }

  // ----------------------------------------------------
  // Write Operations
  // ----------------------------------------------------

  async createSubmission(
    data: {
      userId: string;
      placeId?: string | null;
      destinationId?: string | null;
      type: SubmissionType;
      title: string;
      content: string;
      status?: SubmissionStatus;
    },
    evidenceList: Array<{
      type: EvidenceType;
      source?: string | null;
      content?: string | null;
      mediaUrl?: string | null;
      externalReference?: string | null;
      metadata?: Record<string, unknown> | null;
    }> = [],
  ) {
    if (isDatabaseConnected()) {
      try {
        return await prisma.communitySubmission.create({
          data: {
            userId: data.userId,
            placeId: data.placeId || null,
            destinationId: data.destinationId || null,
            type: data.type,
            title: data.title,
            content: data.content,
            status: data.status || "PENDING",
            evidence: {
              create: evidenceList.map((e) => ({
                type: e.type,
                source: e.source,
                content: e.content,
                mediaUrl: e.mediaUrl,
                externalReference: e.externalReference,
                metadata: (e.metadata as Prisma.InputJsonValue) ?? undefined,
              })),
            },
          },
          include: {
            user: {
              include: { profile: true },
            },
            place: {
              include: { destination: true },
            },
            destination: true,
            evidence: true,
            supports: true,
            reports: true,
          },
        });
      } catch {
        // Fall back to in-memory on error
      }
    }

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const inMemoryEvidence: InMemoryEvidence[] = evidenceList.map((e, idx) => ({
      id: `evi_${submissionId}_${idx}`,
      submissionId,
      type: e.type,
      source: e.source || null,
      content: e.content || null,
      mediaUrl: e.mediaUrl || null,
      externalReference: e.externalReference || null,
      metadata: e.metadata || null,
      createdAt: now,
    }));

    const newSubmission: InMemorySubmission = {
      id: submissionId,
      userId: data.userId,
      placeId: data.placeId || null,
      destinationId: data.destinationId || null,
      type: data.type,
      title: data.title,
      content: data.content,
      status: data.status || "PENDING",
      createdAt: now,
      updatedAt: now,
      evidence: inMemoryEvidence,
      supports: [],
      reports: [],
    };

    this.inMemorySubmissions.unshift(newSubmission);
    return newSubmission;
  }

  async hasUserSupported(
    submissionId: string,
    userId: string,
    type?: SupportType,
  ): Promise<boolean> {
    if (isDatabaseConnected()) {
      try {
        const count = await prisma.submissionSupport.count({
          where: {
            submissionId,
            userId,
            ...(type ? { type } : {}),
          },
        });
        return count > 0;
      } catch {
        // Fallback
      }
    }

    const sub = this.inMemorySubmissions.find((s) => s.id === submissionId);
    if (!sub) return false;
    return sub.supports.some((sup) => sup.userId === userId && (!type || sup.type === type));
  }

  async createSupport(submissionId: string, userId: string, type: SupportType = "USEFUL") {
    if (isDatabaseConnected()) {
      try {
        return await prisma.submissionSupport.create({
          data: {
            submissionId,
            userId,
            type,
          },
        });
      } catch (err: unknown) {
        // Prisma unique constraint code P2002
        const errorWithCode = err as { code?: string };
        if (errorWithCode?.code === "P2002") {
          throw err;
        }
        // Fall back to in-memory on connection error
      }
    }

    const sub = this.inMemorySubmissions.find((s) => s.id === submissionId);
    if (!sub) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    const alreadySupported = sub.supports.some((sup) => sup.userId === userId && sup.type === type);
    if (alreadySupported) {
      const error = new Error("Unique constraint violation") as Error & { code?: string };
      error.code = "P2002";
      throw error;
    }

    const support: InMemorySupport = {
      id: `sup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      submissionId,
      userId,
      type,
      createdAt: new Date(),
    };

    sub.supports.push(support);
    return support;
  }

  async createReport(
    submissionId: string,
    userId: string,
    reason: ReportReason,
    description?: string,
  ) {
    if (isDatabaseConnected()) {
      try {
        return await prisma.submissionReport.create({
          data: {
            submissionId,
            userId,
            reason,
            description: description || null,
            status: "PENDING",
          },
        });
      } catch {
        // Fallback
      }
    }

    const sub = this.inMemorySubmissions.find((s) => s.id === submissionId);
    if (!sub) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    const report: InMemoryReport = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      submissionId,
      userId,
      reason,
      description: description || null,
      status: "PENDING",
      createdAt: new Date(),
      resolvedAt: null,
    };

    sub.reports.push(report);
    return report;
  }

  attachVerificationToMemory(submissionId: string, verification: VerificationRecordSnapshot) {
    const sub = this.inMemorySubmissions.find((s) => s.id === submissionId);
    if (sub) {
      if (!sub.verifications) sub.verifications = [];
      sub.verifications.unshift(verification);
    }
  }

  attachConfidenceToMemory(submissionId: string, confidence: ConfidenceRecordSnapshot) {
    const sub = this.inMemorySubmissions.find((s) => s.id === submissionId);
    if (sub) {
      if (!sub.confidenceRecords) sub.confidenceRecords = [];
      sub.confidenceRecords.unshift(confidence);
    }
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }
}

export const communityRepository = new CommunityRepository();
