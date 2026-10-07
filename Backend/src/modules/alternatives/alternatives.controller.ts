import type { Request, Response, NextFunction } from "express";
import { alternativesService, type AlternativesService } from "./alternatives.service.js";
import { sendSuccess } from "../../lib/http/response.js";
import type { ValidatedAlternativesQuery } from "./alternatives.schema.js";

export class AlternativesController {
  constructor(private service: AlternativesService = alternativesService) {}

  getAlternatives = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const placeId = req.params.placeId as string;
      const query = req.query as unknown as ValidatedAlternativesQuery;

      const result = await this.service.findAlternatives(placeId, query, {
        requestId: req.requestId,
      });

      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}

export const alternativesController = new AlternativesController();
