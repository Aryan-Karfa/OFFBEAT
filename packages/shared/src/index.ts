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
  timeIntelligence?: TimeIntelligenceDto;
  crowdIntelligence?: CrowdIntelligenceDto;
  reasoning?: RecommendationReasoningDto;
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
  bestTime?: DiscoveryBestTimeDto;
  crowd?: DiscoveryCrowdDto;
  timeFit?: TimeFit;
  crowdFit?: CrowdFit;
  reasoning?: RecommendationReasoningDto;
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
  reasoning?: RecommendationReasoningDto;
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

// ==========================================
// Phase 9: Verification & Confidence Contracts
// ==========================================

export type VerificationStatus =
  "PENDING" | "COMMUNITY_SUPPORTED" | "COMMUNITY_VERIFIED" | "FLAGGED" | "REJECTED";

export type VerificationMethod =
  | "COMMUNITY_SIGNAL"
  | "EVIDENCE_REVIEW"
  | "EXTERNAL_CORROBORATION"
  | "DETERMINISTIC_RULES"
  | "MANUAL_REVIEW";

export type EvidenceStrength = "HIGH" | "MODERATE" | "EMERGING" | "CONTESTED";

export interface ConfidenceSummaryDto {
  score: number;
  evidenceCount: number;
  supportCount: number;
  contradictionCount: number;
  externalCorroboration: boolean;
  version: string;
}

export interface VerificationExplanationDto {
  headline: string;
  signals: string[];
  summary: string;
}

export interface VerificationSummaryDto {
  status: VerificationStatus;
  strength: EvidenceStrength;
  score: number;
  headline?: string;
  supportedCount: number;
  externalCorroborated: boolean;
}

export interface VerificationDetailDto {
  submissionId: string;
  status: VerificationStatus;
  method: VerificationMethod;
  confidence: ConfidenceSummaryDto;
  strength: EvidenceStrength;
  explanation: VerificationExplanationDto;
  updatedAt: string;
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
  verification?: VerificationSummaryDto | null;
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
  verification?: VerificationSummaryDto | null;
}

export interface CommunitySignalSummaryDto {
  submissionCount: number;
  usefulCount: number;
  confirmCount: number;
  verifiedCount?: number;
  supportedCount?: number;
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

// ==========================================
// Phase 10: Time & Crowd Intelligence Contracts
// ==========================================

export type TimeObservationType =
  | "OPENING_TIME"
  | "CLOSING_TIME"
  | "BEST_TIME"
  | "SUNRISE_TIME"
  | "SUNSET_TIME"
  | "LOW_CROWD_TIME"
  | "COMMUNITY_RECOMMENDED_TIME";

export type ObservationSource = "EXTERNAL" | "COMMUNITY" | "SYSTEM";

export type DayType = "WEEKDAY" | "WEEKEND" | "ANY";

export type CrowdLevel = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "UNKNOWN";

export type Season = "SPRING" | "SUMMER" | "MONSOON" | "AUTUMN" | "WINTER" | "ANY" | "UNKNOWN";

export type TimeFit = "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN";

export type CrowdFit = "LOWER_CROWD_MATCH" | "NEUTRAL" | "HIGHER_CROWD" | "UNKNOWN";

export interface OperatingWindowDto {
  day?: string;
  open?: string | null;
  close?: string | null;
  closed?: boolean;
  is24Hours?: boolean;
  description?: string;
  windows?: Array<{ open: string | null; close: string | null }>;
}

export interface OperatingHoursDto {
  schedule: OperatingWindowDto[];
  text: string[];
  raw?: string[];
  isOpenNow?: boolean | null;
  source: ObservationSource;
  rawText?: string | null;
}

export interface RecommendedTimeDto {
  start: string;
  end: string;
  dayType?: DayType;
  reason?: string;
  source: ObservationSource;
  confidence?: number;
  evidenceStrength?: EvidenceStrength;
}

export interface AvailableWindowDto {
  start: string;
  end: string;
  label?: string;
  source?: ObservationSource;
}

export interface TimeTimingSignalDto {
  type: string;
  description: string;
  source: ObservationSource;
}

export interface TimeIntelligenceDto {
  operatingHours: OperatingHoursDto;
  recommendedTimes: RecommendedTimeDto[];
  availableWindows: AvailableWindowDto[];
  signals: TimeTimingSignalDto[];
  explanation: string;
  timeFit?: TimeFit;
}

export interface CrowdPatternDto {
  dayType: DayType;
  time?: string | null;
  season?: Season;
  level: CrowdLevel;
  source: ObservationSource;
  observation?: string | null;
}

export interface CrowdIntelligenceDto {
  overall: CrowdLevel;
  patterns: CrowdPatternDto[];
  contextualSignals?: string[];
  explanation: string;
  evidenceStrength?: EvidenceStrength;
  confidence?: number;
  source: ObservationSource;
  crowdFit?: CrowdFit;
}

export interface DiscoveryBestTimeDto {
  start: string;
  end: string;
  dayType?: DayType;
  source: ObservationSource;
  reason?: string;
}

export interface DiscoveryCrowdDto {
  level: CrowdLevel;
  context?: string;
  source: ObservationSource;
  observation?: string;
}

export interface CreateTimeObservationRequestDto {
  type: TimeObservationType;
  startTime: string;
  endTime: string;
  dayType?: DayType;
  observation?: string;
  expiresAt?: string;
}

export interface CreateCrowdObservationRequestDto {
  level: CrowdLevel;
  timeStart?: string;
  timeEnd?: string;
  dayType?: DayType;
  season?: Season;
  observation?: string;
  destinationId?: string;
  expiresAt?: string;
}

// ==========================================
// Phase 11: Gemini Intelligence Layer Contracts
// ==========================================

export type ReasoningSource = "GEMINI" | "DETERMINISTIC";

export interface RecommendationReasoningDto {
  source: ReasoningSource;
  summary: string;
  reasons: string[];
  tradeoffs?: string[];
  contextualNotes?: string[];
}

export interface DiscoveryReasoningCandidateDto {
  id: string;
  name: string;
  description?: string | null;
  categories: string[];
  destination: string;
  rating?: number | null;
  reviewCount?: number | null;
  score?: number;
  why?: string[];
  bestTime?: {
    start?: string;
    end?: string;
    reason?: string;
    source: string;
  };
  crowd?: {
    level: string;
    context?: string;
    source: string;
    observation?: string;
  };
  communityHighlights?: Array<{
    title: string;
    content: string;
    verificationStatus?: string;
    evidenceStrength?: string;
  }>;
  timeFit?: string;
  crowdFit?: string;
  confidence?: {
    score?: number;
    evidenceStrength?: string;
    status?: string;
  };
  sources?: string[];
}

export interface DiscoveryReasoningInputDto {
  userContext: {
    region: string;
    destination?: string | null;
    travelTaste: string[];
    experienceTaste: string[];
    dayNight: "DAY" | "NIGHT" | "ANY";
    preferredTime?: string | null;
  };
  candidates: DiscoveryReasoningCandidateDto[];
}

export interface DiscoveryReasoningResultDto {
  selectedPlaceIds: string[];
  primaryRecommendationId: string;
  recommendationSummary: string;
  reasons: string[];
  tradeoffs: string[];
  contextualNotes: string[];
  source: ReasoningSource;
}

// ==========================================
// Phase 12: Find An Alternative Contracts
// ==========================================

export type AlternativeMode =
  | "REPLACEMENT"
  | "ENHANCEMENT"
  | "COMPLEMENTARY"
  | "NEARBY_DISCOVERY"
  | "TIMING_ALTERNATIVE"
  | "LOWER_CROWD";

export interface PlaceReference {
  id: string;
  name: string;
  slug?: string;
  destination?: string;
  categories?: string[];
  location?: GeoLocation;
  imageUrl?: string | null;
  description?: string | null;
}

export interface AlternativeCandidate {
  placeId?: string;
  externalId?: string;
  name: string;
  slug?: string;
  destination?: string;
  category?: string;
  categories?: string[];
  source: "INTERNAL" | "EXTERNAL" | "COMBINED";
  why: string;
  timeFit?: "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN";
  crowdFit?: "GOOD" | "PARTIAL" | "UNKNOWN";
  confidence?: {
    score?: number;
    evidenceStrength?: EvidenceStrength;
    status?: string;
  };
  community?: {
    submissionCount: number;
    helpfulCount: number;
    verifiedCount: number;
    evidenceCount?: number;
  };
  location?: GeoLocation;
  imageUrl?: string | null;
  description?: string | null;
  rating?: number | null;
  userRatingsTotal?: number | null;
  score?: number;
  tradeoff?: string;
  relationshipContext?: string;
  bestTime?: {
    start?: string;
    end?: string;
    reason?: string;
  };
  crowd?: {
    level: CrowdLevel;
    context?: string;
  };
}

export interface AlternativeReasoning {
  source: ReasoningSource;
  explanation: string;
  selectedCandidateIds: string[];
  primaryCandidateId?: string;
  mode: AlternativeMode;
  tradeoff?: string;
  relationship?: string;
}

export interface AlternativeRecommendationResponse {
  originalPlace: PlaceReference;
  mode: AlternativeMode;
  alternatives: AlternativeCandidate[];
  reasoning?: AlternativeReasoning;
  fallback: boolean;
  totalCandidatesEvaluated: number;
}

export interface AlternativeReasoningInputDto {
  originalPlace: PlaceReference;
  mode: AlternativeMode;
  userContext: {
    region?: string | null;
    destination?: string | null;
    travelTaste: string[];
    experienceTaste: string[];
    dayNight: "DAY" | "NIGHT" | "ANY";
    preferredTime?: string | null;
  };
  candidates: AlternativeCandidate[];
}

export interface AlternativeReasoningResultDto {
  selectedCandidateIds: string[];
  primaryCandidateId?: string;
  explanation: string;
  mode: AlternativeMode;
  tradeoff?: string;
  relationship?: string;
  source: ReasoningSource;
}

export interface FindAlternativesQueryDto {
  mode?: AlternativeMode;
  country?: string;
  region?: string;
  destination?: string;
  travelTaste?: string | string[];
  experienceTaste?: string | string[];
  dayNight?: "DAY" | "NIGHT" | "ANY";
  preferredTime?: string;
  intent?: string;
}

// ============================================================================
// Phase 13: Itinerary Engine Types & DTOs
// ============================================================================

export type ItineraryType = "DAY_TRIP" | "MULTI_DAY";
export type ItineraryPace = "RELAXED" | "BALANCED" | "PACKED";
export type ItineraryIntent = "EXPLORE" | "PHOTOGRAPHY" | "FOOD" | "NATURE" | "CULTURE" | "MIXED";

export interface CreateItineraryRequestDto {
  country?: string;
  regionId: string;
  destinationId?: string | null;

  travelTaste?: string[];
  experienceTaste?: string[];

  dayNight?: "DAY" | "NIGHT" | "ANY";

  preferredStartTime?: string | null;
  preferredEndTime?: string | null;

  durationDays?: number;

  pace?: ItineraryPace;

  mustVisitPlaceIds?: string[];
  selectedAlternativePlaceIds?: string[];
  avoidPlaceIds?: string[];

  intent?: ItineraryIntent;
}

export interface ItineraryStopDto {
  id: string;
  placeId?: string;
  externalId?: string;
  name: string;
  destination?: string;
  category?: string;
  categories?: string[];
  imageUrl?: string | null;
  location?: GeoLocation;
  slug?: string;

  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;

  travelFromPreviousMinutes?: number;
  travelDistanceMeters?: number;

  timeFit: "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN";
  crowdFit: "GOOD" | "PARTIAL" | "UNKNOWN";

  confidence?: {
    score?: number;
    evidenceStrength?: EvidenceStrength;
    status?: string;
  };
  community?: {
    submissionCount: number;
    helpfulCount: number;
    verifiedCount: number;
    evidenceCount?: number;
  };

  why: string;
  isFreeTime?: boolean;
}

export interface ItineraryDayDto {
  day: number;
  title: string;
  date?: string;
  stops: ItineraryStopDto[];
  totalTravelMinutes?: number;
  totalVisitMinutes?: number;
  notes?: string[];
}

export interface ItineraryReasoningDto {
  source: ReasoningSource;
  explanation: string;
  keyThemes?: string[];
  tradeoffs?: string[];
}

export interface ItineraryResponseDto {
  id: string;
  title: string;
  destination: string;
  regionId: string;
  durationDays: number;
  pace: ItineraryPace;
  days: ItineraryDayDto[];
  summary: string;
  reasoning?: ItineraryReasoningDto;
  source: ReasoningSource;
  fallback: boolean;
  totalStops: number;
  createdAt: string;
}

export interface ItineraryCandidatePlaceDto {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  categories?: string[];
  destination?: string;
  location?: GeoLocation;
  timeFit?: "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN";
  crowdFit?: "GOOD" | "PARTIAL" | "UNKNOWN";
  crowdLevel?: CrowdLevel;
  recommendedTime?: {
    start?: string;
    end?: string;
    reason?: string;
  };
  confidence?: {
    score?: number;
    evidenceStrength?: EvidenceStrength;
    status?: string;
  };
  community?: {
    submissionCount: number;
    helpfulCount: number;
    verifiedCount: number;
  };
  isMustVisit?: boolean;
  isAlternative?: boolean;
}

export interface ItineraryReasoningInputDto {
  destination: string;
  regionId: string;
  pace: ItineraryPace;
  durationDays: number;
  travelTaste: string[];
  experienceTaste: string[];
  dayNight: "DAY" | "NIGHT" | "ANY";
  candidatePlaces: ItineraryCandidatePlaceDto[];
  draftSchedule: Array<{
    day: number;
    orderedPlaceIds: string[];
  }>;
}

export interface ItineraryReasoningResultDto {
  orderedPlaceIds: string[];
  dayAssignments: Array<{
    day: number;
    placeIds: string[];
  }>;
  explanation: string;
  tradeoffs?: string[];
  source: ReasoningSource;
}
