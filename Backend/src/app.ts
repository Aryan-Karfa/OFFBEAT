import express, { type Express } from "express";
import cors from "cors";
import { appConfig } from "./config/app.config.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";
import { logger } from "./lib/logger/logger.js";

export function createApp(): Express {
  const app: Express = express();

  // Basic security and request parsing
  app.disable("x-powered-by");

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Allow configured origin or local development
        if (
          origin === appConfig.corsOrigin ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked request from origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
      exposedHeaders: [
        "X-Request-ID",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
      ],
    }),
  );

  // Request ID tracking (must run before body parsers and routes)
  app.use(requestIdMiddleware);

  // JSON Body parsing with strict size limits
  app.use(express.json({ limit: appConfig.jsonBodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: appConfig.jsonBodyLimit }));

  // Structured HTTP request logging
  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - startTime;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

      logger[level](
        `${req.method} ${req.originalUrl} [${res.statusCode}] - ${durationMs}ms`,
        req.requestId,
        {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs,
          userAgent: req.get("user-agent"),
          ip: req.ip,
        },
      );
    });

    next();
  });

  // Mount API Router
  app.use(appConfig.apiPrefix, apiRouter);

  // 404 Handler for undefined routes
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
