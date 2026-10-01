import { env } from "../../config/env.js";

export interface SerpApiConfig {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  retryBackoffBaseMs: number;
  ttlSeconds: {
    placeMetadata: number;
    gpsCoordinates: number;
    categories: number;
    searchResults: number;
    reviews: number;
    openingHours: number;
    currentOpenState: number;
    default: number;
  };
}

export const serpApiConfig: SerpApiConfig = {
  apiKey: env.SERPAPI_API_KEY || process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY || "",
  baseUrl: "https://serpapi.com/search",
  timeoutMs: 8000,
  maxRetries: 2,
  retryBackoffBaseMs: 300,
  ttlSeconds: {
    placeMetadata: 7 * 86400, // 7 days (long)
    gpsCoordinates: 7 * 86400, // 7 days (long)
    categories: 7 * 86400, // 7 days (long)
    searchResults: 24 * 3600, // 24 hours (medium)
    reviews: 24 * 3600, // 24 hours (medium)
    openingHours: 6 * 3600, // 6 hours (short/medium)
    currentOpenState: 15 * 60, // 15 minutes (very short)
    default: 24 * 3600,
  },
};
