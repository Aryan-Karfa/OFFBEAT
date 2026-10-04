import { placeRepository, type PlaceRepository } from "./places.repository.js";
import type { PlaceDetailDto, PlaceCategoryDto, PlaceWithDetails } from "./places.types.js";
import { NotFoundError } from "../../lib/errors/AppError.js";
import { communityService } from "../community/community.service.js";
import { timeService } from "../intelligence/time/time.service.js";
import { crowdService } from "../intelligence/crowd/crowd.service.js";
import { geminiService } from "../../integrations/gemini/gemini.service.js";

export class PlaceService {
  constructor(private repo: PlaceRepository = placeRepository) {}

  async getPlaceById(identifier: string): Promise<PlaceDetailDto> {
    const place = await this.repo.findPlaceByIdOrSlug(identifier);
    if (!place) {
      throw new NotFoundError(`Place with identifier '${identifier}' not found`);
    }

    const dto = this.mapPlaceToDto(place);
    try {
      const signals = await communityService.getCommunitySignalsForPlace(place.id);
      if (signals.submissionCount > 0) {
        dto.community = signals;
      }
    } catch {
      // Community signals are non-blocking enhancement
    }

    try {
      const timeIntel = await timeService.getTimeIntelligenceForPlace(place.id);
      dto.timeIntelligence = timeIntel;
    } catch {
      // Time intelligence is non-blocking enhancement
    }

    try {
      const crowdIntel = await crowdService.getCrowdIntelligenceForPlace(place.id);
      dto.crowdIntelligence = crowdIntel;
    } catch {
      // Crowd intelligence is non-blocking enhancement
    }

    try {
      const reasoning = geminiService.generateDeterministicFallback({
        userContext: {
          region: place.destination?.name || "Region",
          destination: place.destination?.name || null,
          travelTaste: place.categories.map((c) => c.category.name),
          experienceTaste: [],
          dayNight: "DAY",
        },
        candidates: [
          {
            id: place.id,
            name: place.name,
            description: place.description,
            categories: place.categories.map((c) => c.category.name),
            destination: place.destination.name,
            bestTime: dto.timeIntelligence?.recommendedTimes[0]
              ? {
                  start: dto.timeIntelligence.recommendedTimes[0].start,
                  end: dto.timeIntelligence.recommendedTimes[0].end,
                  reason: dto.timeIntelligence.recommendedTimes[0].reason,
                  source: dto.timeIntelligence.recommendedTimes[0].source,
                }
              : undefined,
            crowd: dto.crowdIntelligence
              ? {
                  level: dto.crowdIntelligence.overall,
                  context: dto.crowdIntelligence.patterns[0]?.time || undefined,
                  source: dto.crowdIntelligence.source,
                  observation: dto.crowdIntelligence.patterns[0]?.observation || undefined,
                }
              : undefined,
            communityHighlights: dto.community?.highlights.map((h) => ({
              title: h.title,
              content: h.content,
              verificationStatus: h.verification?.status,
              evidenceStrength: h.verification?.strength,
            })),
          },
        ],
      });

      dto.reasoning = {
        source: reasoning.source,
        summary: reasoning.recommendationSummary,
        reasons: reasoning.reasons,
        tradeoffs: reasoning.tradeoffs,
        contextualNotes: reasoning.contextualNotes,
      };
    } catch {
      // Reasoning is non-blocking enhancement
    }

    return dto;
  }

  async getCategories(): Promise<PlaceCategoryDto[]> {
    const categories = await this.repo.findAllCategories();
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    }));
  }

  private mapPlaceToDto(place: PlaceWithDetails): PlaceDetailDto {
    return {
      id: place.id,
      name: place.name,
      slug: place.slug,
      destination: place.destination.name,
      categories: place.categories.map((c) => c.category.name),
      location: {
        lat: place.latitude,
        lng: place.longitude,
      },
      description: place.description,
      address: place.address,
      website: place.website,
      phone: place.phone,
      imageUrl: place.imageUrl,
      status: place.status,
    };
  }
}

export const placeService = new PlaceService();
