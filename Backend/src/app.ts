import express from "express";
import type { Express } from "express";
import cors from "cors";

import { API_PREFIX } from "@offbeat/config";
import { env } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { errorMiddleware, AppError } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";
import { logger } from "./lib/logger.js";

export const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);

// Request access log
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    ip: req.ip,
  });
  next();
});

// Mount /api/v1 router
app.use(API_PREFIX, apiRouter);

// 404 handler for undefined routes
app.use((req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "NOT_FOUND"));
});

// Centralized error handling
app.use(errorMiddleware);
