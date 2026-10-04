import type {
  ReasoningSource,
  RecommendationReasoningDto,
  DiscoveryReasoningCandidateDto,
  DiscoveryReasoningInputDto,
  DiscoveryReasoningResultDto,
} from "@offbeat/shared";

export type {
  ReasoningSource,
  RecommendationReasoningDto,
  DiscoveryReasoningCandidateDto,
  DiscoveryReasoningInputDto,
  DiscoveryReasoningResultDto,
};

export type ReasoningMode =
  | "DISCOVERY_REASONING"
  | "INTENT_INTERPRETATION"
  | "COMMUNITY_INTERPRETATION"
  | "CONTEXTUAL_EXPLANATION";

/**
 * Provider interface isolating AI reasoning from domain logic.
 */
export interface ReasoningProvider {
  reason(input: DiscoveryReasoningInputDto): Promise<DiscoveryReasoningResultDto>;
}
