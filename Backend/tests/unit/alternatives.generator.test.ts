import { describe, it, expect, vi } from "vitest";
import { AlternativesCandidateGenerator } from "../../src/modules/alternatives/alternatives.generator.js";
import type { PlaceWithDetails } from "../../src/modules/places/places.types.js";
import type { CandidateGenerationQuery } from "../../src/modules/alternatives/alternatives.types.js";
import type { PlaceRepository } from "../../src/modules/places/places.repository.js";
import type { SerpApiService } from "../../src/integrations/serpapi/serpapi.service.js";
import { DestinationStatus, PlaceStatus } from "@prisma/client";

describe("Phase 12: AlternativesCandidateGenerator Unit Tests", () => {
  const sampleOriginalPlace: PlaceWithDetails = {
    id: "place_tiger_hill",
    name: "Tiger Hill",
    slug: "tiger-hill",
    destinationId: "dest_darjeeling",
    description: "Iconic sunrise viewpoint in Darjeeling",
    latitude: 27.012,
    longitude: 88.261,
    address: "Senchal Forest, Darjeeling",
    website: null,
    phone: null,
    imageUrl: null,
    status: PlaceStatus.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    destination: {
      id: "dest_darjeeling",
      regionId: "IN-WB",
      name: "Darjeeling",
      slug: "darjeeling",
      description: null,
      coordinates: null,
      imageUrl: null,
      status: DestinationStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
    categories: [
      {
        id: "rel_1",
        placeId: "place_tiger_hill",
        categoryId: "cat_mountain",
        createdAt: new Date("2026-01-01"),
        category: {
          id: "cat_mountain",
          name: "Mountain",
          slug: "mountain",
          description: null,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      },
    ],
  };

  const sampleSiblingPlace: PlaceWithDetails = {
    id: "place_batasia_loop",
    name: "Batasia Loop",
    slug: "batasia-loop",
    destinationId: "dest_darjeeling",
    description: "Darjeeling Himalayan Railway spiral viewpoint",
    latitude: 27.0168,
    longitude: 88.2464,
    address: "Ghum, Darjeeling",
    website: null,
    phone: null,
    imageUrl: null,
    status: PlaceStatus.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    destination: sampleOriginalPlace.destination,
    categories: [
      {
        id: "rel_2",
        placeId: "place_batasia_loop",
        categoryId: "cat_mountain",
        createdAt: new Date("2026-01-01"),
        category: {
          id: "cat_mountain",
          name: "Mountain",
          slug: "mountain",
          description: null,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      },
    ],
  };

  const sampleQuery: CandidateGenerationQuery = {
    mode: "REPLACEMENT",
    country: "India",
    region: "IN-WB",
    destination: "Darjeeling",
    travelTaste: ["mountain"],
    experienceTaste: ["sunrise"],
    dayNight: "DAY",
    limit: 5,
  };

  it("generates candidates from internal repository and excludes the original place", async () => {
    const mockRepo = {
      findPlacesByDestination: vi.fn().mockResolvedValue([sampleOriginalPlace, sampleSiblingPlace]),
      findPlacesByRegion: vi.fn().mockResolvedValue([sampleOriginalPlace, sampleSiblingPlace]),
      findPlaceByIdOrSlug: vi.fn(),
      findAllCategories: vi.fn(),
    };

    const mockSerpApi = {
      searchPlaces: vi.fn().mockResolvedValue([]),
    } as unknown as SerpApiService;

    const generator = new AlternativesCandidateGenerator(
      mockRepo as unknown as PlaceRepository,
      mockSerpApi,
    );
    const candidates = await generator.generateCandidates(sampleOriginalPlace, sampleQuery);

    expect(candidates.length).toBe(1);
    expect(candidates[0]?.id).toBe("place_batasia_loop");
    expect(candidates.some((c) => c.id === "place_tiger_hill")).toBe(false);
  });

  it("filters out duplicates and places with matching normalized names", async () => {
    const mockRepo = {
      findPlacesByDestination: vi.fn().mockResolvedValue([
        sampleSiblingPlace,
        // Duplicate with slightly varied name
        { ...sampleSiblingPlace, id: "place_batasia_loop_dup", name: "Batasia Loop" },
      ]),
      findPlacesByRegion: vi.fn().mockResolvedValue([]),
      findPlaceByIdOrSlug: vi.fn(),
      findAllCategories: vi.fn(),
    };

    const mockSerpApi = {
      searchPlaces: vi.fn().mockResolvedValue([
        // External duplicate of original place
        {
          name: "Tiger Hill Sunrise Point",
          externalId: "ext_tiger_hill",
          latitude: 27.012,
          longitude: 88.261,
        },
        // Valid external candidate
        {
          name: "Sandakphu Ridge",
          externalId: "ext_sandakphu",
          latitude: 27.105,
          longitude: 88.002,
          categories: ["Mountain Viewpoint"],
        },
      ]),
    } as unknown as SerpApiService;

    const generator = new AlternativesCandidateGenerator(
      mockRepo as unknown as PlaceRepository,
      mockSerpApi,
    );
    const candidates = await generator.generateCandidates(sampleOriginalPlace, sampleQuery);

    // Original place should be excluded (both internal and external variant)
    expect(candidates.some((c) => c.name.toLowerCase().includes("tiger hill"))).toBe(false);

    // Duplicate Batasia Loop should be deduplicated
    const batasiaMatches = candidates.filter((c) => c.name === "Batasia Loop");
    expect(batasiaMatches.length).toBe(1);

    // Sandakphu Ridge should be present
    expect(candidates.some((c) => c.name === "Sandakphu Ridge")).toBe(true);
  });

  it("gracefully continues when SerpApi search fails or is unavailable", async () => {
    const mockRepo = {
      findPlacesByDestination: vi.fn().mockResolvedValue([sampleSiblingPlace]),
      findPlacesByRegion: vi.fn().mockResolvedValue([]),
      findPlaceByIdOrSlug: vi.fn(),
      findAllCategories: vi.fn(),
    };

    const mockSerpApi = {
      searchPlaces: vi.fn().mockRejectedValue(new Error("SerpApi 503 Service Unavailable")),
    } as unknown as SerpApiService;

    const generator = new AlternativesCandidateGenerator(
      mockRepo as unknown as PlaceRepository,
      mockSerpApi,
    );
    const candidates = await generator.generateCandidates(sampleOriginalPlace, sampleQuery);

    expect(candidates.length).toBe(1);
    expect(candidates[0]?.id).toBe("place_batasia_loop");
  });
});
