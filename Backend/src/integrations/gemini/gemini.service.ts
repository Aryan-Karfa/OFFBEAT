import { geminiConfig, type GeminiConfig } from "./gemini.config.js";
import { GeminiClient } from "./gemini.client.js";
import { MockReasoningProvider } from "./gemini.mock.js";
import type {
  DiscoveryReasoningCandidateDto,
  DiscoveryReasoningInputDto,
  DiscoveryReasoningResultDto,
  AlternativeReasoningInputDto,
  AlternativeReasoningResultDto,
  ItineraryReasoningInputDto,
  ItineraryReasoningResultDto,
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
        reasonAboutAlternative: async (input: AlternativeReasoningInputDto) => {
          return this.generateDeterministicAlternativeFallback(
            input,
            "Gemini is not enabled or API key is missing",
          );
        },
        reasonAboutItinerary: async (input: ItineraryReasoningInputDto) => {
          return this.generateDeterministicItineraryFallback(
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

  /**
   * Main entrypoint for alternative reasoning.
   * Employs AI reasoning when available over bounded candidates,
   * falling back automatically to deterministic alternative reasoning on any failure or timeout.
   */
  async reasonAboutAlternative(
    input: AlternativeReasoningInputDto,
  ): Promise<AlternativeReasoningResultDto> {
    const candidateCount = input.candidates?.length ?? 0;
    if (candidateCount === 0) {
      return {
        selectedCandidateIds: [],
        primaryCandidateId: undefined,
        explanation: "No alternative candidates were available for evaluation.",
        mode: input.mode,
        source: "DETERMINISTIC",
      };
    }

    if (!this.config.enabled) {
      logger.info(
        "Gemini alternative reasoning disabled by configuration; using deterministic reasoning",
      );
      return this.generateDeterministicAlternativeFallback(
        input,
        "Gemini disabled by configuration",
      );
    }

    const startTime = Date.now();
    try {
      const result = await this.provider.reasonAboutAlternative(input);
      const latencyMs = Date.now() - startTime;
      logger.info("Gemini alternative reasoning completed successfully", undefined, {
        model: this.config.model,
        latencyMs,
        mode: input.mode,
        primaryId: result.primaryCandidateId,
        source: result.source,
      });
      return result;
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorName = (err as Error)?.name || "ReasoningError";
      const errorMessage = (err as Error)?.message || String(err);

      logger.warn(
        "Gemini alternative reasoning failed or timed out; falling back to deterministic reasoning",
        undefined,
        {
          errorName,
          errorMessage,
          latencyMs,
          mode: input.mode,
          candidatesProvided: candidateCount,
        },
        err as Error,
      );

      return this.generateDeterministicAlternativeFallback(input, errorMessage);
    }
  }

  /**
   * Generates grounded, deterministic alternative reasoning based on OFFBEAT signals.
   */
  public generateDeterministicAlternativeFallback(
    input: AlternativeReasoningInputDto,
    fallbackReason?: string,
  ): AlternativeReasoningResultDto {
    if (fallbackReason) {
      logger.debug(`[GeminiService] Alternative fallback: ${fallbackReason}`);
    }
    const candidates = input.candidates || [];
    const topCandidate = candidates[0];

    if (!topCandidate) {
      return {
        selectedCandidateIds: [],
        primaryCandidateId: undefined,
        explanation:
          "OFFBEAT couldn't find a strong alternative yet. Try a different type of experience.",
        mode: input.mode,
        source: "DETERMINISTIC",
      };
    }

    const candidateId = topCandidate.placeId || topCandidate.externalId || "candidate_1";

    let explanation: string;
    let relationship: string | undefined;

    switch (input.mode) {
      case "ENHANCEMENT":
        explanation = `Keep ${input.originalPlace.name}. Add ${topCandidate.name} to enrich the journey with ${topCandidate.why || "complementary panoramic and cultural depth"}.`;
        relationship = `Pairs with ${input.originalPlace.name}`;
        break;
      case "COMPLEMENTARY":
        explanation = `${topCandidate.name} complements ${input.originalPlace.name} in ${topCandidate.destination || "the journey"}, providing a different but harmonious perspective.`;
        relationship = `Complements ${input.originalPlace.name}`;
        break;
      case "NEARBY_DISCOVERY":
        explanation = `A high-discovery hidden gem located close to ${input.originalPlace.name}, aligned with your preference for ${input.userContext.travelTaste.join(", ") || "exploration"}.`;
        relationship = `Near ${input.originalPlace.name}`;
        break;
      case "LOWER_CROWD":
        if (topCandidate.crowd?.level === "LOW" || topCandidate.crowdFit === "GOOD") {
          explanation = `${topCandidate.name} has a lower crowd profile than ${input.originalPlace.name}, offering a more serene visit.`;
        } else {
          explanation = `${topCandidate.name} was evaluated for lower crowd. Note: crowd level is ${topCandidate.crowd?.level || "UNKNOWN"} based on current evidence.`;
        }
        break;
      case "TIMING_ALTERNATIVE":
        if (topCandidate.bestTime?.start && topCandidate.bestTime?.end) {
          explanation = `${topCandidate.name} features an optimal visiting window (${topCandidate.bestTime.start} - ${topCandidate.bestTime.end}) that better matches your schedule.`;
        } else {
          explanation = `${topCandidate.name} offers a more accommodating visiting schedule than ${input.originalPlace.name}.`;
        }
        break;
      case "REPLACEMENT":
      default:
        explanation = `A compelling substitute for ${input.originalPlace.name} with similar ${topCandidate.categories?.join(", ") || "landscape"} appeal and verified scenic attributes.`;
        break;
    }

    return {
      selectedCandidateIds: candidates.map((c) => c.placeId || c.externalId || "").filter(Boolean),
      primaryCandidateId: candidateId,
      explanation,
      mode: input.mode,
      tradeoff: topCandidate.tradeoff || "Check local transit schedules before departing.",
      relationship,
      source: "DETERMINISTIC",
    };
  }

  /**
   * Generates AI reasoning for itinerary sequence with automatic deterministic fallback.
   */
  public async reasonAboutItinerary(
    input: ItineraryReasoningInputDto,
  ): Promise<ItineraryReasoningResultDto> {
    const startTime = Date.now();
    const candidateCount = input.candidatePlaces.length;

    if (!this.config.enabled) {
      logger.info(
        "Gemini reasoning disabled by configuration; using deterministic itinerary reasoning",
      );
      return this.generateDeterministicItineraryFallback(
        input,
        "Gemini is disabled in configuration",
      );
    }

    try {
      const result = await this.provider.reasonAboutItinerary(input);
      const latencyMs = Date.now() - startTime;

      logger.info("Gemini itinerary reasoning completed successfully", undefined, {
        destination: input.destination,
        pace: input.pace,
        totalStops: result.orderedPlaceIds.length,
        latencyMs,
        source: result.source,
      });

      return result;
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorName = (err as Error)?.name || "UnknownError";
      const errorMessage = (err as Error)?.message || String(err);

      logger.warn(
        "Gemini itinerary reasoning failed or timed out; falling back to deterministic reasoning",
        undefined,
        {
          errorName,
          errorMessage,
          latencyMs,
          destination: input.destination,
          candidatesProvided: candidateCount,
        },
        err as Error,
      );

      return this.generateDeterministicItineraryFallback(input, errorMessage);
    }
  }

  /**
   * Generates grounded, deterministic itinerary reasoning based on OFFBEAT signals.
   */
  public generateDeterministicItineraryFallback(
    input: ItineraryReasoningInputDto,
    fallbackReason?: string,
  ): ItineraryReasoningResultDto {
    if (fallbackReason) {
      logger.debug(`[GeminiService] Itinerary fallback: ${fallbackReason}`);
    }
    const orderedPlaceIds =
      input.draftSchedule.flatMap((d) => d.orderedPlaceIds).length > 0
        ? input.draftSchedule.flatMap((d) => d.orderedPlaceIds)
        : input.candidatePlaces.slice(0, 4).map((c) => c.id);

    const dayAssignments = input.draftSchedule.map((d) => ({
      day: d.day,
      placeIds: d.orderedPlaceIds,
    }));

    const tastesStr = input.travelTaste.length
      ? input.travelTaste.join(" and ")
      : "panoramic discovery";

    const explanation = `A coherent ${input.durationDays}-day journey in ${input.destination} scheduled at a ${input.pace.toLowerCase()} pace, sequenced to optimize daylight transitions and minimize travel backtracking for your ${tastesStr} preferences.`;

    const tradeoffs = [
      input.pace === "PACKED"
        ? "Tight schedule requiring prompt transitions between stops."
        : input.pace === "RELAXED"
          ? "Unrushed tempo with dedicated free time buffers; fewer total stops."
          : "Balanced journey allowing standard visit durations with modest transit windows.",
    ];

    return {
      orderedPlaceIds,
      dayAssignments,
      explanation,
      tradeoffs,
      source: "DETERMINISTIC",
    };
  }
}

export const geminiService = new GeminiService();
