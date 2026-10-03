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
  community?: CommunitySignalSummaryDto;
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
  community?: CommunitySignalSummaryDto;
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

// ==========================================
// Phase 8: Community Intelligence Contracts
// ==========================================

export type SubmissionType =
  | "HIDDEN_PLACE"
  | "LOCAL_BUSINESS"
  | "RESTAURANT"
  | "PHOTO_SPOT"
  | "BEST_TIME"
  | "CROWD_TIP"
  | "TRAVEL_TIP"
  | "LOCAL_SPECIALTY"
  | "TAKE_HOME"
  | "EXPERIENCE"
  | "ALTERNATIVE"
  | "OTHER";

export type SubmissionStatus = "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED";

export type EvidenceType = "PHOTO" | "TEXT" | "EXTERNAL_REFERENCE";

export type SupportType = "AGREE" | "USEFUL" | "CONFIRM";

export type ReportReason =
  "INCORRECT" | "OUTDATED" | "DUPLICATE" | "SPAM" | "MISLEADING" | "INAPPROPRIATE" | "OTHER";

export type ReportStatus = "PENDING" | "REVIEWED" | "DISMISSED";

export interface SubmissionEvidenceDto {
  id: string;
  type: EvidenceType;
  source?: string | null;
  content?: string | null;
  mediaUrl?: string | null;
  externalReference?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface SubmissionAuthorDto {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface SubmissionPlaceSummaryDto {
  id: string;
  name: string;
  slug: string;
  destination?: string | null;
  region?: string | null;
}

export interface SubmissionSupportSummaryDto {
  count: number;
  usefulCount: number;
  confirmCount: number;
  agreeCount: number;
  userSupported?: boolean;
  userSupportType?: SupportType | null;
}

export interface CommunitySubmissionDto {
  id: string;
  userId: string;
  placeId?: string | null;
  destinationId?: string | null;
  type: SubmissionType;
  title: string;
  content: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  author: SubmissionAuthorDto;
  place?: SubmissionPlaceSummaryDto | null;
  evidence: SubmissionEvidenceDto[];
  support: SubmissionSupportSummaryDto;
  reportCount?: number;
}

export interface CommunityHighlightDto {
  id: string;
  type: SubmissionType;
  title: string;
  content: string;
  supportCount: number;
  author: {
    displayName: string;
  };
}

export interface CommunitySignalSummaryDto {
  submissionCount: number;
  usefulCount: number;
  confirmCount: number;
  highlights: CommunityHighlightDto[];
}

export interface CreateCommunityEvidenceInput {
  type: EvidenceType;
  mediaUrl?: string;
  content?: string;
  externalReference?: string;
  source?: string;
}

export interface CreateCommunitySubmissionRequestDto {
  placeId?: string;
  destinationId?: string;
  type: SubmissionType;
  title: string;
  content: string;
  evidence?: CreateCommunityEvidenceInput[];
}

export interface CommunitySubmissionsListFilterDto {
  placeId?: string;
  destinationId?: string;
  type?: SubmissionType;
  status?: SubmissionStatus;
  page?: number;
  limit?: number;
}

export interface CommunitySubmissionsListResponseDto {
  items: CommunitySubmissionDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface CreateSupportRequestDto {
  type?: SupportType;
}

export interface CreateReportRequestDto {
  reason: ReportReason;
  description?: string;
}
