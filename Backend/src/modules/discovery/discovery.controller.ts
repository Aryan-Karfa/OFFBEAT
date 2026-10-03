import type { Request, Response, NextFunction } from "express";
import { discoveryService, type DiscoveryService } from "./discovery.service.js";
import { sendSuccess } from "../../lib/http/response.js";
import type { ValidatedDiscoveryRequest } from "./discovery.schema.js";

export class DiscoveryController {
  constructor(private service: DiscoveryService = discoveryService) {}

  discover = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedBody = req.body as ValidatedDiscoveryRequest;
      const result = await this.service.discover(validatedBody, {
        requestId: req.requestId,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const discoveryController = new DiscoveryController();
