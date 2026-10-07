import type {
  AlternativeMode,
  PlaceReference,
  AlternativeCandidate,
  AlternativeReasoning,
  AlternativeRecommendationResponse,
  GeoLocation,
} from "@offbeat/shared";

export type {
  AlternativeMode,
  PlaceReference,
  AlternativeCandidate,
  AlternativeReasoning,
  AlternativeRecommendationResponse,
};

export interface RawCandidatePlace {
  id?: string;
  externalId?: string;
  name: string;
  slug?: string;
  destination?: string;
  regionId?: string;
  categories: string[];
  description?: string | null;
  location?: GeoLocation;
  address?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  userRatingsTotal?: number | null;
  source: "INTERNAL" | "EXTERNAL" | "COMBINED";
  operatingHours?: string[];
}

export interface ScoredAlternativeCandidate extends AlternativeCandidate {
  rawScore: number;
  scoringBreakdown: {
    categorySimilarity: number;
    tasteMatch: number;
    geographicProximity: number;
    timeFitScore: number;
    crowdFitScore: number;
    communityScore: number;
    confidenceScore: number;
  };
}

export interface CandidateGenerationQuery {
  mode: AlternativeMode;
  country?: string;
  region?: string;
  destination?: string;
  travelTaste: string[];
  experienceTaste: string[];
  dayNight: "DAY" | "NIGHT" | "ANY";
  preferredTime?: string;
  limit: number;
}
