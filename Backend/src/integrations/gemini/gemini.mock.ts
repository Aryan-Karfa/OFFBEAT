import type {
  DiscoveryReasoningInputDto,
  DiscoveryReasoningResultDto,
  ReasoningProvider,
} from "./gemini.types.js";
import { GeminiTimeoutError, GeminiProviderError } from "./gemini.errors.js";

export interface MockReasoningOptions {
  shouldFail?: boolean;
  failError?: Error;
  shouldTimeout?: boolean;
  invalidCandidateId?: boolean;
  customOutput?: Partial<DiscoveryReasoningResultDto>;
}

export class MockReasoningProvider implements ReasoningProvider {
  private options: MockReasoningOptions;

  constructor(options: MockReasoningOptions = {}) {
    this.options = options;
  }

  public setOptions(options: MockReasoningOptions): void {
    this.options = options;
  }

  async reason(input: DiscoveryReasoningInputDto): Promise<DiscoveryReasoningResultDto> {
    if (this.options.shouldTimeout) {
      throw new GeminiTimeoutError("Mock Gemini request timed out");
    }

    if (this.options.shouldFail) {
      throw this.options.failError || new GeminiProviderError("Mock Gemini provider error");
    }

    const candidates = input.candidates || [];
    const topCandidate = candidates[0];
    if (!topCandidate) {
      throw new GeminiProviderError("No candidates supplied to reasoning provider");
    }

    const candidateId = this.options.invalidCandidateId
      ? "place_invalid_hallucinated_id"
      : topCandidate.id;

    const reasons: string[] = [];
    if (input.userContext.travelTaste.length) {
      reasons.push(
        `Strong match for traveler interest in ${input.userContext.travelTaste.join(" and ")}`,
      );
    }
    if (topCandidate.bestTime?.start && topCandidate.bestTime?.end) {
      reasons.push(
        `Recommended visiting window is ${topCandidate.bestTime.start} - ${topCandidate.bestTime.end} (${topCandidate.bestTime.reason || "optimal conditions"})`,
      );
    }
    if (topCandidate.crowd?.level) {
      reasons.push(
        `Crowd profile indicates ${topCandidate.crowd.level.toLowerCase()} visitor density during off-peak times`,
      );
    }
    if (topCandidate.communityHighlights?.length) {
      reasons.push(
        `Supported by ${topCandidate.communityHighlights.length} verified community observations`,
      );
    }
    if (reasons.length === 0) {
      reasons.push(
        "Strong holistic alignment with selected destination context and experience preferences",
      );
    }

    const tradeoffs: string[] = [];
    if (topCandidate.bestTime?.start && topCandidate.bestTime.start.startsWith("05")) {
      tradeoffs.push(
        "Requires an early morning departure to catch the peak view before morning haze",
      );
    }
    if (topCandidate.crowd?.level === "HIGH" || topCandidate.crowd?.level === "VERY_HIGH") {
      tradeoffs.push("Expect elevated visitor activity during weekends and peak holiday periods");
    }

    const result: DiscoveryReasoningResultDto = {
      selectedPlaceIds: [candidateId, ...candidates.slice(1).map((c) => c.id)],
      primaryRecommendationId: candidateId,
      recommendationSummary: `${topCandidate.name} emerges as the strongest fit for your ${input.userContext.experienceTaste.join("/") || "discovery"} preferences in ${input.userContext.region}.`,
      reasons: reasons.slice(0, 5),
      tradeoffs: tradeoffs.slice(0, 5),
      contextualNotes: [
        `Observations corroborate reliable access and clear scenic viewpoints during the suggested window.`,
      ],
      source: "GEMINI",
      ...this.options.customOutput,
    };

    return result;
  }
}
