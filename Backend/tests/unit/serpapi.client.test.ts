import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SerpApiClient } from "../../src/integrations/serpapi/serpapi.client.js";
import {
  SerpApiConfigurationError,
  SerpApiAuthenticationError,
  SerpApiRateLimitError,
  SerpApiInvalidResponseError,
  SerpApiProviderError,
} from "../../src/integrations/serpapi/serpapi.errors.js";

describe("SerpApiClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should throw SerpApiConfigurationError if API key is missing or empty", async () => {
    const client = new SerpApiClient({ apiKey: "" });

    await expect(client.execute({ engine: "google_maps", q: "test" })).rejects.toThrow(
      SerpApiConfigurationError,
    );
  });

  it("should successfully execute request and return parsed JSON on HTTP 200", async () => {
    const mockData = { local_results: [{ title: "Place A" }] };

    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => mockData,
    });
    globalThis.fetch = mockFetch;

    const client = new SerpApiClient({ apiKey: "test_key", maxRetries: 0 });
    const result = await client.execute<typeof mockData>({
      engine: "google_maps",
      q: "Darjeeling",
    });

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Verify API key was passed in query params
    const firstCall = mockFetch.mock.calls[0];
    const calledUrl = firstCall ? String(firstCall[0]) : "";
    expect(calledUrl).toContain("api_key=test_key");
    expect(calledUrl).toContain("engine=google_maps");
  });

  it("should throw SerpApiAuthenticationError on HTTP 401 without retrying", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 401,
      text: async () => "Unauthorized",
    });

    const client = new SerpApiClient({ apiKey: "invalid_key", maxRetries: 2 });

    await expect(client.execute({ engine: "google_maps", q: "test" })).rejects.toThrow(
      SerpApiAuthenticationError,
    );

    // No retry on auth failure
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("should throw SerpApiRateLimitError on HTTP 429 without retrying", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 429,
      text: async () => "Too Many Requests",
    });

    const client = new SerpApiClient({ apiKey: "test_key", maxRetries: 2 });

    await expect(client.execute({ engine: "google_maps", q: "test" })).rejects.toThrow(
      SerpApiRateLimitError,
    );

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("should classify { error: 'Invalid API key' } in HTTP 200 as SerpApiAuthenticationError", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ error: "Invalid API key" }),
    });

    const client = new SerpApiClient({ apiKey: "bad_key", maxRetries: 0 });

    await expect(client.execute({ engine: "google_maps", q: "test" })).rejects.toThrow(
      SerpApiAuthenticationError,
    );
  });

  it("should throw SerpApiInvalidResponseError when response JSON parsing fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => {
        throw new Error("SyntaxError: Unexpected token");
      },
    });

    const client = new SerpApiClient({ apiKey: "test_key", maxRetries: 0 });

    await expect(client.execute({ engine: "google_maps", q: "test" })).rejects.toThrow(
      SerpApiInvalidResponseError,
    );
  });

  it("should retry transient failures and throw SerpApiProviderError after maxRetries exhausted", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 500,
      text: async () => "Internal Server Error",
    });

    const client = new SerpApiClient({
      apiKey: "test_key",
      maxRetries: 2,
      retryBackoffBaseMs: 5,
    });

    await expect(client.execute({ engine: "google_maps", q: "test" })).rejects.toThrow(
      SerpApiProviderError,
    );

    // Initial attempt + 2 retries = 3 calls
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });
});
