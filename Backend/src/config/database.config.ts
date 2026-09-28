import { env } from "./env.js";

export const databaseConfig = {
  url: env.DATABASE_URL,
  logQueries: env.NODE_ENV === "development",
  logLevels: (env.NODE_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["warn", "error"]) as ("query" | "info" | "warn" | "error")[],
} as const;

export type DatabaseConfig = typeof databaseConfig;
