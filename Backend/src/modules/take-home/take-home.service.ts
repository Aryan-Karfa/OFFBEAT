import { logger } from "../../lib/logger/logger.js";
import {
  takeHomeCandidateCollector,
  type TakeHomeCandidateCollector,
  type ResolvedDestinationInfo,
} from "./take-home.candidate-collector.js";
import { TakeHomeScorer } from "./take-home.scorer.js";
import { geminiService, type GeminiService } from "../../integrations/gemini/gemini.service.js";
import type {
  TakeHomeQueryDto,
  TakeHomeResponseDto,
  TakeHomeReasoningInputDto,
  TakeHomeItemDto,
  TakeHomeReasoningDto,
  ScoredTakeHomeItem,
} from "./take-home.types.js";

export class TakeHomeService {
  constructor(
    private collector: TakeHomeCandidateCollector = takeHomeCandidateCollector,
    private gemini: GeminiService = geminiService,
  ) {}

  /**
   * Retrieves Take Home recommendations for a destination.
   */
  public async getTakeHomeByDestination(
    destinationIdentifier: string,
    query: TakeHomeQueryDto,
    options?: { requestId?: string },
  ): Promise<TakeHomeResponseDto> {
    const destination = await this.collector.resolveDestination(destinationIdentifier);
    return this.processTakeHome(destination, query, options);
  }

  /**
   * Retrieves contextual Take Home recommendations for a specific place.
   */
  public async getTakeHomeByPlace(
    placeId: string,
    query: TakeHomeQueryDto,
    options?: { requestId?: string },
  ): Promise<TakeHomeResponseDto> {
    const destination = await this.collector.resolveDestination(undefined, placeId);
    return this.processTakeHome(destination, query, options);
  }

  /**
   * Pipeline: Candidates -> Deterministic Scoring -> Gemini AI Reasoning -> Hard Guards -> Return
   */
  private async processTakeHome(
    destination: ResolvedDestinationInfo,
    query: TakeHomeQueryDto,
    options?: { requestId?: string },
  ): Promise<TakeHomeResponseDto> {
    const requestId = options?.requestId;

    logger.info("Processing Take Home request", requestId, {
      destinationId: destination.id,
      destinationName: destination.name,
      placeId: destination.place?.id,
      category: query.category,
      giftFor: query.giftFor,
    });

    // 1. Candidate Collection (Canonical + Community + SerpApi)
    const rawCandidates = await this.collector.collectCandidates(destination, query, {
      requestId,
    });

    // 2. Deterministic Local Relevance Scoring
    const scoredCandidates = TakeHomeScorer.scoreCandidates(rawCandidates, query, destination.id);

    // 3. Handle Empty State Truthfully
    if (scoredCandidates.length === 0) {
      return {
        destination: {
          id: destination.id,
          name: destination.name,
          regionId: destination.regionId || "IN-WB",
        },
        place: destination.place
          ? {
              id: destination.place.id,
              name: destination.place.name,
            }
          : undefined,
        items: [],
        reasoning: {
          primaryItemId: undefined,
          selectedItemIds: [],
          explanation: `OFFBEAT doesn't have enough reliable local information for ${destination.name} yet.`,
          itemReasons: [],
          source: "DETERMINISTIC",
          fallback: true,
        },
        totalCount: 0,
        source: "DETERMINISTIC",
        fallback: false,
      };
    }

    // 4. Bound candidates for AI evaluation (Top 5-8 items)
    const boundedCandidates: TakeHomeItemDto[] = scoredCandidates.slice(0, 8).map((sc) => {
      // Omit raw internal score fields from public DTO
      const itemDto = { ...sc };
      delete (itemDto as Partial<ScoredTakeHomeItem>).rawScore;
      delete (itemDto as Partial<ScoredTakeHomeItem>).scoreBreakdown;
      return itemDto;
    });

    // 5. AI Reasoning with Allowlist and Business Guardrails
    const reasoningInput: TakeHomeReasoningInputDto = {
      destination: {
        id: destination.id,
        name: destination.name,
        regionId: destination.regionId || "IN-WB",
      },
      userContext: {
        travelTaste: query.travelTaste,
        experienceTaste: query.experienceTaste,
        giftFor: query.giftFor,
        budget: query.budget,
        category: query.category,
      },
      candidateItems: boundedCandidates,
    };

    let reasoningResult: TakeHomeReasoningDto;
    try {
      const aiResult = await this.gemini.reasonAboutTakeHome(reasoningInput);
      reasoningResult = {
        primaryItemId: aiResult.primaryItemId,
        selectedItemIds: aiResult.selectedItemIds,
        explanation: aiResult.explanation,
        itemReasons: aiResult.itemReasons,
        suggestedSourceIds: aiResult.suggestedSourceIds,
        source: aiResult.source,
        fallback: aiResult.source === "DETERMINISTIC",
      };
    } catch {
      const fallback = this.gemini.generateDeterministicTakeHomeFallback(
        reasoningInput,
        "Take-home reasoning invocation exception",
      );
      reasoningResult = {
        primaryItemId: fallback.primaryItemId,
        selectedItemIds: fallback.selectedItemIds,
        explanation: fallback.explanation,
        itemReasons: fallback.itemReasons,
        source: "DETERMINISTIC",
        fallback: true,
      };
    }

    // 6. Assemble Final Items
    // If AI or fallback specified item reasons, enhance whyTakeHome if helpful
    const itemReasonMap = new Map(
      (reasoningResult.itemReasons || []).map((r) => [r.itemId, r.reason]),
    );

    const finalItems = boundedCandidates.map((item) => {
      const specificReason = itemReasonMap.get(item.id);
      return {
        ...item,
        // Preserve truthfulness: if specific reason exists, keep whyTakeHome clear and grounded
        whyTakeHome: specificReason || item.whyTakeHome,
      };
    });

    // If AI selected an order, respect the order of selectedItemIds
    if (reasoningResult.primaryItemId) {
      finalItems.sort((a, b) => {
        if (a.id === reasoningResult.primaryItemId) return -1;
        if (b.id === reasoningResult.primaryItemId) return 1;
        return 0;
      });
    }

    return {
      destination: {
        id: destination.id,
        name: destination.name,
        regionId: destination.regionId || "IN-WB",
      },
      place: destination.place
        ? {
            id: destination.place.id,
            name: destination.place.name,
          }
        : undefined,
      items: finalItems,
      reasoning: reasoningResult,
      totalCount: finalItems.length,
      source: reasoningResult.source,
      fallback: reasoningResult.fallback ?? false,
    };
  }
}

export const takeHomeService = new TakeHomeService();
