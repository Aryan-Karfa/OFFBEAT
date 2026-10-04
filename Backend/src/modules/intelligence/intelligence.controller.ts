import type { Request, Response, NextFunction } from "express";
import { timeService, type TimeService } from "./time/time.service.js";
import { crowdService, type CrowdService } from "./crowd/crowd.service.js";
import { sendSuccess } from "../../lib/http/response.js";
import type { TimeQueryInput, CreateTimeObservationInput } from "./time/time.schema.js";
import type { CrowdQueryInput, CreateCrowdObservationInput } from "./crowd/crowd.schema.js";

export class IntelligenceController {
  constructor(
    private timeSvc: TimeService = timeService,
    private crowdSvc: CrowdService = crowdService,
  ) {}

  getPlaceTimes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const placeId = req.params.placeId as string;
      const query = req.query as unknown as TimeQueryInput;
      const result = await this.timeSvc.getTimeIntelligenceForPlace(placeId, query, req.requestId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getPlaceCrowd = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const placeId = req.params.placeId as string;
      const query = req.query as unknown as CrowdQueryInput;
      const result = await this.crowdSvc.getCrowdIntelligenceForPlace(
        placeId,
        query,
        req.requestId,
      );
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getDestinationCrowd = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const destinationId = req.params.destinationId as string;
      const query = req.query as unknown as CrowdQueryInput;
      const result = await this.crowdSvc.getCrowdIntelligenceForDestination(
        destinationId,
        query,
        req.requestId,
      );
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  createPlaceTimeObservation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const placeId = req.params.placeId as string;
      const body = req.body as CreateTimeObservationInput;
      const userId =
        (req as { user?: { id: string } }).user?.id ||
        (req.headers["x-user-id"] as string) ||
        "user_demo_traveler";
      const created = await this.timeSvc.createTimeObservation(
        placeId,
        body,
        userId,
        req.requestId,
      );
      sendSuccess(res, created, 201);
    } catch (error) {
      next(error);
    }
  };

  createPlaceCrowdObservation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const placeId = req.params.placeId as string;
      const body = req.body as CreateCrowdObservationInput;
      const userId =
        (req as { user?: { id: string } }).user?.id ||
        (req.headers["x-user-id"] as string) ||
        "user_demo_traveler";
      const created = await this.crowdSvc.createCrowdObservation(
        body,
        userId,
        placeId,
        req.requestId,
      );
      sendSuccess(res, created, 201);
    } catch (error) {
      next(error);
    }
  };
}

export const intelligenceController = new IntelligenceController();
