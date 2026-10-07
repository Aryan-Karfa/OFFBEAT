import { Router } from "express";
import { placeController } from "./places.controller.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { placeParamsSchema } from "./places.schema.js";
import { intelligenceController } from "../intelligence/intelligence.controller.js";
import { timeQuerySchema, createTimeObservationSchema } from "../intelligence/time/time.schema.js";
import {
  crowdQuerySchema,
  createCrowdObservationSchema,
} from "../intelligence/crowd/crowd.schema.js";
import { alternativesController } from "../alternatives/alternatives.controller.js";
import { findAlternativesQuerySchema } from "../alternatives/alternatives.schema.js";


export const placeRoutes: Router = Router();

// Category discovery helper
placeRoutes.get("/categories", placeController.listCategories);

// Canonical internal Place retrieval
placeRoutes.get(
  "/:placeId",
  validateRequest({ params: placeParamsSchema }),
  placeController.getPlace,
);

// Phase 10: Time & Crowd Intelligence Endpoints
placeRoutes.get(
  "/:placeId/times",
  validateRequest({ params: placeParamsSchema, query: timeQuerySchema }),
  intelligenceController.getPlaceTimes,
);

placeRoutes.get(
  "/:placeId/crowd",
  validateRequest({ params: placeParamsSchema, query: crowdQuerySchema }),
  intelligenceController.getPlaceCrowd,
);

placeRoutes.post(
  "/:placeId/time-observations",
  validateRequest({ params: placeParamsSchema, body: createTimeObservationSchema }),
  intelligenceController.createPlaceTimeObservation,
);

placeRoutes.post(
  "/:placeId/crowd-observations",
  validateRequest({ params: placeParamsSchema, body: createCrowdObservationSchema }),
  intelligenceController.createPlaceCrowdObservation,
);

// Phase 12: Find An Alternative Endpoint
placeRoutes.get(
  "/:placeId/alternatives",
  validateRequest({ params: placeParamsSchema, query: findAlternativesQuerySchema }),
  alternativesController.getAlternatives,
);

