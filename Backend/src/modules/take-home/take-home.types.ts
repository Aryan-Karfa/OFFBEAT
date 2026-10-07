import type {
  TakeHomeCategory,
  TakeHomeLocalRelevance,
  TakeHomeGoodFor,
  TakeHomeBudget,
  TakeHomeSourceType,
  TakeHomeSourceDto,
  TakeHomeAlternativeDto,
  TakeHomeItemDto,
  TakeHomeQueryDto,
  TakeHomeReasoningDto,
  TakeHomeResponseDto,
  TakeHomeReasoningInputDto,
  TakeHomeReasoningResultDto,
  GeoLocation,
  EvidenceStrength,
  ReasoningSource,
} from "@offbeat/shared";

export type {
  TakeHomeCategory,
  TakeHomeLocalRelevance,
  TakeHomeGoodFor,
  TakeHomeBudget,
  TakeHomeSourceType,
  TakeHomeSourceDto,
  TakeHomeAlternativeDto,
  TakeHomeItemDto,
  TakeHomeQueryDto,
  TakeHomeReasoningDto,
  TakeHomeResponseDto,
  TakeHomeReasoningInputDto,
  TakeHomeReasoningResultDto,
  GeoLocation,
  EvidenceStrength,
  ReasoningSource,
};

export interface CanonicalTakeHomeDefinition {
  id: string;
  name: string;
  category: TakeHomeCategory;
  categories?: TakeHomeCategory[];
  destinationId: string;
  destinationName: string;
  regionId: string;
  description: string;
  whyTakeHome: string;
  localRelevance: TakeHomeLocalRelevance;
  goodFor: TakeHomeGoodFor[];
  budget: TakeHomeBudget;
  confidenceScore: number;
  evidenceStrength: EvidenceStrength;
  defaultSources: TakeHomeSourceDto[];
  alternatives?: TakeHomeAlternativeDto[];
  imageUrl?: string;
  tasteAffinity: {
    travelTastes: string[];
    experienceTastes: string[];
  };
}

export interface ScoredTakeHomeItem extends TakeHomeItemDto {
  rawScore: number;
  scoreBreakdown: {
    localRelevanceScore: number;
    tasteMatchScore: number;
    communityScore: number;
    confidenceScore: number;
    giftFitScore: number;
  };
}
