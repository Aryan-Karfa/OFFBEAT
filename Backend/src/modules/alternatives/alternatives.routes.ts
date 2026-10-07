import { Router } from "express";
import { alternativesController } from "./alternatives.controller.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { placeParamsSchema } from "../places/places.schema.js";
import { findAlternativesQuerySchema } from "./alternatives.schema.js";

export const alternativesRoutes: Router = Router();

// Phase 12: Direct alternatives route
alternativesRoutes.get(
  "/:placeId",
  validateRequest({ params: placeParamsSchema, query: findAlternativesQuerySchema }),
  alternativesController.getAlternatives,
);
