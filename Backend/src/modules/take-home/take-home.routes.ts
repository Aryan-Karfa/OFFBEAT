import { Router } from "express";
import { takeHomeController } from "./take-home.controller.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { takeHomeDestinationParamsSchema, takeHomeQuerySchema } from "./take-home.schema.js";

export const takeHomeRoutes: Router = Router();

// Primary route: GET /api/v1/take-home/:destinationId
takeHomeRoutes.get(
  "/:destinationId",
  validateRequest({
    params: takeHomeDestinationParamsSchema,
    query: takeHomeQuerySchema,
  }),
  takeHomeController.getTakeHomeByDestination,
);
