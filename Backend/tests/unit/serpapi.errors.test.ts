import { describe, it, expect } from "vitest";
import {
  SerpApiError,
  SerpApiConfigurationError,
  SerpApiAuthenticationError,
  SerpApiRateLimitError,
  SerpApiTimeoutError,
  SerpApiNetworkError,
  SerpApiInvalidResponseError,
  SerpApiProviderError,
} from "../../src/integrations/serpapi/serpapi.errors.js";
import { AppError } from "../../src/lib/errors/AppError.js";
import { ERROR_CODES } from "../../src/lib/errors/errorCodes.js";

describe("SerpApi Errors", () => {
  it("SerpApiError base class should inherit from AppError and Error", () => {
    const error = new SerpApiError("Base error", 500);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(500);
  });

  it("SerpApiConfigurationError should have status 500", () => {
    const err = new SerpApiConfigurationError();
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(err.message).toContain("API key missing or invalid");
  });

  it("SerpApiAuthenticationError should have status 502", () => {
    const err = new SerpApiAuthenticationError();
    expect(err.statusCode).toBe(502);
    expect(err.message).toContain("authentication failed");
  });

  it("SerpApiRateLimitError should have status 429 and RATE_LIMITED code", () => {
    const err = new SerpApiRateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe(ERROR_CODES.RATE_LIMITED);
  });

  it("SerpApiTimeoutError should have status 504", () => {
    const err = new SerpApiTimeoutError();
    expect(err.statusCode).toBe(504);
  });

  it("SerpApiNetworkError should have status 502", () => {
    const err = new SerpApiNetworkError();
    expect(err.statusCode).toBe(502);
  });

  it("SerpApiInvalidResponseError should have status 502", () => {
    const err = new SerpApiInvalidResponseError();
    expect(err.statusCode).toBe(502);
  });

  it("SerpApiProviderError should have status 502", () => {
    const err = new SerpApiProviderError("Provider failure");
    expect(err.statusCode).toBe(502);
    expect(err.message).toBe("Provider failure");
  });
});
