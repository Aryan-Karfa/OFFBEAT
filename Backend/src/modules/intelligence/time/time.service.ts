import { timeRepository, type TimeRepository } from "./time.repository.js";
import { calculateTimeIntelligence } from "./time.engine.js";
import { placeRepository, type PlaceRepository } from "../../places/places.repository.js";
import {
  communityRepository,
  type CommunityRepository,
} from "../../community/community.repository.js";
import type { TimeIntelligenceDto, TimeCalculationInputs } from "./time.types.js";
import type { CreateTimeObservationInput, TimeQueryInput } from "./time.schema.js";
import { NotFoundError } from "../../../lib/errors/AppError.js";
import { logger } from "../../../lib/logger/logger.js";

export class TimeService {
  constructor(
    private repo: TimeRepository = timeRepository,
    private placesRepo: PlaceRepository = placeRepository,
    private commRepo: CommunityRepository = communityRepository,
  ) {}

  async getTimeIntelligenceForPlace(
    placeId: string,
    query?: Partial<TimeQueryInput>,
    requestId?: string,
  ): Promise<TimeIntelligenceDto> {
    const place = await this.placesRepo.findPlaceByIdOrSlug(placeId);
    if (!place) {
      throw new NotFoundError(`Place with identifier '${placeId}' not found`);
    }

    const observations = await this.repo.findObservationsByPlaceId(place.id);
    const { items: submissions } = await this.commRepo.findSubmissionsByPlaceId(place.id);

    // Collect opening hours from place external reference if present
    let rawOpeningHours: string[] | null = null;

    // Check if place is known demo place with defined hours or has external references
    if (place.id === "place_tiger_hill") {
      rawOpeningHours = ["Monday - Sunday: 4:00 AM – 6:00 PM"];
    } else if (place.id === "place_victoria_memorial") {
      rawOpeningHours = ["Tuesday - Sunday: 10:00 AM – 6:00 PM", "Monday: Closed"];
    } else if (place.id === "place_batasia_loop") {
      rawOpeningHours = ["Monday - Sunday: 5:00 AM – 8:00 PM"];
    }

    const experienceTastes = Array.isArray(query?.experienceTaste)
      ? query.experienceTaste
      : query?.experienceTaste
        ? [query.experienceTaste]
        : [];

    const calculationInputs: TimeCalculationInputs = {
      placeId: place.id,
      placeName: place.name,
      openingHours: rawOpeningHours,
      userDayNight: query?.dayNight || "ANY",
      preferredTime: query?.preferredTime,
      experienceTastes,
      observations,
      communitySubmissions: submissions,
    };

    const result = calculateTimeIntelligence(calculationInputs);

    logger.info("Calculated time intelligence for place", requestId, {
      placeId: place.id,
      recommendedCount: result.recommendedTimes.length,
      timeFit: result.timeFit,
      hasOpeningHours: (result.operatingHours.schedule?.length ?? 0) > 0,
    });

    return result;
  }

  async createTimeObservation(
    placeId: string,
    input: CreateTimeObservationInput,
    userId?: string | null,
    requestId?: string,
  ) {
    const place = await this.placesRepo.findPlaceByIdOrSlug(placeId);
    if (!place) {
      throw new NotFoundError(`Place with identifier '${placeId}' not found`);
    }

    const created = await this.repo.createObservation(place.id, input, userId, "COMMUNITY");

    logger.info("Recorded time observation for place", requestId, {
      placeId: place.id,
      observationId: created.id,
      type: created.type,
      timeWindow: `${created.startTime}-${created.endTime}`,
    });

    return created;
  }
}

export const timeService = new TimeService();
