import { geminiConfig, type GeminiConfig } from "./gemini.config.js";
import { GeminiClient } from "./gemini.client.js";
import { MockReasoningProvider } from "./gemini.mock.js";
import type {
  DiscoveryReasoningCandidateDto,
  DiscoveryReasoningInputDto,
  DiscoveryReasoningResultDto,
  ReasoningProvider,
} from "./gemini.types.js";
import { logger } from "../../lib/logger/logger.js";

export class GeminiService {
  private provider: ReasoningProvider;
  private config: GeminiConfig;

  constructor(provider?: ReasoningProvider, config: GeminiConfig = geminiConfig) {
    this.config = config;
    if (provider) {
      this.provider = provider;
    } else if (process.env.NODE_ENV === "test" || process.env.VITEST) {
      this.provider = new MockReasoningProvider();
    } else if (this.config.enabled && this.config.apiKey) {
      this.provider = new GeminiClient(this.config);
    } else {
      // Default to deterministic provider if key is not configured or disabled
      this.provider = {
        reason: async (input: DiscoveryReasoningInputDto) => {
          return this.generateDeterministicFallback(
            input,
            "Gemini is not enabled or API key is missing",
          );
        },
      };
    }
  }

  public setProvider(provider: ReasoningProvider): void {
    this.provider = provider;
  }

  public getProvider(): ReasoningProvider {
    return this.provider;
  }

  /**
   * Main entrypoint for discovery candidate reasoning.
   * Employs AI contextual interpretation when available,
   * falling back automatically to deterministic evidence reasoning on any failure or timeout.
   */
  async reasonAboutDiscovery(
    input: DiscoveryReasoningInputDto,
  ): Promise<DiscoveryReasoningResultDto> {
    const candidateCount = input.candidates?.length ?? 0;
    if (candidateCount === 0) {
      return {
        selectedPlaceIds: [],
        primaryRecommendationId: "",
        recommendationSummary: "No matching places found for the specified traveler preferences.",
        reasons: [],
        tradeoffs: [],
        contextualNotes: [],
        source: "DETERMINISTIC",
      };
    }

    if (!this.config.enabled) {
      logger.info(
        "Gemini reasoning disabled by configuration; using deterministic evidence reasoning",
      );
      return this.generateDeterministicFallback(input, "Gemini disabled by configuration");
    }

    const startTime = Date.now();

    try {
      const result = await this.provider.reason(input);
      const latencyMs = Date.now() - startTime;
      logger.info("Gemini discovery reasoning completed successfully", undefined, {
        model: this.config.model,
        latencyMs,
        primaryId: result.primaryRecommendationId,
        source: result.source,
      });
      return result;
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorName = (err as Error)?.name || "ReasoningError";
      const errorMessage = (err as Error)?.message || String(err);

      logger.warn(
        "Gemini reasoning failed or timed out; falling back to deterministic evidence reasoning",
        undefined,
        {
          errorName,
          errorMessage,
          latencyMs,
          candidatesProvided: candidateCount,
        },
        err as Error,
      );

      return this.generateDeterministicFallback(input, errorMessage);
    }
  }

  /**
   * Generates grounded, deterministic recommendation reasoning from Phase 7-10 signals.
   */
  public generateDeterministicFallback(
    input: DiscoveryReasoningInputDto,
    fallbackReason?: string,
  ): DiscoveryReasoningResultDto {
    const candidates = input.candidates || [];
    const topCandidate: DiscoveryReasoningCandidateDto | undefined = candidates[0];

    if (!topCandidate) {
      return {
        selectedPlaceIds: [],
        primaryRecommendationId: "",
        recommendationSummary: "No candidates available for recommendation.",
        reasons: [],
        tradeoffs: [],
        contextualNotes: [],
        source: "DETERMINISTIC",
      };
    }

    const reasons: string[] = [];

    // 1. Taste alignment
    if (topCandidate.why && topCandidate.why.length > 0) {
      reasons.push(topCandidate.why.slice(0, 2).join(". "));
    } else if (input.userContext.travelTaste.length > 0) {
      reasons.push(
        `Strong alignment with your interest in ${input.userContext.travelTaste.join(", ")}`,
      );
    }

    // 2. Time intelligence
    if (topCandidate.bestTime?.start && topCandidate.bestTime?.end) {
      reasons.push(
        `Optimal visiting window is ${topCandidate.bestTime.start} - ${topCandidate.bestTime.end} (${topCandidate.bestTime.reason || "recommended conditions"})`,
      );
    }

    // 3. Crowd intelligence
    if (topCandidate.crowd?.level) {
      const levelLabel = topCandidate.crowd.level.toLowerCase();
      reasons.push(
        `Crowd assessment indicates ${levelLabel} density${topCandidate.crowd.context ? ` (${topCandidate.crowd.context})` : ""}`,
      );
    }

    // 4. Community and confidence evidence
    if (topCandidate.communityHighlights && topCandidate.communityHighlights.length > 0) {
      reasons.push(
        `Supported by ${topCandidate.communityHighlights.length} verified community report${topCandidate.communityHighlights.length > 1 ? "s" : ""}`,
      );
    }

    if (reasons.length === 0) {
      reasons.push("Matches selected region and category filters with high evidence confidence");
    }

    const tradeoffs: string[] = [];
    if (
      topCandidate.bestTime?.start &&
      (topCandidate.bestTime.start.startsWith("05") || topCandidate.bestTime.start.startsWith("04"))
    ) {
      tradeoffs.push(
        "Requires an early morning start to reach the site ahead of morning mist and congestion",
      );
    }
    if (topCandidate.crowd?.level === "HIGH" || topCandidate.crowd?.level === "VERY_HIGH") {
      tradeoffs.push(
        "Popular attraction with heavier visitor density during peak hours and weekends",
      );
    }
    if (topCandidate.timeFit === "PARTIAL") {
      tradeoffs.push("Your preferred schedule falls outside the ideal lighting or weather window");
    }

    const contextualNotes: string[] = [
      `Deterministic recommendation based on verified place evidence, timing windows, and community signals.`,
    ];
    if (fallbackReason) {
      contextualNotes.push(`Reasoning fallback applied.`);
    }

    return {
      selectedPlaceIds: candidates.map((c) => c.id),
      primaryRecommendationId: topCandidate.id,
      recommendationSummary: `${topCandidate.name} is the top evidence-supported recommendation for your journey in ${input.userContext.region}.`,
      reasons: reasons.slice(0, 5),
      tradeoffs: tradeoffs.slice(0, 5),
      contextualNotes: contextualNotes.slice(0, 5),
      source: "DETERMINISTIC",
    };
  }
}

export const geminiService = new GeminiService();
