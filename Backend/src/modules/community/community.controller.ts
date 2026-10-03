import type { Request, Response, NextFunction } from "express";
import { communityService, type CommunityService } from "./community.service.js";
import {
  CreateCommunitySubmissionSchema,
  ListSubmissionsQuerySchema,
  CreateSupportSchema,
  CreateReportSchema,
} from "./community.schema.js";
import { sendSuccess } from "../../lib/http/response.js";
import { DEMO_USER_TRAVELER } from "./community.repository.js";

export class CommunityController {
  constructor(private service: CommunityService = communityService) {}

  private extractUserId(req: Request): string {
    const headerUserId = req.headers["x-user-id"] as string | undefined;
    if (headerUserId && headerUserId.trim()) {
      return headerUserId.trim();
    }
    // Fallback to primary demo traveler identity
    return DEMO_USER_TRAVELER.id;
  }

  createSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedInput = CreateCommunitySubmissionSchema.parse(req.body);
      const userId = this.extractUserId(req);
      const requestId = req.requestId;

      const submission = await this.service.createSubmission(validatedInput, userId, requestId);

      sendSuccess(res, submission, 201);
    } catch (error) {
      next(error);
    }
  };

  listSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedQuery = ListSubmissionsQuerySchema.parse(req.query);
      const userId = this.extractUserId(req);
      const requestId = req.requestId;

      const result = await this.service.listSubmissions(validatedQuery, userId, requestId);

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissionId = req.params.submissionId as string;
      const userId = this.extractUserId(req);

      const submission = await this.service.getSubmissionById(submissionId, userId);

      sendSuccess(res, submission, 200);
    } catch (error) {
      next(error);
    }
  };

  supportSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissionId = req.params.submissionId as string;
      const validatedBody = CreateSupportSchema.parse(req.body || {});
      const userId = this.extractUserId(req);
      const requestId = req.requestId;

      const supportSummary = await this.service.supportSubmission(
        submissionId,
        userId,
        validatedBody.type,
        requestId,
      );

      sendSuccess(res, supportSummary, 201);
    } catch (error) {
      next(error);
    }
  };

  reportSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissionId = req.params.submissionId as string;
      const validatedBody = CreateReportSchema.parse(req.body);
      const userId = this.extractUserId(req);
      const requestId = req.requestId;

      const reportResult = await this.service.reportSubmission(
        submissionId,
        userId,
        validatedBody.reason,
        validatedBody.description,
        requestId,
      );

      sendSuccess(res, reportResult, 201);
    } catch (error) {
      next(error);
    }
  };
}

export const communityController = new CommunityController();
