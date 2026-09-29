import { Router } from "express";
import { geographyController } from "./geography.controller.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { countryParamsSchema, regionParamsSchema } from "./geography.schema.js";

export const countryRoutes: Router = Router();
countryRoutes.get("/", geographyController.listCountries);
countryRoutes.get(
  "/:countryId",
  validateRequest({ params: countryParamsSchema }),
  geographyController.getCountry,
);
countryRoutes.get(
  "/:countryId/regions",
  validateRequest({ params: countryParamsSchema }),
  geographyController.getCountryRegions,
);

export const regionRoutes: Router = Router();
regionRoutes.get(
  "/:regionId",
  validateRequest({ params: regionParamsSchema }),
  geographyController.getRegion,
);
regionRoutes.get(
  "/:regionId/destinations",
  validateRequest({ params: regionParamsSchema }),
  geographyController.getRegionDestinations,
);
