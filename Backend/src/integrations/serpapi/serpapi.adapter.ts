import { SerpApiNormalizer } from "./serpapi.normalizer.js";
import type {
  NormalizedExternalPlace,
  NormalizedExternalReviewsResult,
  SerpApiMapsSearchResponse,
  SerpApiMapsPlaceResponse,
  SerpApiMapsReviewsResponse,
} from "./serpapi.types.js";
import { SerpApiInvalidResponseError } from "./serpapi.errors.js";

export class GoogleMapsSearchAdapter {
  /**
   * Adapts raw Google Maps search response to array of NormalizedExternalPlace.
   */
  public static adapt(raw: unknown): NormalizedExternalPlace[] {
    if (!raw || typeof raw !== "object") {
      throw new SerpApiInvalidResponseError(
        "Google Maps Search response is empty or not an object",
      );
    }

    const response = raw as SerpApiMapsSearchResponse;

    if (!Array.isArray(response.local_results)) {
      return [];
    }

    return response.local_results
      .filter((item) => item && typeof item === "object")
      .map((item) => SerpApiNormalizer.normalizeLocalResult(item));
  }
}

export class GoogleMapsPlaceAdapter {
  /**
   * Adapts raw Google Maps place response to NormalizedExternalPlace.
   */
  public static adapt(raw: unknown): NormalizedExternalPlace {
    if (!raw || typeof raw !== "object") {
      throw new SerpApiInvalidResponseError("Google Maps Place response is empty or not an object");
    }

    const response = raw as SerpApiMapsPlaceResponse;

    if (!response.place_results || typeof response.place_results !== "object") {
      throw new SerpApiInvalidResponseError(
        "Google Maps Place response does not contain place_results",
      );
    }

    return SerpApiNormalizer.normalizePlaceResult(response.place_results);
  }
}

export class GoogleMapsReviewsAdapter {
  /**
   * Adapts raw Google Maps reviews response to NormalizedExternalReviewsResult.
   */
  public static adapt(raw: unknown): NormalizedExternalReviewsResult {
    if (!raw || typeof raw !== "object") {
      throw new SerpApiInvalidResponseError(
        "Google Maps Reviews response is empty or not an object",
      );
    }

    const response = raw as SerpApiMapsReviewsResponse;

    return SerpApiNormalizer.normalizeReviewsResponse(response);
  }
}
