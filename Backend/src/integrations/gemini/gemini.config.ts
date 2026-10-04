import { env } from "../../config/env.js";

export interface GeminiConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
  enabled: boolean;
}

export const geminiConfig: GeminiConfig = {
  apiKey: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
  model: env.GEMINI_MODEL || process.env.GEMINI_MODEL || "gemini-3.8-flash",
  timeoutMs: env.GEMINI_TIMEOUT_MS ?? 10000,
  maxRetries: env.GEMINI_MAX_RETRIES ?? 2,
  enabled: env.GEMINI_ENABLED ?? true,
};
