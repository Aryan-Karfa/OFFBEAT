import { Router } from "express";
import { discoveryController } from "./discovery.controller.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { discoveryRequestSchema } from "./discovery.schema.js";

export const discoveryRoutes: Router = Router();

/**
 * POST /api/v1/discover
 * Primary intelligence endpoint for contextual place discovery.
 */
discoveryRoutes.post(
  "/",
  validateRequest({ body: discoveryRequestSchema }),
  discoveryController.discover,
);
