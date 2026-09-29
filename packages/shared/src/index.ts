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
