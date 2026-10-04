import { GeminiOutputValidationError } from "./gemini.errors.js";

/**
 * Normalizes raw output from Gemini:
 * - Strips Markdown code blocks (e.g. ```json ... ```)
 * - Parses JSON safely
 * - Trims strings recursively
 */
export function normalizeGeminiJson<T = unknown>(rawOutput: string): T {
  if (!rawOutput || typeof rawOutput !== "string") {
    throw new GeminiOutputValidationError("Gemini returned empty or non-string response");
  }

  let cleaned = rawOutput.trim();

  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
    cleaned = cleaned.trim();
  }

  try {
    const parsed = JSON.parse(cleaned);
    return trimStrings(parsed) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new GeminiOutputValidationError(`Failed to parse Gemini output as JSON: ${message}`);
  }
}

function trimStrings(val: unknown): unknown {
  if (typeof val === "string") {
    return val.trim();
  }
  if (Array.isArray(val)) {
    return val.map((item) => trimStrings(item));
  }
  if (val !== null && typeof val === "object") {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      res[k] = trimStrings(v);
    }
    return res;
  }
  return val;
}
