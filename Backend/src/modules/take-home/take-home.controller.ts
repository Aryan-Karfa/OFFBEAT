import type { Request, Response, NextFunction } from "express";
import { takeHomeService, type TakeHomeService } from "./take-home.service.js";
import { sendSuccess } from "../../lib/http/response.js";
import type { ValidatedTakeHomeQuery } from "./take-home.schema.js";

import { DEMO_USER_TRAVELER } from "../community/community.repository.js";

export class TakeHomeController {
  constructor(private service: TakeHomeService = takeHomeService) {}

  private extractUserId(req: Request): string {
    const headerUserId = req.headers["x-user-id"] as string | undefined;
    if (headerUserId && headerUserId.trim()) {
      return headerUserId.trim();
    }
    return DEMO_USER_TRAVELER.id;
  }

  getTakeHomeByDestination = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const destinationId = req.params.destinationId as string;
      const query = req.query as unknown as ValidatedTakeHomeQuery;
      const userId = this.extractUserId(req);

      const result = await this.service.getTakeHomeByDestination(destinationId, query, {
        requestId: req.requestId,
        userId,
      });

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  getTakeHomeByPlace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const placeId = req.params.placeId as string;
      const query = req.query as unknown as ValidatedTakeHomeQuery;
      const userId = this.extractUserId(req);

      const result = await this.service.getTakeHomeByPlace(placeId, query, {
        requestId: req.requestId,
        userId,
      });

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const takeHomeController = new TakeHomeController();
