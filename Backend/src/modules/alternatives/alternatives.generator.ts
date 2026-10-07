import { placeRepository, type PlaceRepository } from "../places/places.repository.js";
import { serpApiService, type SerpApiService } from "../../integrations/serpapi/serpapi.service.js";
import { logger } from "../../lib/logger/logger.js";
import type { PlaceWithDetails } from "../places/places.types.js";
import type { RawCandidatePlace, CandidateGenerationQuery } from "./alternatives.types.js";
import type { SearchQueryContext } from "@offbeat/shared";

function normalizeName(name?: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export class AlternativesCandidateGenerator {
  constructor(
    private placesRepo: PlaceRepository = placeRepository,
    private serpApi: SerpApiService = serpApiService,
  ) {}

  /**
   * Deterministically generates candidates before AI reasoning.
   * Merges internal canonical places and external SerpApi results,
   * strictly excluding the original place and filtering duplicates.
   */
  async generateCandidates(
    originalPlace: PlaceWithDetails,
    query: CandidateGenerationQuery,
    options?: { requestId?: string },
  ): Promise<RawCandidatePlace[]> {
    const requestId = options?.requestId;
    const candidates: RawCandidatePlace[] = [];
    const seenNames = new Set<string>();

    const normalizedOriginalName = normalizeName(originalPlace.name);
    const originalId = originalPlace.id;
    const originalSlug = originalPlace.slug?.toLowerCase();

    const isOriginalPlace = (candName: string, candId?: string, candSlug?: string): boolean => {
      if (candId && candId === originalId) return true;
      if (candSlug && originalSlug && candSlug.toLowerCase() === originalSlug) return true;
      const norm = normalizeName(candName);
      if (norm === normalizedOriginalName) return true;
      // Exclude naming variants like "Tiger Hill Sunrise Point", "Tiger Hill Viewpoint", "Tiger Hill, Darjeeling"
      if (norm.includes(normalizedOriginalName) || normalizedOriginalName.includes(norm)) {
        return true;
      }
      return false;
    };

    // 1. Fetch Internal Places from same destination and region
    try {
      const destinationId = originalPlace.destinationId;
      const regionId = originalPlace.destination?.regionId;

      const [destPlaces, regionPlaces] = await Promise.all([
        destinationId ? this.placesRepo.findPlacesByDestination(destinationId) : Promise.resolve([]),
        regionId ? this.placesRepo.findPlacesByRegion(regionId) : Promise.resolve([]),
      ]);

      const allInternal = [...destPlaces, ...regionPlaces];

      for (const p of allInternal) {
        if (isOriginalPlace(p.name, p.id, p.slug)) continue;

        const norm = normalizeName(p.name);
        if (seenNames.has(norm)) continue;
        seenNames.add(norm);

        candidates.push({
          id: p.id,
          name: p.name,
          slug: p.slug,
          destination: p.destination?.name,
          regionId: p.destination?.regionId,
          categories: p.categories.map((c) => c.category.name),
          description: p.description,
          location: { lat: p.latitude, lng: p.longitude },
          address: p.address,
          imageUrl: p.imageUrl,
          source: "INTERNAL",
        });
      }
    } catch (err) {
      logger.warn(
        "Failed to retrieve internal places for alternative generation",
        requestId,
        {},
        err as Error,
      );
    }

    // 2. Fetch External Candidates from SerpApi (Google Maps engine)
    try {
      const primaryCategory = originalPlace.categories[0]?.category.name || "Scenic point";
      const destinationName = originalPlace.destination?.name || query.destination || "";
      const regionName = query.region || "India";

      let externalSearchQuery = "";
      switch (query.mode) {
        case "ENHANCEMENT":
          externalSearchQuery = `places to visit near ${originalPlace.name}, ${destinationName}`;
          break;
        case "COMPLEMENTARY":
          externalSearchQuery = `heritage culture activities in ${destinationName}, ${regionName}`;
          break;
        case "NEARBY_DISCOVERY":
          externalSearchQuery = `hidden spots scenic points near ${originalPlace.name}, ${destinationName}`;
          break;
        case "LOWER_CROWD":
          externalSearchQuery = `peaceful quiet scenic places in ${destinationName}, ${regionName}`;
          break;
        case "TIMING_ALTERNATIVE":
          externalSearchQuery = `${primaryCategory} in ${destinationName}, ${regionName}`;
          break;
        case "REPLACEMENT":
        default:
          externalSearchQuery = `${primaryCategory} places in ${destinationName}, ${regionName}`;
          break;
      }

      const searchContext: SearchQueryContext = {
        country: query.country || "India",
        region: regionName,
        destination: destinationName,
        travelTaste: query.travelTaste.length ? query.travelTaste : [primaryCategory],
        experienceTaste: query.experienceTaste,
        dayNight: query.dayNight,
      };

      const externalResults = await this.serpApi.searchPlaces(searchContext, { requestId });

      for (const ext of externalResults) {
        if (!ext.name || ext.latitude === null || ext.longitude === null) continue;
        if (isOriginalPlace(ext.name, ext.externalId)) continue;

        const norm = normalizeName(ext.name);
        if (seenNames.has(norm)) continue;
        seenNames.add(norm);

        candidates.push({
          externalId: ext.externalId || `ext_${Math.random().toString(36).substring(2, 9)}`,
          name: ext.name,
          destination: destinationName || ext.address?.split(",")[0] || "Regional Discovery",
          categories: ext.categories?.length ? ext.categories : [primaryCategory],
          description: ext.description || `${ext.categories?.[0] || "Attraction"} in ${destinationName}`,
          location: {
            lat: ext.latitude ?? 0,
            lng: ext.longitude ?? 0,
          },
          address: ext.address,
          imageUrl: ext.thumbnailUrl,
          rating: ext.rating,
          userRatingsTotal: ext.reviewCount,
          source: "EXTERNAL",
          operatingHours: ext.openingHours,
        });
      }
    } catch (extErr) {
      // SerpApi lookup is non-blocking enhancement
      logger.info(
        "SerpApi candidate retrieval unavailable or skipped; proceeding with internal candidate set",
        requestId,
        { error: (extErr as Error)?.message },
      );
    }

    return candidates;
  }
}

export const alternativesCandidateGenerator = new AlternativesCandidateGenerator();
