import { Router } from "express";
import { placeController } from "./places.controller.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { placeParamsSchema } from "./places.schema.js";

export const placeRoutes: Router = Router();

// Category discovery helper
placeRoutes.get("/categories", placeController.listCategories);

// Canonical internal Place retrieval
placeRoutes.get(
  "/:placeId",
  validateRequest({ params: placeParamsSchema }),
  placeController.getPlace,
);
