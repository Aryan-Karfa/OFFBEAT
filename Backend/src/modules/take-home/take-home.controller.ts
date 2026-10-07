import type { Request, Response, NextFunction } from "express";
import { takeHomeService, type TakeHomeService } from "./take-home.service.js";
import { sendSuccess } from "../../lib/http/response.js";
import type { ValidatedTakeHomeQuery } from "./take-home.schema.js";

export class TakeHomeController {
  constructor(private service: TakeHomeService = takeHomeService) {}

  getTakeHomeByDestination = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const destinationId = req.params.destinationId as string;
      const query = req.query as unknown as ValidatedTakeHomeQuery;

      const result = await this.service.getTakeHomeByDestination(destinationId, query, {
        requestId: req.requestId,
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

      const result = await this.service.getTakeHomeByPlace(placeId, query, {
        requestId: req.requestId,
      });

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const takeHomeController = new TakeHomeController();
