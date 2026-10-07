import { randomUUID } from "node:crypto";
import { placeRepository, type PlaceRepository } from "../places/places.repository.js";
import {
  itineraryCandidateCollector,
  type ItineraryCandidateCollector,
} from "./itinerary.candidate-collector.js";
import { itineraryRouter, type ItineraryRouter } from "./itinerary.router.js";
import { itineraryScheduler, type ItineraryScheduler } from "./itinerary.scheduler.js";
import { geminiService, type GeminiService } from "../../integrations/gemini/gemini.service.js";
import { logger } from "../../lib/logger/logger.js";
import { NotFoundError } from "../../lib/errors/AppError.js";
import type { ValidatedCreateItineraryRequest } from "./itinerary.schema.js";
import type {
  ItineraryResponseDto,
  ItineraryCandidatePlaceDto,
  ItineraryReasoningInputDto,
  ItineraryReasoningDto,
} from "@offbeat/shared";

export class ItineraryService {
  // In-memory persistent cache for generated itineraries
  private static itinerariesMap = new Map<string, ItineraryResponseDto>();

  constructor(
    private placesRepo: PlaceRepository = placeRepository,
    private collector: ItineraryCandidateCollector = itineraryCandidateCollector,
    private router: ItineraryRouter = itineraryRouter,
    private scheduler: ItineraryScheduler = itineraryScheduler,
    private gemini: GeminiService = geminiService,
  ) {}

  /**
   * Generates an intelligent, geographically optimized itinerary.
   */
  public async createItinerary(
    request: ValidatedCreateItineraryRequest,
    options?: { requestId?: string },
  ): Promise<ItineraryResponseDto> {
    const startTime = Date.now();
    const requestId = options?.requestId;

    logger.info("Starting itinerary generation", requestId, {
      regionId: request.regionId,
      destinationId: request.destinationId,
      durationDays: request.durationDays,
      pace: request.pace,
    });

    // 1. Candidate Collection and Multi-Signal Enrichment
    const enrichedCandidates = await this.collector.collectCandidates(request, { requestId });
    if (enrichedCandidates.length === 0) {
      throw new NotFoundError(
        "No places found matching your geographic scope or preferences. Try broadening your criteria.",
      );
    }

    // 2. Resolve Destination Title
    const destinationName =
      enrichedCandidates.find((c) => c.destination)?.destination ||
      (request.destinationId ? "Darjeeling" : "West Bengal");

    // 3. Geographic Routing (Anti-backtracking sequence)
    const targetStopsCount =
      request.pace === "PACKED"
        ? request.durationDays * 4
        : request.pace === "RELAXED"
          ? request.durationDays * 2
          : request.durationDays * 3;

    const routedTransitions = await this.router.orderGeographically(
      enrichedCandidates,
      targetStopsCount,
      { requestId },
    );

    // 4. Time Feasibility, Pacing, and Free-Time Scheduling
    const scheduledDays = this.scheduler.scheduleDays(routedTransitions, {
      pace: request.pace,
      durationDays: request.durationDays,
      preferredStartTime: request.preferredStartTime,
      preferredEndTime: request.preferredEndTime,
      destinationName,
    });

    // 5. Bounded Candidate Allowlist for Gemini (Top 6-8 candidates)
    const boundedCandidates: ItineraryCandidatePlaceDto[] = enrichedCandidates
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        category: c.categories[0],
        categories: c.categories,
        destination: c.destination,
        location: c.location,
        timeFit: c.timeFit,
        crowdFit: c.crowdFit,
        crowdLevel: c.crowdLevel,
        recommendedTime: c.recommendedTime,
        confidence: c.confidence,
        community: c.community,
        isMustVisit: c.isMustVisit,
        isAlternative: c.isAlternative,
      }));

    const draftSchedule = scheduledDays.map((d) => ({
      day: d.day,
      orderedPlaceIds: d.stops
        .filter((s) => !s.isFreeTime)
        .map((s) => s.placeId || s.externalId || s.id),
    }));

    // 6. Gemini Intelligence Layer with Deterministic Fallback
    const geminiInput: ItineraryReasoningInputDto = {
      destination: destinationName,
      regionId: request.regionId,
      pace: request.pace,
      durationDays: request.durationDays,
      travelTaste: request.travelTaste,
      experienceTaste: request.experienceTaste,
      dayNight: request.dayNight,
      candidatePlaces: boundedCandidates,
      draftSchedule,
    };

    let reasoningResult: ItineraryReasoningDto;
    let isFallback: boolean;

    try {
      const geminiOutput = await this.gemini.reasonAboutItinerary(geminiInput);
      reasoningResult = {
        source: geminiOutput.source,
        explanation: geminiOutput.explanation,
        tradeoffs: geminiOutput.tradeoffs,
      };
      isFallback = geminiOutput.source === "DETERMINISTIC";
    } catch (reasoningErr) {
      logger.warn(
        "Gemini itinerary reasoning failed; using deterministic fallback",
        requestId,
        {},
        reasoningErr as Error,
      );

      const fallbackOutput = this.gemini.generateDeterministicItineraryFallback(geminiInput);
      reasoningResult = {
        source: "DETERMINISTIC",
        explanation: fallbackOutput.explanation,
        tradeoffs: fallbackOutput.tradeoffs,
      };
      isFallback = true;
    }

    // 7. Assemble Complete Response
    const totalStopsCount = scheduledDays.reduce((acc, d) => acc + d.stops.length, 0);
    const tastesSummary = request.travelTaste.length
      ? request.travelTaste.join(" & ")
      : "discovery";

    const title = `${destinationName} ${request.durationDays > 1 ? `${request.durationDays}-Day Journey` : "Day Plan"}`;
    const summary = `A ${request.pace.toLowerCase()} pace itinerary curated for ${tastesSummary} in ${destinationName}, sequenced to avoid backtracking and align with optimal daylight windows.`;

    const itinerary: ItineraryResponseDto = {
      id: `itin_${randomUUID().substring(0, 12)}`,
      title,
      destination: destinationName,
      regionId: request.regionId,
      durationDays: request.durationDays,
      pace: request.pace,
      days: scheduledDays,
      summary,
      reasoning: reasoningResult,
      source: reasoningResult.source,
      fallback: isFallback,
      totalStops: totalStopsCount,
      createdAt: new Date().toISOString(),
    };

    // Cache in memory for retrieval
    ItineraryService.itinerariesMap.set(itinerary.id, itinerary);

    const durationMs = Date.now() - startTime;
    logger.info("Itinerary created successfully", requestId, {
      itineraryId: itinerary.id,
      days: itinerary.durationDays,
      totalStops: itinerary.totalStops,
      fallback: isFallback,
      durationMs,
    });

    return itinerary;
  }

  /**
   * Retrieves an itinerary by ID (returns null if not found).
   */
  public async getItinerary(itineraryId: string): Promise<ItineraryResponseDto | null> {
    return ItineraryService.itinerariesMap.get(itineraryId) || null;
  }

  /**
   * Retrieves an itinerary by ID (throws NotFoundError if not found).
   */
  public async getItineraryById(itineraryId: string): Promise<ItineraryResponseDto> {
    const itinerary = ItineraryService.itinerariesMap.get(itineraryId);
    if (!itinerary) {
      throw new NotFoundError(`Itinerary with ID '${itineraryId}' not found`);
    }
    return itinerary;
  }

  /**
   * Resets in-memory itineraries (useful for tests).
   */
  public static clearItineraries(): void {
    this.itinerariesMap.clear();
  }
}

export const itineraryService = new ItineraryService();
