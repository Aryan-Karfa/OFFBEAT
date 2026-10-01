import type {
  NormalizedExternalPlace,
  NormalizedExternalReview,
  NormalizedExternalReviewsResult,
  ExternalPlaceReferenceDto,
  SearchQueryContext,
  GeoLocation,
} from "@offbeat/shared";

// Re-export normalized internal contracts
export type {
  NormalizedExternalPlace,
  NormalizedExternalReview,
  NormalizedExternalReviewsResult,
  ExternalPlaceReferenceDto,
  SearchQueryContext,
  GeoLocation,
};

// ==========================================
// Provider-Specific Types (Private to SerpApi module)
// ==========================================

export interface SerpApiSearchMetadata {
  id?: string;
  status?: string;
  json_endpoint?: string;
  created_at?: string;
  processed_at?: string;
  total_time_taken?: number;
}

export interface SerpApiGpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface SerpApiSearchParameters {
  engine: string;
  type?: string;
  q?: string;
  ll?: string;
  place_id?: string;
  data_id?: string;
  next_page_token?: string;
  hl?: string;
  gl?: string;
  api_key?: string;
  [key: string]: unknown;
}

export interface SerpApiMapsLocalResult {
  position?: number;
  title?: string;
  place_id?: string;
  data_id?: string;
  data_cid?: string;
  reviews?: number;
  rating?: number;
  price?: string;
  type?: string;
  types?: string[];
  address?: string;
  open_state?: string;
  hours?: string;
  operating_hours?: Record<string, string>;
  phone?: string;
  website?: string;
  description?: string;
  thumbnail?: string;
  gps_coordinates?: SerpApiGpsCoordinates;
  links?: {
    website?: string;
    directions?: string;
  };
  [key: string]: unknown;
}

export interface SerpApiMapsSearchResponse {
  search_metadata?: SerpApiSearchMetadata;
  search_parameters?: SerpApiSearchParameters;
  local_results?: SerpApiMapsLocalResult[];
  error?: string;
  [key: string]: unknown;
}

export interface SerpApiMapsPlaceResult {
  title?: string;
  place_id?: string;
  data_id?: string;
  data_cid?: string;
  reviews?: number;
  rating?: number;
  price?: string;
  type?: string;
  types?: string[];
  address?: string;
  open_state?: string;
  hours?: string;
  operating_hours?: Record<string, string>;
  phone?: string;
  website?: string;
  description?: string;
  thumbnail?: string;
  gps_coordinates?: SerpApiGpsCoordinates;
  links?: {
    website?: string;
    directions?: string;
  };
  user_reviews?: SerpApiReview[];
  [key: string]: unknown;
}

export interface SerpApiMapsPlaceResponse {
  search_metadata?: SerpApiSearchMetadata;
  search_parameters?: SerpApiSearchParameters;
  place_results?: SerpApiMapsPlaceResult;
  error?: string;
  [key: string]: unknown;
}

export interface SerpApiReview {
  link?: string;
  rating?: number;
  date?: string;
  iso_date?: string;
  snippet?: string;
  extracted_snippet?: {
    original?: string;
  };
  user?: {
    name?: string;
    link?: string;
    thumbnail?: string;
    reviews?: number;
  };
  review_id?: string;
  [key: string]: unknown;
}

export interface SerpApiMapsReviewsResponse {
  search_metadata?: SerpApiSearchMetadata;
  search_parameters?: SerpApiSearchParameters;
  place_info?: {
    title?: string;
    rating?: number;
    reviews?: number;
    address?: string;
  };
  reviews?: SerpApiReview[];
  serpapi_pagination?: {
    next?: string;
    next_page_token?: string;
  };
  error?: string;
  [key: string]: unknown;
}

export type CacheCategory =
  "searchResults" | "placeMetadata" | "reviews" | "openingHours" | "currentOpenState" | "default";
