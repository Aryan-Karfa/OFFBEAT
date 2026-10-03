import type {
  DiscoveryIntent,
  DayNightPreference,
  DiscoverySourceType,
  DiscoveryProvider,
  DiscoveryContextDto,
  DiscoveryRequestDto,
  DiscoveryPlaceDto,
  DiscoveryResultItemDto,
  DiscoveryPaginationDto,
  DiscoveryResponseDataDto,
  DiscoveryApiResponse,
  GeoLocation,
  NormalizedExternalPlace,
} from "@offbeat/shared";
import type { PlaceWithDetails } from "../places/places.types.js";

export type {
  DiscoveryIntent,
  DayNightPreference,
  DiscoverySourceType,
  DiscoveryProvider,
  DiscoveryContextDto,
  DiscoveryRequestDto,
  DiscoveryPlaceDto,
  DiscoveryResultItemDto,
  DiscoveryPaginationDto,
  DiscoveryResponseDataDto,
  DiscoveryApiResponse,
  GeoLocation,
  NormalizedExternalPlace,
  PlaceWithDetails,
};

/**
 * Unified internal representation of a place candidate prior to scoring and ranking.
 */
export interface DiscoveryCandidate {
  id: string;
  source: DiscoverySourceType;
  provider: DiscoveryProvider;
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
  rawMetadata?: Record<string, unknown>;
  externalReference?: {
    provider: string;
    externalId: string;
  };
}

/**
 * Detailed breakdown of deterministic scoring signals.
 */
export interface ScoreBreakdown {
  travelTasteScore: number;
  experienceTasteScore: number;
  categoryScore: number;
  geographicScore: number;
  dayNightScore: number;
  ratingScore: number;
  completenessScore: number;
  totalScore: number;
}

/**
 * Result of scoring a candidate.
 */
export interface ScoredCandidate {
  candidate: DiscoveryCandidate;
  score: number;
  why: string[];
  breakdown: ScoreBreakdown;
}

/**
 * Weight configuration for deterministic ranking.
 */
export interface ScorerWeights {
  travelTaste: number;
  experienceTaste: number;
  categoryRelevance: number;
  geographicRelevance: number;
  dayNightCompatibility: number;
  ratingSignal: number;
  dataCompleteness: number;
}

/**
 * Execution options for discovery queries.
 */
export interface DiscoveryExecutionOptions {
  requestId?: string;
  bypassCache?: boolean;
}
