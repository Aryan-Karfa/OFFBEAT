import type { Request, Response, NextFunction } from "express";
import { discoveryService, type DiscoveryService } from "./discovery.service.js";
import { sendSuccess } from "../../lib/http/response.js";
import type { ValidatedDiscoveryRequest } from "./discovery.schema.js";

import { DEMO_USER_TRAVELER } from "../community/community.repository.js";

export class DiscoveryController {
  constructor(private service: DiscoveryService = discoveryService) {}

  private extractUserId(req: Request): string {
    const headerUserId = req.headers["x-user-id"] as string | undefined;
    if (headerUserId && headerUserId.trim()) {
      return headerUserId.trim();
    }
    return DEMO_USER_TRAVELER.id;
  }

  discover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedBody = req.body as ValidatedDiscoveryRequest;
      const userId = this.extractUserId(req);
      const result = await this.service.discover(validatedBody, {
        requestId: req.requestId,
        userId,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const discoveryController = new DiscoveryController();
