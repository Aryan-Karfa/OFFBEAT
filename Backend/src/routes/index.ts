import { Router } from "express";
import { sendSuccess } from "../lib/http/response.js";
import { appConfig } from "../config/app.config.js";
import { userRoutes } from "../modules/users/user.routes.js";
import { countryRoutes, regionRoutes } from "../modules/geography/geography.routes.js";
import { placeRoutes } from "../modules/places/places.routes.js";

export const apiRouter: Router = Router();

// Baseline Health Endpoint
apiRouter.get("/health", (req, res) => {
  sendSuccess(res, {
    status: "ok",
    service: appConfig.serviceName,
    version: appConfig.version,
    environment: appConfig.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Phase 4: Baseline Foundational Domain Module
apiRouter.use("/users", userRoutes);

// Phase 5: Geography & Place Domain Modules
apiRouter.use("/countries", countryRoutes);
apiRouter.use("/regions", regionRoutes);
apiRouter.use("/places", placeRoutes);

// Reserved Future Domain Endpoints (Phases 6-11):
// apiRouter.use("/auth", authRoutes);
// apiRouter.use("/profile", profileRoutes);
// apiRouter.use("/discover", discoveryRoutes);
// apiRouter.use("/recommendations", recommendationRoutes);
// apiRouter.use("/community", communityRoutes);
// apiRouter.use("/itineraries", itineraryRoutes);
// apiRouter.use("/take-home", takeHomeRoutes);
// apiRouter.use("/saved-places", savedPlacesRoutes);
