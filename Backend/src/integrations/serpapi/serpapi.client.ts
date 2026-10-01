import { serpApiConfig, type SerpApiConfig } from "./serpapi.config.js";
import type { SerpApiSearchParameters } from "./serpapi.types.js";
import {
  SerpApiConfigurationError,
  SerpApiAuthenticationError,
  SerpApiRateLimitError,
  SerpApiTimeoutError,
  SerpApiNetworkError,
  SerpApiInvalidResponseError,
  SerpApiProviderError,
} from "./serpapi.errors.js";
import { logger } from "../../lib/logger/logger.js";

export class SerpApiClient {
  private config: SerpApiConfig;

  constructor(customConfig?: Partial<SerpApiConfig>) {
    this.config = {
      ...serpApiConfig,
      ...customConfig,
    };
  }

  /**
   * Helper to sleep with promise.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculates exponential backoff with random jitter.
   */
  private calculateBackoff(attempt: number): number {
    const base = this.config.retryBackoffBaseMs * Math.pow(2, attempt);
    const jitter = Math.floor(Math.random() * 100);
    return base + jitter;
  }

  /**
   * Executes a search against SerpApi HTTP API with timeout, retry, and error classification.
   */
  public async execute<T>(
    params: SerpApiSearchParameters,
    options?: { requestId?: string },
  ): Promise<T> {
    const apiKey = this.config.apiKey;

    if (!apiKey || !apiKey.trim()) {
      throw new SerpApiConfigurationError(
        "SERPAPI_API_KEY is not configured. Set SERPAPI_API_KEY environment variable to enable external queries.",
      );
    }

    const url = new URL(this.config.baseUrl);

    // Build URL search parameters safely
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && key !== "api_key") {
        url.searchParams.set(key, String(value));
      }
    }
    url.searchParams.set("api_key", apiKey);

    const maxRetries = this.config.maxRetries;
    const timeoutMs = this.config.timeoutMs;
    const requestId = options?.requestId;
    const engine = params.engine;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const durationMs = Date.now() - startTime;

        // HTTP 401 / 403: Authentication failure (do not retry)
        if (response.status === 401 || response.status === 403) {
          logger.warn(`SerpApi authentication failure [${response.status}]`, requestId, {
            engine,
            durationMs,
            attempt,
          });
          throw new SerpApiAuthenticationError();
        }

        // HTTP 429: Rate limit (do not retry immediately)
        if (response.status === 429) {
          logger.warn(`SerpApi rate limit reached [429]`, requestId, {
            engine,
            durationMs,
            attempt,
          });
          throw new SerpApiRateLimitError();
        }

        // HTTP 4xx: Bad request or client error (do not retry)
        if (response.status >= 400 && response.status < 500) {
          const errorText = await response.text();
          logger.warn(`SerpApi client error [${response.status}]`, requestId, {
            engine,
            durationMs,
            errorSnippet: errorText.slice(0, 200),
          });
          throw new SerpApiProviderError(
            `SerpApi error (${response.status}): ${errorText.slice(0, 100)}`,
          );
        }

        // HTTP 5xx: Server/provider error (retryable)
        if (response.status >= 500) {
          let errorMsg = `SerpApi server error (${response.status})`;
          try {
            const text = await response.text();
            if (text) errorMsg = `${errorMsg}: ${text.slice(0, 100)}`;
          } catch {
            // fallback to default
          }
          throw new SerpApiProviderError(errorMsg);
        }

        // Parse JSON response safely
        let data: unknown;
        try {
          data = await response.json();
        } catch {
          throw new SerpApiInvalidResponseError("Failed to parse SerpApi JSON response");
        }

        // SerpApi sometimes returns { error: "..." } with HTTP 200
        if (
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as Record<string, unknown>).error === "string"
        ) {
          const rawError = (data as Record<string, unknown>).error as string;
          const providerErr = rawError.toLowerCase();
          if (providerErr.includes("api key") || providerErr.includes("unauthorized")) {
            throw new SerpApiAuthenticationError(rawError);
          }
          if (providerErr.includes("rate limit") || providerErr.includes("quota")) {
            throw new SerpApiRateLimitError(rawError);
          }
          throw new SerpApiProviderError(rawError);
        }

        logger.info(`SerpApi request completed successfully`, requestId, {
          engine,
          durationMs,
          attempt,
        });

        return data as T;
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const durationMs = Date.now() - startTime;

        // If error is non-retryable (auth, config, rate limit, 4xx), rethrow immediately
        if (
          err instanceof SerpApiAuthenticationError ||
          err instanceof SerpApiRateLimitError ||
          err instanceof SerpApiConfigurationError
        ) {
          throw err;
        }

        const isAbort =
          (err instanceof Error && err.name === "AbortError") || controller.signal.aborted;

        // Check if timeout
        if (isAbort) {
          lastError = new SerpApiTimeoutError(`SerpApi request timed out after ${timeoutMs}ms`);
        } else if (
          err instanceof SerpApiInvalidResponseError ||
          err instanceof SerpApiProviderError
        ) {
          lastError = err;
        } else {
          const message =
            err instanceof Error ? err.message : "Network error communicating with SerpApi";
          lastError = new SerpApiNetworkError(message);
        }

        // If retries remain, back off and retry
        if (attempt < maxRetries) {
          const backoff = this.calculateBackoff(attempt);
          logger.warn(`SerpApi request failed, retrying in ${backoff}ms...`, requestId, {
            engine,
            attempt,
            durationMs,
            error: lastError.message,
          });
          await this.sleep(backoff);
        }
      }
    }

    throw lastError || new SerpApiProviderError("SerpApi request failed after all retry attempts");
  }
}
