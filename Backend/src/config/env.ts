import dotenv from "dotenv";
import { z } from "zod";

// Load environment files (.env.local, .env)
dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z
    .string()
    .default("5000")
    .transform((val) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error(`Invalid PORT number: ${val}`);
      }
      return parsed;
    }),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/offbeat_dev?schema=public"),
  SERPAPI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.8-flash"),
  JWT_SECRET: z.string().default("offbeat-dev-jwt-secret-change-in-production-never-commit"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown> = process.env): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("❌ Fatal Configuration Error: Invalid environment variables:\n" + errorDetails);
    throw new Error(`Environment validation failed:\n${errorDetails}`);
  }

  return result.data;
}

// Centralized parsed environment singleton
export const env = validateEnv(process.env);
