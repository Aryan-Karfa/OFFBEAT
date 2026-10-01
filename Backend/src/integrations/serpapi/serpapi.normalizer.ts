import type {
  NormalizedExternalPlace,
  NormalizedExternalReview,
  NormalizedExternalReviewsResult,
  SerpApiMapsLocalResult,
  SerpApiMapsPlaceResult,
  SerpApiReview,
  SerpApiMapsReviewsResponse,
} from "./serpapi.types.js";

export class SerpApiNormalizer {
  private static readonly CATEGORY_ALIASES: Record<string, string> = {
    "mountain peak": "Mountain",
    "mountainous area": "Mountain",
    "mountain range": "Mountain",
    "hill station": "Mountain",
    "historic site": "Historical",
    "historical landmark": "Historical",
    "history museum": "Historical",
    memorial: "Historical",
    "memorial park": "Historical",
    "cultural center": "Culture",
    "art museum": "Culture",
    museum: "Culture",
    temple: "Culture",
    shrine: "Culture",
    monastery: "Culture",
    "scenic viewpoint": "Photography",
    "observation deck": "Photography",
    "vista point": "Photography",
    viewpoint: "Photography",
    beach: "Beach",
    seaside: "Beach",
    "public beach": "Beach",
    "nature reserve": "Nature",
    "national park": "Nature",
    "wildlife refuge": "Nature",
    "botanical garden": "Nature",
    forest: "Nature",
    park: "Nature",
    palace: "Heritage",
    fort: "Heritage",
    fortress: "Heritage",
    castle: "Heritage",
    "heritage building": "Heritage",
    "hiking area": "Adventure",
    trekking: "Adventure",
    "adventure sports": "Adventure",
    "architectural landmark": "Architecture",
  };

  /**
   * Normalizes category strings from external providers.
   */
  public static normalizeCategories(rawTypes?: string[], primaryType?: string): string[] {
    const rawList: string[] = [];
    if (primaryType) {
      rawList.push(primaryType);
    }
    if (Array.isArray(rawTypes)) {
      rawList.push(...rawTypes);
    }

    const normalizedSet = new Set<string>();

    for (const item of rawList) {
      if (!item || typeof item !== "string") continue;
      const cleaned = item.trim().toLowerCase();
      if (!cleaned) continue;

      if (this.CATEGORY_ALIASES[cleaned]) {
        normalizedSet.add(this.CATEGORY_ALIASES[cleaned]);
      } else {
        // Capitalize first letter of raw category
        const titleCase = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        normalizedSet.add(titleCase);
      }
    }

    return Array.from(normalizedSet);
  }

  /**
   * Normalizes opening hours into an array of string descriptions.
   */
  public static normalizeOpeningHours(
    hours?: string,
    operatingHours?: Record<string, string>,
  ): string[] | undefined {
    if (operatingHours && typeof operatingHours === "object") {
      const entries = Object.entries(operatingHours).map(([day, time]) => `${day}: ${time}`);
      if (entries.length > 0) return entries;
    }

    if (hours && typeof hours === "string" && hours.trim()) {
      return [hours.trim()];
    }

    return undefined;
  }

  /**
   * Normalizes a local result from Google Maps Search API.
   */
  public static normalizeLocalResult(raw: SerpApiMapsLocalResult): NormalizedExternalPlace {
    const externalId =
      raw.place_id ||
      raw.data_id ||
      `serpapi_loc_${raw.position || Math.random().toString(36).substring(7)}`;
    const categories = this.normalizeCategories(raw.types, raw.type);
    const openingHours = this.normalizeOpeningHours(raw.hours, raw.operating_hours);

    return {
      provider: "SERPAPI",
      externalId,
      placeId: null,
      name: raw.title ? raw.title.trim() : "Unknown Place",
      description: raw.description ? raw.description.trim() : null,
      address: raw.address ? raw.address.trim() : null,
      latitude: raw.gps_coordinates?.latitude ?? null,
      longitude: raw.gps_coordinates?.longitude ?? null,
      phone: raw.phone ? raw.phone.trim() : null,
      website: raw.website || raw.links?.website || null,
      rating: typeof raw.rating === "number" ? raw.rating : null,
      reviewCount: typeof raw.reviews === "number" ? raw.reviews : null,
      categories,
      openingHours,
      thumbnailUrl: raw.thumbnail || null,
      sourceUrl: raw.links?.directions || null,
      rawMetadata: {
        price: raw.price || null,
        openState: raw.open_state || null,
        dataId: raw.data_id || null,
        dataCid: raw.data_cid || null,
        rawTypes: raw.types || (raw.type ? [raw.type] : []),
      },
    };
  }

  /**
   * Normalizes a detailed place result from Google Maps Place Details API.
   */
  public static normalizePlaceResult(raw: SerpApiMapsPlaceResult): NormalizedExternalPlace {
    const externalId =
      raw.place_id || raw.data_id || `serpapi_place_${Math.random().toString(36).substring(7)}`;
    const categories = this.normalizeCategories(raw.types, raw.type);
    const openingHours = this.normalizeOpeningHours(raw.hours, raw.operating_hours);

    return {
      provider: "SERPAPI",
      externalId,
      placeId: null,
      name: raw.title ? raw.title.trim() : "Unknown Place",
      description: raw.description ? raw.description.trim() : null,
      address: raw.address ? raw.address.trim() : null,
      latitude: raw.gps_coordinates?.latitude ?? null,
      longitude: raw.gps_coordinates?.longitude ?? null,
      phone: raw.phone ? raw.phone.trim() : null,
      website: raw.website || raw.links?.website || null,
      rating: typeof raw.rating === "number" ? raw.rating : null,
      reviewCount: typeof raw.reviews === "number" ? raw.reviews : null,
      categories,
      openingHours,
      thumbnailUrl: raw.thumbnail || null,
      sourceUrl: raw.links?.directions || null,
      rawMetadata: {
        price: raw.price || null,
        openState: raw.open_state || null,
        dataId: raw.data_id || null,
        dataCid: raw.data_cid || null,
        rawTypes: raw.types || (raw.type ? [raw.type] : []),
      },
    };
  }

  /**
   * Normalizes a single review from Google Maps Reviews API.
   */
  public static normalizeReview(raw: SerpApiReview, index: number = 0): NormalizedExternalReview {
    const id = raw.review_id || (raw.link ? raw.link : `rev_${index}_${Date.now()}`);
    const authorName = raw.user?.name ? raw.user.name.trim() : "Anonymous Traveler";
    const text = raw.extracted_snippet?.original || raw.snippet || null;

    return {
      id,
      authorName,
      rating: typeof raw.rating === "number" ? raw.rating : null,
      text: text ? text.trim() : null,
      relativePublishTime: raw.date ? raw.date.trim() : null,
      timestamp: raw.iso_date ? raw.iso_date.trim() : null,
    };
  }

  /**
   * Normalizes a full reviews response from Google Maps Reviews API.
   */
  public static normalizeReviewsResponse(
    raw: SerpApiMapsReviewsResponse,
  ): NormalizedExternalReviewsResult {
    const reviews: NormalizedExternalReview[] = [];

    if (Array.isArray(raw.reviews)) {
      raw.reviews.forEach((rev, idx) => {
        reviews.push(this.normalizeReview(rev, idx));
      });
    }

    const placeInfo = raw.place_info
      ? {
          title: raw.place_info.title ? raw.place_info.title.trim() : null,
          rating: typeof raw.place_info.rating === "number" ? raw.place_info.rating : null,
          reviewsCount: typeof raw.place_info.reviews === "number" ? raw.place_info.reviews : null,
          address: raw.place_info.address ? raw.place_info.address.trim() : null,
        }
      : undefined;

    return {
      placeInfo,
      reviews,
      nextPageToken: raw.serpapi_pagination?.next_page_token || null,
    };
  }
}
