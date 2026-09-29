import type { Request, Response, NextFunction } from "express";
import { placeService, type PlaceService } from "./places.service.js";
import { sendSuccess } from "../../lib/http/response.js";

export class PlaceController {
  constructor(private service: PlaceService = placeService) {}

  getPlace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const place = await this.service.getPlaceById(req.params.placeId as string);
      sendSuccess(res, place, 200);
    } catch (error) {
      next(error);
    }
  };

  listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.service.getCategories();
      sendSuccess(res, categories, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const placeController = new PlaceController();
