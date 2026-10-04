import { env } from "../../config/env.js";

export interface SerpApiConfig {
  apiKey: string;
  baseUrl: string;
  engines: {
    maps: string;
    reviews: string;
    photos: string;
    directions: string;
    flights: string;
    autocomplete: string;
    images: string;
    forums: string;
    local: string;
  };
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
  baseUrl: env.SERPAPI_BASE_URL || "https://serpapi.com/search",
  engines: {
    maps: env.SERPAPI_ENGINE_MAPS || "google_maps",
    reviews: env.SERPAPI_ENGINE_MAPS_REVIEWS || "google_maps_reviews",
    photos: env.SERPAPI_ENGINE_MAPS_PHOTOS || "google_maps_photos",
    directions: env.SERPAPI_ENGINE_MAPS_DIRECTIONS || "google_maps_directions",
    flights: env.SERPAPI_ENGINE_FLIGHTS || "google_flights",
    autocomplete: env.SERPAPI_ENGINE_AUTOCOMPLETE || "google_autocomplete",
    images: env.SERPAPI_ENGINE_IMAGES || "google_images",
    forums: env.SERPAPI_ENGINE_FORUMS || "google_forums",
    local: env.SERPAPI_ENGINE_LOCAL || "google_local",
  },
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
