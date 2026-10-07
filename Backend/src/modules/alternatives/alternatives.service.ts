import { NotFoundError } from "../../lib/errors/AppError.js";
import { logger } from "../../lib/logger/logger.js";
import { placeRepository, type PlaceRepository } from "../places/places.repository.js";
import {
  alternativesCandidateGenerator,
  type AlternativesCandidateGenerator,
} from "./alternatives.generator.js";
import { alternativesScorer, type AlternativesScorer } from "./alternatives.scorer.js";
import { communityService, type CommunityService } from "../community/community.service.js";
import { timeService, type TimeService } from "../intelligence/time/time.service.js";
import { crowdService, type CrowdService } from "../intelligence/crowd/crowd.service.js";
import { geminiService, type GeminiService } from "../../integrations/gemini/gemini.service.js";
import type { ValidatedAlternativesQuery } from "./alternatives.schema.js";
import type {
  AlternativeRecommendationResponse,
  AlternativeCandidate,
  AlternativeReasoning,
  PlaceReference,
} from "@offbeat/shared";
import type { CandidateGenerationQuery } from "./alternatives.types.js";

// Places considered canonical high-value / must-visit where enhancements are preferred over replacement
const CANONICAL_MUST_VISIT_IDS = new Set([
  "place_tiger_hill",
  "place_victoria_memorial",
  "place_digha_beach",
]);

export class AlternativesService {
  constructor(
    private placesRepo: PlaceRepository = placeRepository,
    private generator: AlternativesCandidateGenerator = alternativesCandidateGenerator,
    private scorer: AlternativesScorer = alternativesScorer,
    private community: CommunityService = communityService,
    private time: TimeService = timeService,
    private crowd: CrowdService = crowdService,
    private gemini: GeminiService = geminiService,
  ) {}

  /**
   * Signature OFFBEAT "Find An Alternative" pipeline:
   * Deterministic candidates -> Signal enrichment -> Multi-mode scoring ->
   * Allowlist -> Gemini reasoning -> Deterministic fallback -> Response
   */
  async findAlternatives(
    placeIdentifier: string,
    query: ValidatedAlternativesQuery,
    options?: { requestId?: string },
  ): Promise<AlternativeRecommendationResponse> {
    const startTime = Date.now();
    const requestId = options?.requestId;

    // 1. Resolve Original Place
    const originalPlace = await this.placesRepo.findPlaceByIdOrSlug(placeIdentifier);
    if (!originalPlace) {
      logger.warn(`Alternative requested for unknown place: ${placeIdentifier}`, requestId);
      throw new NotFoundError(`Place with identifier '${placeIdentifier}' not found`);
    }

    const originalRef: PlaceReference = {
      id: originalPlace.id,
      name: originalPlace.name,
      slug: originalPlace.slug,
      destination: originalPlace.destination?.name,
      categories: originalPlace.categories.map((c) => c.category.name),
      location: { lat: originalPlace.latitude, lng: originalPlace.longitude },
      imageUrl: originalPlace.imageUrl,
      description: originalPlace.description,
    };

    // 2. Check Must-Visit Nuance
    const isMustVisit = CANONICAL_MUST_VISIT_IDS.has(originalPlace.id);
    if (isMustVisit && query.mode === "REPLACEMENT") {
      logger.info(
        "Must-visit place requested for replacement; system will preserve original context and suggest complementary depth",
        requestId,
        { placeId: originalPlace.id, placeName: originalPlace.name },
      );
    }

    // 3. Build Query Context
    const generationQuery: CandidateGenerationQuery = {
      mode: query.mode,
      country: query.country || "India",
      region: query.region || originalPlace.destination?.regionId || "India",
      destination: query.destination || originalPlace.destination?.name,
      travelTaste: query.travelTaste || [],
      experienceTaste: query.experienceTaste || [],
      dayNight: query.dayNight || "DAY",
      preferredTime: query.preferredTime,
      limit: query.limit || 5,
    };

    logger.info("Generating alternative candidates", requestId, {
      originalPlaceId: originalPlace.id,
      originalPlaceName: originalPlace.name,
      mode: query.mode,
    });

    // 4. Deterministic Candidate Generation (Internal + External SerpApi)
    const rawCandidates = await this.generator.generateCandidates(originalPlace, generationQuery, {
      requestId,
    });

    const totalEvaluated = rawCandidates.length;

    // Handle Empty Candidate Set
    if (rawCandidates.length === 0) {
      return {
        originalPlace: originalRef,
        mode: query.mode,
        alternatives: [],
        reasoning: {
          source: "DETERMINISTIC",
          explanation:
            "OFFBEAT couldn't find a strong alternative yet. Try a different type of experience.",
          selectedCandidateIds: [],
          mode: query.mode,
        },
        fallback: true,
        totalCandidatesEvaluated: 0,
      };
    }

    // 5. Enrich Candidates with Community, Time, Crowd & Confidence Signals
    const scoredCandidates = await Promise.all(
      rawCandidates.map(async (cand) => {
        let timeFit: import("@offbeat/shared").TimeFit | undefined;
        let crowdFit: import("@offbeat/shared").CrowdFit | undefined;
        let crowdLevel: import("@offbeat/shared").CrowdLevel | undefined;
        let bestTime: { start?: string; end?: string; reason?: string } | undefined;
        let communitySignals:
          { submissionCount: number; helpfulCount: number; verifiedCount: number } | undefined;

        if (cand.id) {
          // Internal place signals
          try {
            const timeIntel = await this.time.getTimeIntelligenceForPlace(cand.id, {
              dayNight: generationQuery.dayNight,
              preferredTime: generationQuery.preferredTime,
              experienceTaste: generationQuery.experienceTaste,
            });
            timeFit = timeIntel.timeFit;
            if (timeIntel.recommendedTimes[0]) {
              bestTime = {
                start: timeIntel.recommendedTimes[0].start,
                end: timeIntel.recommendedTimes[0].end,
                reason: timeIntel.recommendedTimes[0].reason,
              };
            }
          } catch {
            // non-blocking
          }

          try {
            const crowdIntel = await this.crowd.getCrowdIntelligenceForPlace(cand.id, {
              timeWindow: generationQuery.preferredTime || undefined,
            });
            crowdLevel = crowdIntel.overall;
            crowdFit = crowdIntel.crowdFit;
          } catch {
            // non-blocking
          }

          try {
            const commData = await this.community.getCommunitySignalsForPlace(cand.id);
            if (commData.submissionCount > 0) {
              communitySignals = {
                submissionCount: commData.submissionCount,
                helpfulCount: (commData.usefulCount || 0) + (commData.confirmCount || 0),
                verifiedCount: commData.verifiedCount ?? 0,
              };
            }
          } catch {
            // non-blocking
          }
        } else {
          // External candidate: crowd defaults to UNKNOWN, never fabricated
          crowdLevel = "UNKNOWN";
          crowdFit = "UNKNOWN";
        }

        return this.scorer.scoreCandidate(cand, originalPlace, generationQuery, {
          timeFit,
          crowdFit,
          crowdLevel,
          bestTime,
          confidence: undefined,
          community: communitySignals,
        });
      }),
    );

    // 6. Sort Candidates Descending by Score
    scoredCandidates.sort((a, b) => b.rawScore - a.rawScore);

    // 7. Bounded Top Candidate Allowlist for Gemini (Top 5)
    const boundedCandidates: AlternativeCandidate[] = scoredCandidates.slice(
      0,
      generationQuery.limit,
    );

    // 8. Gemini Reasoning Layer (Over Approved Candidates)
    let alternativeReasoning: AlternativeReasoning | undefined;
    let isFallback: boolean;

    try {
      const reasoningResult = await this.gemini.reasonAboutAlternative({
        originalPlace: originalRef,
        mode: query.mode,
        userContext: {
          region: generationQuery.region,
          destination: generationQuery.destination,
          travelTaste: generationQuery.travelTaste,
          experienceTaste: generationQuery.experienceTaste,
          dayNight: generationQuery.dayNight,
          preferredTime: generationQuery.preferredTime,
        },
        candidates: boundedCandidates,
      });

      alternativeReasoning = {
        source: reasoningResult.source,
        explanation: reasoningResult.explanation,
        selectedCandidateIds: reasoningResult.selectedCandidateIds,
        primaryCandidateId: reasoningResult.primaryCandidateId,
        mode: reasoningResult.mode,
        tradeoff: reasoningResult.tradeoff,
        relationship: reasoningResult.relationship,
      };

      isFallback = reasoningResult.source === "DETERMINISTIC";

      // If Gemini promoted a different approved candidate to primary, reorder position 0
      if (
        reasoningResult.primaryCandidateId &&
        boundedCandidates[0] &&
        boundedCandidates[0].placeId !== reasoningResult.primaryCandidateId &&
        boundedCandidates[0].externalId !== reasoningResult.primaryCandidateId
      ) {
        const primaryIdx = boundedCandidates.findIndex(
          (c) =>
            c.placeId === reasoningResult.primaryCandidateId ||
            c.externalId === reasoningResult.primaryCandidateId,
        );
        if (primaryIdx > 0) {
          const [promoted] = boundedCandidates.splice(primaryIdx, 1);
          if (promoted) {
            boundedCandidates.unshift(promoted);
          }
        }
      }
    } catch (reasoningErr) {
      logger.warn(
        "Alternative reasoning step failed or skipped; applying deterministic fallback",
        requestId,
        {},
        reasoningErr as Error,
      );

      const fallbackResult = this.gemini.generateDeterministicAlternativeFallback({
        originalPlace: originalRef,
        mode: query.mode,
        userContext: {
          region: generationQuery.region,
          destination: generationQuery.destination,
          travelTaste: generationQuery.travelTaste,
          experienceTaste: generationQuery.experienceTaste,
          dayNight: generationQuery.dayNight,
          preferredTime: generationQuery.preferredTime,
        },
        candidates: boundedCandidates,
      });

      alternativeReasoning = {
        source: "DETERMINISTIC",
        explanation: fallbackResult.explanation,
        selectedCandidateIds: fallbackResult.selectedCandidateIds,
        primaryCandidateId: fallbackResult.primaryCandidateId,
        mode: fallbackResult.mode,
        tradeoff: fallbackResult.tradeoff,
        relationship: fallbackResult.relationship,
      };
      isFallback = true;
    }

    const durationMs = Date.now() - startTime;
    logger.info("Alternative recommendation generated successfully", requestId, {
      originalPlace: originalPlace.name,
      mode: query.mode,
      totalEvaluated,
      returnedCount: boundedCandidates.length,
      fallback: isFallback,
      durationMs,
    });

    return {
      originalPlace: originalRef,
      mode: query.mode,
      alternatives: boundedCandidates,
      reasoning: alternativeReasoning,
      fallback: isFallback,
      totalCandidatesEvaluated: totalEvaluated,
    };
  }
}

export const alternativesService = new AlternativesService();
