/**
 * @offbeat/shared
 * Baseline shared API envelopes and common contracts across OFFBEAT.
 */

export interface ApiMeta {
  requestId: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ApiMeta;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

// ==========================================
// Phase 5: Geography & Place Domain Contracts
// ==========================================

export type RegionType = "STATE" | "UNION_TERRITORY" | "PROVINCE" | "EQUIVALENT";
export type DestinationStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type PlaceStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface CountryDto {
  id: string;
  name: string;
  code: string;
  slug: string;
  geometry?: unknown;
}

export interface CountryWithRegionsDto extends CountryDto {
  regions: RegionSummaryDto[];
}

export interface RegionSummaryDto {
  id: string;
  name: string;
  code: string;
  type: RegionType;
  slug: string;
  geometry: unknown;
  centroid: GeoLocation;
}

export interface RegionDetailDto {
  id: string;
  name: string;
  code: string;
  type: RegionType;
  slug: string;
  description?: string | null;
  categories?: string[];
  centroid: GeoLocation;
}

export interface DestinationSummaryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coordinates?: GeoLocation | null;
  imageUrl?: string | null;
  status: DestinationStatus;
}

export interface PlaceCategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface PlaceDetailDto {
  id: string;
  name: string;
  slug: string;
  destination: string;
  categories: string[];
  location: GeoLocation;
  description?: string | null;
  address?: string | null;
  website?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  status: PlaceStatus;
}

// ==========================================
// Phase 6: External Intelligence Contracts
// ==========================================

export interface NormalizedExternalPlace {
  provider: string;
  externalId: string;
  placeId?: string | null;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  categories: string[];
  openingHours?: string[];
  thumbnailUrl?: string | null;
  sourceUrl?: string | null;
  rawMetadata?: Record<string, unknown>;
}

export interface NormalizedExternalReview {
  id: string;
  authorName: string;
  rating?: number | null;
  text?: string | null;
  relativePublishTime?: string | null;
  timestamp?: string | null;
}

export interface NormalizedExternalReviewsResult {
  placeInfo?: {
    title?: string | null;
    rating?: number | null;
    reviewsCount?: number | null;
    address?: string | null;
  };
  reviews: NormalizedExternalReview[];
  nextPageToken?: string | null;
}

export interface ExternalPlaceReferenceDto {
  id: string;
  placeId?: string | null;
  provider: string;
  externalId: string;
  sourceUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  lastSyncedAt: string;
  createdAt: string;
}

export interface SearchQueryContext {
  country?: string;
  region?: string;
  destination?: string;
  travelTaste?: string[];
  experienceTaste?: string[];
  dayNight?: "DAY" | "NIGHT" | "ANY";
  placeType?: string;
  coordinates?: GeoLocation;
  query?: string;
}

// ==========================================
// Phase 7: Discovery Engine Contracts
// ==========================================

export type DiscoveryIntent =
  "DISCOVER_PLACES" | "FIND_EXPERIENCE" | "FIND_ALTERNATIVE" | "FIND_LESS_CROWDED";

export type DayNightPreference = "DAY" | "NIGHT" | "ANY";

export type DiscoverySourceType = "INTERNAL" | "EXTERNAL" | "COMBINED";

export type DiscoveryProvider = "OFFBEAT" | "SERPAPI" | "COMBINED";

export interface DiscoveryContextDto {
  country: string;
  regionId: string;
  region: string;
  destination?: string | null;
  travelTaste: string[];
  experienceTaste: string[];
  dayNight: DayNightPreference;
  preferredTime?: string | null;
  placeType?: string | null;
  intent: DiscoveryIntent;
}

export interface DiscoveryRequestDto {
  regionId: string;
  country?: string;
  destination?: string;
  travelTaste?: string[];
  experienceTaste?: string[];
  dayNight?: DayNightPreference;
  preferredTime?: string;
  placeType?: string;
  intent?: DiscoveryIntent;
  page?: number;
  limit?: number;
}

export interface DiscoveryPlaceDto {
  id: string;
  name: string;
  slug?: string;
  destination: string;
  region: string;
  categories: string[];
  location: GeoLocation;
  address?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  openingHours?: string[] | null;
  sourceUrl?: string | null;
}

export interface DiscoveryResultItemDto {
  place: DiscoveryPlaceDto;
  score: number;
  why: string[];
  source: {
    type: DiscoverySourceType;
    provider: DiscoveryProvider;
  };
}

export interface DiscoveryPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DiscoveryResponseDataDto {
  context: DiscoveryContextDto;
  results: DiscoveryResultItemDto[];
  pagination: DiscoveryPaginationDto;
  fallback?: boolean;
  notice?: string | null;
}

export type DiscoveryApiResponse = ApiResponse<DiscoveryResponseDataDto>;
