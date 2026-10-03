import { logger } from "../../lib/logger/logger.js";
import { NotFoundError, ConflictError } from "../../lib/errors/AppError.js";
import { isDatabaseConnected } from "../../lib/db/prisma.js";
import {
  communityRepository,
  type CommunityRepository,
  DEMO_USERS,
  DEMO_USER_TRAVELER,
} from "./community.repository.js";
import { placeRepository, type PlaceRepository } from "../places/places.repository.js";
import { userRepository, type UserRepository } from "../users/user.repository.js";
import {
  verificationService,
  type VerificationService,
} from "./verification/verification.service.js";
import { buildVerificationSummary } from "./verification/verification.explanations.js";
import type {
  CommunitySubmissionDto,
  CommunitySubmissionsListResponseDto,
  CommunitySignalSummaryDto,
  CommunityHighlightDto,
  SubmissionSupportSummaryDto,
  SubmissionAuthorDto,
  SubmissionEvidenceDto,
  SubmissionPlaceSummaryDto,
  SupportType,
  ReportReason,
  SubmissionRecord,
  SubmissionSupportRecord,
  SubmissionEvidenceRecord,
  VerificationStatus,
  VerificationSummaryDto,
  VerificationDetailDto,
} from "./community.types.js";
import type {
  CreateCommunitySubmissionInput,
  ListSubmissionsQueryInput,
} from "./community.schema.js";

export class CommunityService {
  constructor(
    private repo: CommunityRepository = communityRepository,
    private placesRepo: PlaceRepository = placeRepository,
    private userRepo: UserRepository = userRepository,
    private verifService: VerificationService = verificationService,
  ) {}

  /**
   * Create a new traveler community submission.
   */
  async createSubmission(
    input: CreateCommunitySubmissionInput,
    userId: string,
    requestId?: string,
  ): Promise<CommunitySubmissionDto> {
    const author = await this.resolveAuthor(userId);

    let placeInfo: SubmissionPlaceSummaryDto | null = null;
    let resolvedDestinationId = input.destinationId || null;

    if (input.placeId) {
      const place = await this.placesRepo.findPlaceByIdOrSlug(input.placeId);
      if (!place) {
        throw new NotFoundError(`Place with identifier '${input.placeId}' not found`);
      }
      placeInfo = {
        id: place.id,
        name: place.name,
        slug: place.slug,
        destination: place.destination?.name || null,
        region: place.destination?.regionId || null,
      };
      if (!resolvedDestinationId && place.destinationId) {
        resolvedDestinationId = place.destinationId;
      }
    }

    // Deterministic duplicate check
    const normalizedTitle = this.normalizeTitle(input.title);
    const isDuplicate = await this.repo.findDuplicateSubmission(
      author.id,
      input.placeId || null,
      input.type,
      normalizedTitle,
    );

    if (isDuplicate) {
      logger.warn("Prevented duplicate community submission", requestId, {
        userId: author.id,
        placeId: input.placeId,
        type: input.type,
        title: input.title,
      });
      throw new ConflictError(
        "A similar community discovery has already been shared by you for this place.",
      );
    }

    // Transform evidence
    const evidenceToCreate = (input.evidence || []).map((e) => ({
      type: e.type,
      source: e.source || "USER_CONTRIBUTION",
      content: e.content || null,
      mediaUrl: e.mediaUrl || null,
      externalReference: e.externalReference || null,
      metadata: null,
    }));

    const created = await this.repo.createSubmission(
      {
        userId: author.id,
        placeId: input.placeId || null,
        destinationId: resolvedDestinationId,
        type: input.type,
        title: input.title.trim(),
        content: input.content.trim(),
        status: "APPROVED", // Hackathon baseline initial approved status so demo contributions appear immediately
      },
      evidenceToCreate,
    );

    // Automatic recalculation: evaluate verification and confidence snapshot
    const evaluation = await this.verifService.evaluateSubmission(
      created as unknown as SubmissionRecord,
      requestId,
    );
    this.repo.attachVerificationToMemory(created.id, evaluation.verification);
    this.repo.attachConfidenceToMemory(created.id, evaluation.confidenceSnapshot);

    logger.info("Successfully created community submission", requestId, {
      submissionId: created.id,
      userId: author.id,
      placeId: input.placeId,
      type: input.type,
      verificationStatus: evaluation.verification.status,
      confidenceScore: evaluation.confidence.score,
    });

    const createdWithVerif = {
      ...(created as unknown as SubmissionRecord),
      verifications: [evaluation.verification],
      confidenceRecords: [evaluation.confidenceSnapshot],
    };

    return this.mapToDto(createdWithVerif as unknown as SubmissionRecord, author.id, placeInfo);
  }

  /**
   * List community submissions with filters and pagination.
   */
  async listSubmissions(
    query: ListSubmissionsQueryInput,
    currentUserId?: string,
    requestId?: string,
  ): Promise<CommunitySubmissionsListResponseDto> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);

    const { items, total } = await this.repo.findSubmissions({
      placeId: query.placeId,
      destinationId: query.destinationId,
      type: query.type,
      status: query.status,
      page,
      limit,
    });

    const mappedItems = await Promise.all(
      items.map((item) => this.mapToDto(item as unknown as SubmissionRecord, currentUserId)),
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasMore = page * limit < total;

    logger.info("Retrieved community submissions", requestId, {
      count: mappedItems.length,
      total,
      page,
      limit,
      placeId: query.placeId,
    });

    return {
      items: mappedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    };
  }

  /**
   * Retrieve a single submission by its unique identifier.
   */
  async getSubmissionById(
    submissionId: string,
    currentUserId?: string,
  ): Promise<CommunitySubmissionDto> {
    const submission = await this.repo.findSubmissionById(submissionId);
    if (!submission) {
      throw new NotFoundError(`Community submission with id '${submissionId}' not found`);
    }

    return this.mapToDto(submission as unknown as SubmissionRecord, currentUserId);
  }

  /**
   * Support or confirm a traveler submission.
   */
  async supportSubmission(
    submissionId: string,
    userId: string,
    type: SupportType = "USEFUL",
    requestId?: string,
  ): Promise<SubmissionSupportSummaryDto> {
    const author = await this.resolveAuthor(userId);
    const submission = await this.repo.findSubmissionById(submissionId);
    if (!submission) {
      throw new NotFoundError(`Community submission with id '${submissionId}' not found`);
    }

    const alreadySupported = await this.repo.hasUserSupported(submissionId, author.id, type);
    if (alreadySupported) {
      logger.warn("Duplicate support rejected", requestId, {
        submissionId,
        userId: author.id,
        type,
      });
      throw new ConflictError("You have already supported this discovery.");
    }

    try {
      await this.repo.createSupport(submissionId, author.id, type);
    } catch (err: unknown) {
      const errorWithCode = err as { code?: string };
      if (errorWithCode?.code === "P2002") {
        throw new ConflictError("You have already supported this discovery.");
      }
      throw err;
    }

    logger.info("Submission supported successfully", requestId, {
      submissionId,
      userId: author.id,
      type,
    });

    // Re-fetch to return latest support aggregate and trigger automatic recalculation
    const updated = await this.repo.findSubmissionById(submissionId);
    if (updated) {
      const evaluation = await this.verifService.evaluateSubmission(
        updated as unknown as SubmissionRecord,
        requestId,
      );
      this.repo.attachVerificationToMemory(submissionId, evaluation.verification);
      this.repo.attachConfidenceToMemory(submissionId, evaluation.confidenceSnapshot);
    }
    const supports = updated?.supports || [];

    return this.buildSupportSummary(supports, author.id);
  }

  /**
   * Report a community submission for review and trigger confidence recalculation.
   */
  async reportSubmission(
    submissionId: string,
    userId: string,
    reason: ReportReason,
    description?: string,
    requestId?: string,
  ) {
    const author = await this.resolveAuthor(userId);
    const submission = await this.repo.findSubmissionById(submissionId);
    if (!submission) {
      throw new NotFoundError(`Community submission with id '${submissionId}' not found`);
    }

    await this.repo.createReport(submissionId, author.id, reason, description);

    // Trigger automatic recalculation upon receiving a report
    const updated = await this.repo.findSubmissionById(submissionId);
    if (updated) {
      const evaluation = await this.verifService.evaluateSubmission(
        updated as unknown as SubmissionRecord,
        requestId,
      );
      this.repo.attachVerificationToMemory(submissionId, evaluation.verification);
      this.repo.attachConfidenceToMemory(submissionId, evaluation.confidenceSnapshot);
    }

    logger.info("Submission report submitted and confidence recalculated", requestId, {
      submissionId,
      userId: author.id,
      reason,
    });

    return {
      reported: true,
      submissionId,
      message: "Thank you for helping keep the community accurate and respectful.",
    };
  }

  /**
   * Retrieves full verification details for a submission.
   */
  async getSubmissionVerification(submissionId: string): Promise<VerificationDetailDto> {
    return this.verifService.getVerificationDetail(
      submissionId,
      async (id) => (await this.repo.findSubmissionById(id)) as unknown as SubmissionRecord | null,
    );
  }

  /**
   * Recalculates confidence and verification state for a submission (internal/testing/demo).
   */
  async recalculateSubmissionVerification(
    submissionId: string,
    requestId?: string,
  ): Promise<VerificationDetailDto> {
    const submission = await this.repo.findSubmissionById(submissionId);
    if (!submission) {
      throw new NotFoundError(`Community submission with id '${submissionId}' not found`);
    }

    const evaluation = await this.verifService.evaluateSubmission(
      submission as unknown as SubmissionRecord,
      requestId,
    );
    this.repo.attachVerificationToMemory(submissionId, evaluation.verification);
    this.repo.attachConfidenceToMemory(submissionId, evaluation.confidenceSnapshot);

    return this.getSubmissionVerification(submissionId);
  }

  /**
   * Compute community signal summary and highlights for a place.
   */
  async getCommunitySignalsForPlace(placeId: string): Promise<CommunitySignalSummaryDto> {
    const { items } = await this.repo.findSubmissionsByPlaceId(placeId);

    let usefulCount = 0;
    let confirmCount = 0;
    let verifiedCount = 0;
    let supportedCount = 0;

    for (const item of items) {
      for (const sup of item.supports) {
        if (sup.type === "USEFUL") usefulCount++;
        if (sup.type === "CONFIRM") confirmCount++;
      }

      const verifStatus = item.verifications?.[0]?.status;
      if (verifStatus === "COMMUNITY_VERIFIED") {
        verifiedCount++;
        supportedCount++;
      } else if (verifStatus === "COMMUNITY_SUPPORTED") {
        supportedCount++;
      }
    }

    // Sort highlights by support count descending
    const sorted = [...items].sort((a, b) => b.supports.length - a.supports.length);

    const highlights: CommunityHighlightDto[] = sorted.slice(0, 3).map((sub) => {
      const author = this.extractAuthorFromSubmission(sub as unknown as SubmissionRecord);

      let verification: VerificationSummaryDto | null = null;
      const latestVerif = sub.verifications?.[0];
      const latestConf = sub.confidenceRecords?.[0];
      if (latestVerif && latestConf) {
        verification = buildVerificationSummary(latestVerif.status as VerificationStatus, {
          score: latestConf.score,
          evidenceCount: latestConf.evidenceCount,
          supportCount: latestConf.supportCount,
          contradictionCount: latestConf.contradictionCount,
          externalCorroboration: latestConf.externalCorroboration,
          reasoning: {
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
          version: latestConf.version,
        });
      }

      return {
        id: sub.id,
        type: sub.type,
        title: sub.title,
        content: sub.content,
        supportCount: sub.supports.length,
        author: {
          displayName: author.displayName,
        },
        verification,
      };
    });

    return {
      submissionCount: items.length,
      usefulCount,
      confirmCount,
      verifiedCount,
      supportedCount,
      highlights,
    };
  }

  // ----------------------------------------------------
  // Helper / Mapping Methods
  // ----------------------------------------------------

  private async resolveAuthor(userId: string): Promise<SubmissionAuthorDto> {
    if (userId) {
      // Check seeded demo users first
      const demoUser = DEMO_USERS.find((u) => u.id === userId || u.username === userId);
      if (demoUser) {
        return {
          id: demoUser.id,
          username: demoUser.username,
          displayName: demoUser.displayName,
          avatarUrl: demoUser.avatarUrl,
        };
      }

      // Check DB if connected
      if (isDatabaseConnected()) {
        try {
          const user = await this.userRepo.findById(userId);
          if (user) {
            return {
              id: user.id,
              username: user.username,
              displayName: user.profile?.displayName || user.username,
              avatarUrl: user.profile?.avatarUrl || null,
            };
          }
        } catch {
          // DB offline or query error
        }
      }

      // If specific userId was supplied in headers/tests, keep identity
      return {
        id: userId,
        username: userId,
        displayName: "Traveler",
        avatarUrl: null,
      };
    }

    // Default fallback to first demo traveler
    return {
      id: DEMO_USER_TRAVELER.id,
      username: DEMO_USER_TRAVELER.username,
      displayName: DEMO_USER_TRAVELER.displayName,
      avatarUrl: DEMO_USER_TRAVELER.avatarUrl,
    };
  }

  private extractAuthorFromSubmission(submission: SubmissionRecord): SubmissionAuthorDto {
    if (submission.user) {
      return {
        id: submission.user.id,
        username: submission.user.username,
        displayName: submission.user.profile?.displayName || submission.user.username,
        avatarUrl: submission.user.profile?.avatarUrl || null,
      };
    }

    const demoUser = DEMO_USERS.find((u) => u.id === submission.userId);
    if (demoUser) {
      return {
        id: demoUser.id,
        username: demoUser.username,
        displayName: demoUser.displayName,
        avatarUrl: demoUser.avatarUrl,
      };
    }

    return {
      id: submission.userId,
      username: "traveler",
      displayName: "Offbeat Traveler",
      avatarUrl: null,
    };
  }

  private buildSupportSummary(
    supports: SubmissionSupportRecord[],
    currentUserId?: string,
  ): SubmissionSupportSummaryDto {
    let usefulCount = 0;
    let confirmCount = 0;
    let agreeCount = 0;
    let userSupported = false;
    let userSupportType: SupportType | null = null;

    for (const sup of supports) {
      if (sup.type === "USEFUL") usefulCount++;
      if (sup.type === "CONFIRM") confirmCount++;
      if (sup.type === "AGREE") agreeCount++;

      if (currentUserId && sup.userId === currentUserId) {
        userSupported = true;
        userSupportType = sup.type;
      }
    }

    return {
      count: supports.length,
      usefulCount,
      confirmCount,
      agreeCount,
      userSupported,
      userSupportType,
    };
  }

  private async mapToDto(
    submission: SubmissionRecord,
    currentUserId?: string,
    preloadedPlace?: SubmissionPlaceSummaryDto | null,
  ): Promise<CommunitySubmissionDto> {
    const author = this.extractAuthorFromSubmission(submission);
    const supports = submission.supports || [];
    const evidenceList = submission.evidence || [];
    const reports = submission.reports || [];

    let placeSummary: SubmissionPlaceSummaryDto | null = preloadedPlace || null;
    if (!placeSummary) {
      if (submission.place) {
        placeSummary = {
          id: submission.place.id,
          name: submission.place.name,
          slug: submission.place.slug,
          destination: submission.place.destination?.name || null,
          region: submission.place.destination?.regionId || null,
        };
      } else if (submission.placeId) {
        const place = await this.placesRepo.findPlaceByIdOrSlug(submission.placeId);
        if (place) {
          placeSummary = {
            id: place.id,
            name: place.name,
            slug: place.slug,
            destination: place.destination?.name || null,
            region: place.destination?.regionId || null,
          };
        }
      }
    }

    const evidenceDtos: SubmissionEvidenceDto[] = evidenceList.map(
      (e: SubmissionEvidenceRecord) => ({
        id: e.id,
        type: e.type,
        source: e.source || null,
        content: e.content || null,
        mediaUrl: e.mediaUrl || null,
        externalReference: e.externalReference || null,
        metadata: (e.metadata as Record<string, unknown>) || null,
        createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
      }),
    );

    let verification: VerificationSummaryDto | null = null;
    const latestVerif = submission.verifications?.[0];
    const latestConf = submission.confidenceRecords?.[0];
    if (latestVerif && latestConf) {
      verification = buildVerificationSummary(latestVerif.status as VerificationStatus, {
        score: latestConf.score,
        evidenceCount: latestConf.evidenceCount,
        supportCount: latestConf.supportCount,
        contradictionCount: latestConf.contradictionCount,
        externalCorroboration: latestConf.externalCorroboration,
        reasoning: {
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
        version: latestConf.version,
      });
    }

    return {
      id: submission.id,
      userId: submission.userId,
      placeId: submission.placeId || null,
      destinationId: submission.destinationId || null,
      type: submission.type,
      title: submission.title,
      content: submission.content,
      status: submission.status,
      createdAt:
        submission.createdAt instanceof Date
          ? submission.createdAt.toISOString()
          : submission.createdAt,
      updatedAt:
        submission.updatedAt instanceof Date
          ? submission.updatedAt.toISOString()
          : submission.updatedAt,
      author,
      place: placeSummary,
      evidence: evidenceDtos,
      support: this.buildSupportSummary(supports, currentUserId),
      reportCount: reports.length,
      verification,
    };
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }
}

export const communityService = new CommunityService();
