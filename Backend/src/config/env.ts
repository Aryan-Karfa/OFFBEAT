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
  // SerpApi Configuration (Phase 6+)
  SERPAPI_API_KEY: z.string().optional(),
  SERPAPI_BASE_URL: z.string().default("https://serpapi.com/search"),
  SERPAPI_ENGINE_MAPS: z.string().default("google_maps"),
  SERPAPI_ENGINE_MAPS_REVIEWS: z.string().default("google_maps_reviews"),
  SERPAPI_ENGINE_MAPS_PHOTOS: z.string().default("google_maps_photos"),
  SERPAPI_ENGINE_MAPS_DIRECTIONS: z.string().default("google_maps_directions"),
  SERPAPI_ENGINE_FLIGHTS: z.string().default("google_flights"),
  SERPAPI_ENGINE_AUTOCOMPLETE: z.string().default("google_autocomplete"),
  SERPAPI_ENGINE_IMAGES: z.string().default("google_images"),
  SERPAPI_ENGINE_FORUMS: z.string().default("google_forums"),
  SERPAPI_ENGINE_LOCAL: z.string().default("google_local"),

  // Gemini Configuration (Phase 11)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.8-flash"),
  GEMINI_TIMEOUT_MS: z
    .string()
    .default("10000")
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed <= 0 ? 10000 : parsed;
    }),
  GEMINI_MAX_RETRIES: z
    .string()
    .default("2")
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 0 ? 2 : parsed;
    }),
  GEMINI_ENABLED: z
    .string()
    .default("true")
    .transform((val) => val !== "false" && val !== "0"),

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
