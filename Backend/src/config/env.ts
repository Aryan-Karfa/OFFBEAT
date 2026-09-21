import dotenv from "dotenv";
import { z } from "zod";
import { DEFAULT_GEMINI_MODEL, DEFAULT_SERVER_PORT } from "@offbeat/config";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(DEFAULT_SERVER_PORT),
  DATABASE_URL: z.string().optional().default(""),
  SERPAPI_API_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default(DEFAULT_GEMINI_MODEL),
  JWT_SECRET: z.string().optional().default("offbeat_development_jwt_secret"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
