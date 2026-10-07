import type { Request, Response, NextFunction } from "express";
import { itineraryService, type ItineraryService } from "./itinerary.service.js";
import { createItinerarySchema, getItineraryParamsSchema } from "./itinerary.schema.js";
import { sendSuccess } from "../../lib/http/response.js";

export class ItineraryController {
  constructor(private service: ItineraryService = itineraryService) {}

  public createItinerary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedRequest = createItinerarySchema.parse(req.body);
      const requestId = req.requestId || (req.headers["x-request-id"] as string | undefined);

      const itinerary = await this.service.createItinerary(validatedRequest, { requestId });
      sendSuccess(res, itinerary, 201);
    } catch (err) {
      next(err);
    }
  };

  public getItinerary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { itineraryId } = getItineraryParamsSchema.parse(req.params);
      const itinerary = await this.service.getItineraryById(itineraryId);
      sendSuccess(res, itinerary, 200);
    } catch (err) {
      next(err);
    }
  };
}

export const itineraryController = new ItineraryController();
