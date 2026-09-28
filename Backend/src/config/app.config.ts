import { env } from "./env.js";

export const appConfig = {
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  apiPrefix: "/api/v1",
  corsOrigin: env.CORS_ORIGIN,
  jsonBodyLimit: "10mb",
  serviceName: "offbeat-backend",
  version: "0.1.0",
} as const;

export type AppConfig = typeof appConfig;
