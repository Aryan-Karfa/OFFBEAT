import type {
  ReasoningSource,
  RecommendationReasoningDto,
  DiscoveryReasoningCandidateDto,
  DiscoveryReasoningInputDto,
  DiscoveryReasoningResultDto,
  AlternativeMode,
  AlternativeCandidate,
  AlternativeReasoning,
  AlternativeReasoningInputDto,
  AlternativeReasoningResultDto,
  ItineraryPace,
  ItineraryStopDto,
  ItineraryDayDto,
  ItineraryResponseDto,
  ItineraryReasoningInputDto,
  ItineraryReasoningResultDto,
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
} from "@offbeat/shared";

export type {
  ReasoningSource,
  RecommendationReasoningDto,
  DiscoveryReasoningCandidateDto,
  DiscoveryReasoningInputDto,
  DiscoveryReasoningResultDto,
  AlternativeMode,
  AlternativeCandidate,
  AlternativeReasoning,
  AlternativeReasoningInputDto,
  AlternativeReasoningResultDto,
  ItineraryPace,
  ItineraryStopDto,
  ItineraryDayDto,
  ItineraryResponseDto,
  ItineraryReasoningInputDto,
  ItineraryReasoningResultDto,
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
};

export type ReasoningMode =
  | "DISCOVERY_REASONING"
  | "INTENT_INTERPRETATION"
  | "COMMUNITY_INTERPRETATION"
  | "CONTEXTUAL_EXPLANATION"
  | "ALTERNATIVE_REASONING"
  | "ITINERARY_REASONING"
  | "TAKE_HOME_REASONING";

/**
 * Provider interface isolating AI reasoning from domain logic.
 */
export interface ReasoningProvider {
  reason(input: DiscoveryReasoningInputDto): Promise<DiscoveryReasoningResultDto>;
  reasonAboutAlternative(
    input: AlternativeReasoningInputDto,
  ): Promise<AlternativeReasoningResultDto>;
  reasonAboutItinerary(input: ItineraryReasoningInputDto): Promise<ItineraryReasoningResultDto>;
  reasonAboutTakeHome(input: TakeHomeReasoningInputDto): Promise<TakeHomeReasoningResultDto>;
}
