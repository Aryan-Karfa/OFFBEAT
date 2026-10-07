import type { SearchQueryContext, GeoLocation, SerpApiSearchParameters } from "./serpapi.types.js";

export class SerpApiQueryBuilder {
  /**
   * Sanitizes a token by trimming, converting to lowercase, and removing disallowed characters.
   */
  private static sanitizeToken(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Deduplicates array of tokens while preserving order.
   */
  private static deduplicateTokens(tokens: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const token of tokens) {
      const sanitized = this.sanitizeToken(token);
      if (sanitized && !seen.has(sanitized)) {
        seen.add(sanitized);
        result.push(sanitized);
      }
    }

    return result;
  }

  /**
   * Formats coordinates into SerpApi's Google Maps `ll` parameter: `@lat,lng,zoomz`.
   */
  public static formatCoordinates(coords: GeoLocation, zoom: number = 14): string {
    const lat = Number(coords.lat.toFixed(6));
    const lng = Number(coords.lng.toFixed(6));
    return `@${lat},${lng},${zoom}z`;
  }

  /**
   * Builds a deterministic Google Maps search query from high-level OFFBEAT context.
   */
  public static buildMapsSearchQuery(context: SearchQueryContext): SerpApiSearchParameters {
    const descriptiveTerms: string[] = [];

    // 1. Process Travel Tastes
    if (context.travelTaste && context.travelTaste.length > 0) {
      descriptiveTerms.push(...context.travelTaste);
    }

    // 2. Process Experience Tastes
    if (context.experienceTaste && context.experienceTaste.length > 0) {
      descriptiveTerms.push(...context.experienceTaste);
    }

    // 3. Process Day/Night context
    if (context.dayNight === "NIGHT") {
      descriptiveTerms.push("nightlife");
    }

    // 4. Process Place Type
    if (context.placeType) {
      descriptiveTerms.push(context.placeType);
    }

    // 5. Process supplemental raw query string
    if (context.query) {
      descriptiveTerms.push(...context.query.split(/\s+/));
    }

    // Clean and deduplicate descriptive terms
    const cleanTerms = this.deduplicateTokens(descriptiveTerms);

    // Geographic hierarchy (preserved in proper case for search accuracy)
    const geoTokens: string[] = [];
    if (context.destination && context.destination.trim()) {
      geoTokens.push(context.destination.trim());
    }
    if (context.region && context.region.trim()) {
      geoTokens.push(context.region.trim());
    }
    if (context.country && context.country.trim()) {
      geoTokens.push(context.country.trim());
    }

    // Assemble deterministic query string
    const queryParts: string[] = [];
    if (cleanTerms.length > 0) {
      queryParts.push(cleanTerms.join(" "));
      queryParts.push("places in");
    }
    if (geoTokens.length > 0) {
      queryParts.push(geoTokens.join(", "));
    } else if (cleanTerms.length === 0) {
      queryParts.push("travel destinations");
    }

    const q = queryParts.join(" ").trim();

    const params: SerpApiSearchParameters = {
      engine: "google_maps",
      type: "search",
      q,
      hl: "en",
    };

    if (
      context.coordinates &&
      typeof context.coordinates.lat === "number" &&
      typeof context.coordinates.lng === "number"
    ) {
      params.ll = this.formatCoordinates(context.coordinates);
    }

    return params;
  }

  /**
   * Builds parameters for fetching specific Google Maps place details.
   */
  public static buildPlaceDetailsQuery(params: {
    placeId?: string;
    dataId?: string;
    coordinates?: GeoLocation;
  }): SerpApiSearchParameters {
    const searchParams: SerpApiSearchParameters = {
      engine: "google_maps",
      hl: "en",
    };

    if (params.placeId) {
      searchParams.place_id = params.placeId.trim();
    } else if (params.dataId) {
      searchParams.data_id = params.dataId.trim();
    }

    if (params.coordinates) {
      searchParams.ll = this.formatCoordinates(params.coordinates);
    }

    return searchParams;
  }

  /**
   * Builds parameters for fetching Google Maps reviews for a place.
   */
  public static buildReviewsQuery(params: {
    dataId?: string;
    placeId?: string;
    nextPageToken?: string;
  }): SerpApiSearchParameters {
    const searchParams: SerpApiSearchParameters = {
      engine: "google_maps_reviews",
      hl: "en",
    };

    if (params.dataId) {
      searchParams.data_id = params.dataId.trim();
    } else if (params.placeId) {
      searchParams.place_id = params.placeId.trim();
    }

    if (params.nextPageToken) {
      searchParams.next_page_token = params.nextPageToken.trim();
    }

    return searchParams;
  }

  /**
   * Builds parameters for fetching Google Maps directions between two coordinates.
   */
  public static buildDirectionsQuery(params: {
    startCoords: GeoLocation;
    endCoords: GeoLocation;
    travelMode?: "driving" | "walking" | "transit";
  }): SerpApiSearchParameters {
    // SerpApi google_maps_directions requires numeric travel_mode:
    // 0: driving, 1: transit, 2: walking, 3: bicycling
    const modeCode =
      params.travelMode === "walking" ? "2" : params.travelMode === "transit" ? "1" : "0";

    return {
      engine: "google_maps_directions",
      start_coords: `${params.startCoords.lat},${params.startCoords.lng}`,
      end_coords: `${params.endCoords.lat},${params.endCoords.lng}`,
      travel_mode: modeCode,
      hl: "en",
    };
  }
}
