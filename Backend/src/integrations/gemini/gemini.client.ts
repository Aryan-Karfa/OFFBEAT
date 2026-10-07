import { GoogleGenAI } from "@google/genai";
import { geminiConfig, type GeminiConfig } from "./gemini.config.js";

import {
  GeminiConfigurationError,
  GeminiAuthenticationError,
  GeminiTimeoutError,
  GeminiRateLimitError,
  GeminiProviderError,
  GeminiOutputValidationError,
  GeminiSafetyBlockedError,
} from "./gemini.errors.js";
import {
  GEMINI_SYSTEM_INSTRUCTION,
  buildDiscoveryReasoningPrompt,
  buildAlternativeReasoningPrompt,
} from "./gemini.prompts.js";
import { normalizeGeminiJson } from "./gemini.normalizer.js";
import {
  discoveryReasoningOutputSchema,
  alternativeReasoningOutputSchema,
  type DiscoveryReasoningOutput,
} from "./gemini.schemas.js";
import {
  validateCandidateAllowlist,
  checkBusinessAndHallucinationGuards,
  validateAlternativeCandidateAllowlist,
  checkAlternativeBusinessGuards,
} from "./gemini.guard.js";
import {
  type DiscoveryReasoningInputDto,
  type DiscoveryReasoningResultDto,
  type AlternativeReasoningInputDto,
  type AlternativeReasoningResultDto,
  type ReasoningProvider,
} from "./gemini.types.js";
import { logger } from "../../lib/logger/logger.js";

export class GeminiClient implements ReasoningProvider {
  private ai: GoogleGenAI | null = null;
  private config: GeminiConfig;

  constructor(config: GeminiConfig = geminiConfig) {
    this.config = config;
    if (this.config.apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.config.apiKey });
      } catch (err) {
        logger.error("Failed to initialize GoogleGenAI client", undefined, {}, err as Error);
      }
    }
  }

  async reason(input: DiscoveryReasoningInputDto): Promise<DiscoveryReasoningResultDto> {
    if (!this.config.apiKey) {
      throw new GeminiConfigurationError("GEMINI_API_KEY is not configured on the server");
    }

    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: this.config.apiKey });
    }

    if (!input.candidates || input.candidates.length === 0) {
      throw new GeminiProviderError("No candidates supplied for Gemini reasoning");
    }

    const allowedCandidateIds = input.candidates.map((c) => c.id);
    const userPrompt = buildDiscoveryReasoningPrompt(input);

    const rawResponseText = await this.executeWithRetryAndTimeout(userPrompt);

    // 1. Normalize and parse JSON
    const parsedJson = normalizeGeminiJson<unknown>(rawResponseText);

    // 2. Schema validation via Zod
    const schemaResult = discoveryReasoningOutputSchema.safeParse(parsedJson);
    if (!schemaResult.success) {
      const issueDetails = schemaResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new GeminiOutputValidationError(
        `Gemini output failed schema validation: ${issueDetails}`,
      );
    }

    const output: DiscoveryReasoningOutput = schemaResult.data;

    // 3. Candidate allowlist validation
    const allowlistResult = validateCandidateAllowlist(output, allowedCandidateIds);
    if (!allowlistResult.valid) {
      throw new GeminiOutputValidationError(
        `Gemini returned unapproved candidate IDs: ${allowlistResult.errors.join("; ")}`,
      );
    }

    // 4. Business & hallucination guards
    const guardResult = checkBusinessAndHallucinationGuards(output, input);
    if (!guardResult.valid) {
      throw new GeminiOutputValidationError(
        `Gemini output violated business constraints: ${guardResult.errors.join("; ")}`,
      );
    }

    return {
      selectedPlaceIds: output.selectedPlaceIds,
      primaryRecommendationId: output.primaryRecommendationId,
      recommendationSummary: output.recommendationSummary,
      reasons: output.reasons,
      tradeoffs: output.tradeoffs,
      contextualNotes: output.contextualNotes,
      source: "GEMINI",
    };
  }

  async reasonAboutAlternative(
    input: AlternativeReasoningInputDto,
  ): Promise<AlternativeReasoningResultDto> {
    if (!this.config.apiKey) {
      throw new GeminiConfigurationError("GEMINI_API_KEY is not configured on the server");
    }

    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: this.config.apiKey });
    }

    if (!input.candidates || input.candidates.length === 0) {
      throw new GeminiProviderError("No candidates supplied for Gemini alternative reasoning");
    }

    const allowedCandidateIds = input.candidates
      .map((c) => c.placeId || c.externalId || "")
      .filter(Boolean);

    const userPrompt = buildAlternativeReasoningPrompt(input);
    const rawResponseText = await this.executeWithRetryAndTimeout(userPrompt);

    // 1. Normalize and parse JSON
    const parsedJson = normalizeGeminiJson<unknown>(rawResponseText);

    // 2. Schema validation via Zod
    const schemaResult = alternativeReasoningOutputSchema.safeParse(parsedJson);
    if (!schemaResult.success) {
      const issueDetails = schemaResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new GeminiOutputValidationError(
        `Gemini alternative output failed schema validation: ${issueDetails}`,
      );
    }

    const output = schemaResult.data;

    // 3. Candidate allowlist validation
    const allowlistResult = validateAlternativeCandidateAllowlist(output, allowedCandidateIds);
    if (!allowlistResult.valid) {
      throw new GeminiOutputValidationError(
        `Gemini returned unapproved alternative candidate IDs: ${allowlistResult.errors.join("; ")}`,
      );
    }

    // 4. Business & hallucination guards
    const guardResult = checkAlternativeBusinessGuards(output, input);
    if (!guardResult.valid) {
      throw new GeminiOutputValidationError(
        `Gemini alternative output violated business constraints: ${guardResult.errors.join("; ")}`,
      );
    }

    return {
      selectedCandidateIds: output.selectedCandidateIds,
      primaryCandidateId: output.primaryCandidateId || output.selectedCandidateIds[0],
      explanation: output.explanation,
      mode: output.mode,
      tradeoff: output.tradeoff,
      relationship: output.relationship,
      source: "GEMINI",
    };
  }


  private async executeWithRetryAndTimeout(userPrompt: string): Promise<string> {
    let lastError: unknown = null;
    const maxRetries = Math.max(0, this.config.maxRetries);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeCallWithTimeout(userPrompt);
      } catch (err: unknown) {
        lastError = err;
        const isRetryable = this.isRetryableError(err);
        if (!isRetryable || attempt >= maxRetries) {
          throw this.mapToGeminiError(err);
        }

        const backoffMs = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 200, 3000);
        logger.warn(
          "Transient error during Gemini call, retrying...",
          undefined,
          { attempt: attempt + 1, backoffMs },
          err as Error,
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    throw this.mapToGeminiError(lastError);
  }

  private async executeCallWithTimeout(userPrompt: string): Promise<string> {
    const timeoutMs = this.config.timeoutMs || 10000;

    let timer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new GeminiTimeoutError(`Gemini request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const callPromise = (async () => {
        const response = await this.ai!.models.generateContent({
          model: this.config.model,
          contents: userPrompt,
          config: {
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
          },
        });

        // Safety blocks check
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === "SAFETY") {
          throw new GeminiSafetyBlockedError("Gemini output was blocked by safety settings");
        }

        const text = response.text;
        if (!text) {
          throw new GeminiOutputValidationError("Gemini returned empty response text");
        }
        return text;
      })();

      return await Promise.race([callPromise, timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private isRetryableError(err: unknown): boolean {
    if (!err || typeof err !== "object") return false;
    const status =
      (err as { status?: number; code?: number })?.status ||
      (err as { status?: number; code?: number })?.code;
    const message = ((err as Error)?.message || "").toLowerCase();

    if (status === 503 || status === 429 || status === 500 || status === 504) return true;
    if (
      message.includes("high demand") ||
      message.includes("resource exhausted") ||
      message.includes("timeout") ||
      message.includes("econnreset")
    ) {
      return true;
    }
    return false;
  }

  private mapToGeminiError(err: unknown): Error {
    if (
      err instanceof GeminiTimeoutError ||
      err instanceof GeminiOutputValidationError ||
      err instanceof GeminiSafetyBlockedError ||
      err instanceof GeminiAuthenticationError ||
      err instanceof GeminiRateLimitError ||
      err instanceof GeminiConfigurationError
    ) {
      return err;
    }

    const message = ((err as Error)?.message || "").toLowerCase();
    const status = (err as { status?: number })?.status;

    if (
      status === 401 ||
      status === 403 ||
      message.includes("api key not valid") ||
      message.includes("unauthorized")
    ) {
      return new GeminiAuthenticationError(
        `Gemini authentication error: ${(err as Error)?.message}`,
      );
    }

    if (status === 429 || message.includes("quota") || message.includes("resource exhausted")) {
      return new GeminiRateLimitError(
        `Gemini rate limit or quota exceeded: ${(err as Error)?.message}`,
      );
    }

    if (status === 504 || message.includes("timed out")) {
      return new GeminiTimeoutError(`Gemini timeout error: ${(err as Error)?.message}`);
    }

    return new GeminiProviderError(
      `Gemini provider error: ${(err as Error)?.message || String(err)}`,
    );
  }
}
