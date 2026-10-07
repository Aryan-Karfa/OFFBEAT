import type { Request, Response, NextFunction } from "express";
import { memoryService, type MemoryService } from "./memory.service.js";
import {
  CreateMemoryEventSchema,
  UpdateMemoryItemSchema,
  UpdateMemorySettingSchema,
} from "./memory.schema.js";
import { sendSuccess } from "../../lib/http/response.js";
import { NotFoundError } from "../../lib/errors/AppError.js";
import { DEMO_USER_TRAVELER } from "../community/community.repository.js";

export class MemoryController {
  constructor(private service: MemoryService = memoryService) {}

  private extractUserId(req: Request): string {
    const headerUserId = req.headers["x-user-id"] as string | undefined;
    if (headerUserId && headerUserId.trim()) {
      return headerUserId.trim();
    }
    return DEMO_USER_TRAVELER.id;
  }

  public getMemories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const memories = await this.service.getMemories(userId);
      sendSuccess(res, memories, 200);
    } catch (error) {
      next(error);
    }
  };

  public getPersonalization = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const profile = await this.service.getPersonalizationProfile(userId);
      sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  };

  public recordEvent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const input = CreateMemoryEventSchema.parse(req.body);
      const result = await this.service.recordEvent(userId, input);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  };

  public updateMemoryItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const memoryId = req.params.memoryId as string;
      const input = UpdateMemoryItemSchema.parse(req.body);

      const updated = await this.service.updateMemoryItem(userId, memoryId, input);
      if (!updated) {
        throw new NotFoundError(`Memory item with ID ${memoryId} not found`);
      }

      sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  };

  public deleteMemoryItem = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const memoryId = req.params.memoryId as string;

      const deleted = await this.service.deleteMemoryItem(userId, memoryId);
      if (!deleted) {
        throw new NotFoundError(`Memory item with ID ${memoryId} not found`);
      }

      sendSuccess(res, { deleted: true, memoryId }, 200);
    } catch (error) {
      next(error);
    }
  };

  public clearAllMemories = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const count = await this.service.clearAllMemories(userId);
      sendSuccess(res, { cleared: true, count }, 200);
    } catch (error) {
      next(error);
    }
  };

  public getSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const settings = await this.service.getSetting(userId);
      sendSuccess(res, settings, 200);
    } catch (error) {
      next(error);
    }
  };

  public updateSettings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = this.extractUserId(req);
      const input = UpdateMemorySettingSchema.parse(req.body);
      const settings = await this.service.updateSetting(userId, input.memoryEnabled);
      sendSuccess(res, settings, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const memoryController = new MemoryController();
