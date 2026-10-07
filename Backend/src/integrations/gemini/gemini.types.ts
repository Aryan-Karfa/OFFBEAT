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
};

export type ReasoningMode =
  | "DISCOVERY_REASONING"
  | "INTENT_INTERPRETATION"
  | "COMMUNITY_INTERPRETATION"
  | "CONTEXTUAL_EXPLANATION"
  | "ALTERNATIVE_REASONING";

/**
 * Provider interface isolating AI reasoning from domain logic.
 */
export interface ReasoningProvider {
  reason(input: DiscoveryReasoningInputDto): Promise<DiscoveryReasoningResultDto>;
  reasonAboutAlternative(input: AlternativeReasoningInputDto): Promise<AlternativeReasoningResultDto>;
}

