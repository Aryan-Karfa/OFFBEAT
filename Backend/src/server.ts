import { createApp } from "./app.js";
import { appConfig } from "./config/app.config.js";
import { connectDatabase, disconnectDatabase } from "./lib/db/prisma.js";
import { logger } from "./lib/logger/logger.js";
import type { Server } from "node:http";

async function startServer(): Promise<Server> {
  logger.info(`Starting ${appConfig.serviceName} v${appConfig.version} [${appConfig.nodeEnv}]...`);

  // Verify database connectivity
  const dbConnected = await connectDatabase();
  if (dbConnected) {
    logger.info("PostgreSQL database connection established successfully.");
  } else {
    logger.warn(
      "PostgreSQL is not currently reachable. The server will start, but database-dependent features will report DATABASE_ERROR until PostgreSQL is online.",
    );
  }

  const app = createApp();

  const server = app.listen(appConfig.port, () => {
    logger.info(
      `OFFBEAT backend listening on http://localhost:${appConfig.port}${appConfig.apiPrefix}`,
    );
    logger.info(
      `Health check available at http://localhost:${appConfig.port}${appConfig.apiPrefix}/health`,
    );
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);

    server.close(async () => {
      logger.info("HTTP server closed.");
      await disconnectDatabase();
      logger.info("Database disconnected. Process terminating.");
      process.exit(0);
    });

    // Force exit after 10s timeout
    setTimeout(() => {
      logger.error("Forced termination due to shutdown timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return server;
}

startServer().catch((error) => {
  logger.error("Fatal startup error:", undefined, {}, error);
  process.exit(1);
});
