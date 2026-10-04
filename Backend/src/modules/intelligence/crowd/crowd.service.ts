import { crowdRepository, type CrowdRepository } from "./crowd.repository.js";
import { calculateCrowdIntelligence } from "./crowd.engine.js";
import { placeRepository, type PlaceRepository } from "../../places/places.repository.js";
import {
  communityRepository,
  type CommunityRepository,
} from "../../community/community.repository.js";
import type { CrowdIntelligenceDto, CrowdCalculationInputs } from "./crowd.types.js";
import type { CreateCrowdObservationInput, CrowdQueryInput } from "./crowd.schema.js";
import { NotFoundError } from "../../../lib/errors/AppError.js";
import { logger } from "../../../lib/logger/logger.js";

export class CrowdService {
  constructor(
    private repo: CrowdRepository = crowdRepository,
    private placesRepo: PlaceRepository = placeRepository,
    private commRepo: CommunityRepository = communityRepository,
  ) {}

  async getCrowdIntelligenceForPlace(
    placeId: string,
    query?: Partial<CrowdQueryInput>,
    requestId?: string,
  ): Promise<CrowdIntelligenceDto> {
    const place = await this.placesRepo.findPlaceByIdOrSlug(placeId);
    if (!place) {
      throw new NotFoundError(`Place with identifier '${placeId}' not found`);
    }

    const placeObservations = await this.repo.findObservationsByPlaceId(place.id);
    const destinationObservations = place.destinationId
      ? await this.repo.findObservationsByDestinationId(place.destinationId)
      : [];

    const { items: submissions } = await this.commRepo.findSubmissionsByPlaceId(place.id);

    const calculationInputs: CrowdCalculationInputs = {
      placeId: place.id,
      placeName: place.name,
      destinationId: place.destinationId,
      destinationName: place.destination?.name,
      dayType: query?.dayType || "ANY",
      timeWindow: query?.timeWindow,
      season: query?.season || "ANY",
      placeObservations,
      destinationObservations,
      communitySubmissions: submissions,
    };

    const result = calculateCrowdIntelligence(calculationInputs);

    logger.info("Calculated crowd intelligence for place", requestId, {
      placeId: place.id,
      overall: result.overall,
      patternCount: result.patterns.length,
      crowdFit: result.crowdFit,
    });

    return result;
  }

  async getCrowdIntelligenceForDestination(
    destinationId: string,
    query?: Partial<CrowdQueryInput>,
    requestId?: string,
  ): Promise<CrowdIntelligenceDto> {
    const destinationObservations = await this.repo.findObservationsByDestinationId(destinationId);

    const calculationInputs: CrowdCalculationInputs = {
      destinationId,
      dayType: query?.dayType || "ANY",
      timeWindow: query?.timeWindow,
      season: query?.season || "ANY",
      placeObservations: [],
      destinationObservations,
    };

    const result = calculateCrowdIntelligence(calculationInputs);

    logger.info("Calculated crowd intelligence for destination", requestId, {
      destinationId,
      overall: result.overall,
      patternCount: result.patterns.length,
    });

    return result;
  }

  async createCrowdObservation(
    input: CreateCrowdObservationInput,
    userId?: string | null,
    placeId?: string | null,
    requestId?: string,
  ) {
    if (placeId) {
      const place = await this.placesRepo.findPlaceByIdOrSlug(placeId);
      if (!place) {
        throw new NotFoundError(`Place with identifier '${placeId}' not found`);
      }
      placeId = place.id;
    }

    const created = await this.repo.createObservation(input, userId, placeId, "COMMUNITY");

    logger.info("Recorded crowd observation", requestId, {
      observationId: created.id,
      placeId: created.placeId,
      destinationId: created.destinationId,
      level: created.level,
      dayType: created.dayType,
    });

    return created;
  }
}

export const crowdService = new CrowdService();
