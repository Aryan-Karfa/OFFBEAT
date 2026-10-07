import { describe, it, expect, vi } from "vitest";
import { TakeHomeCandidateCollector } from "../../src/modules/take-home/take-home.candidate-collector.js";
import type { PlaceRepository } from "../../src/modules/places/places.repository.js";
import type { CommunityService } from "../../src/modules/community/community.service.js";
import type { SerpApiService } from "../../src/integrations/serpapi/serpapi.service.js";
import type { PlaceWithDetails } from "../../src/modules/places/places.types.js";
import { DestinationStatus, PlaceStatus } from "@prisma/client";

describe("Phase 14: TakeHomeCandidateCollector Unit Tests", () => {
  const mockPlace: PlaceWithDetails = {
    id: "place_tiger_hill",
    name: "Tiger Hill",
    slug: "tiger-hill",
    destinationId: "dest_darjeeling",
    description: "Sunrise summit",
    latitude: 27.012,
    longitude: 88.261,
    address: "Senchal Forest, Darjeeling",
    website: null,
    phone: null,
    imageUrl: null,
    status: PlaceStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    destination: {
      id: "dest_darjeeling",
      regionId: "IN-WB",
      name: "Darjeeling",
      slug: "darjeeling",
      description: null,
      coordinates: null,
      imageUrl: null,
      status: DestinationStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    categories: [],
  };

  const mockPlacesRepo = {
    findPlaceByIdOrSlug: vi.fn(async (id: string) => {
      if (id === "place_tiger_hill") return mockPlace;
      return null;
    }),
  } as unknown as PlaceRepository;

  const mockCommunitySvc = {
    listSubmissions: vi.fn(async () => ({
      items: [
        {
          id: "sub_tea",
          userId: "user_1",
          author: { id: "user_1", username: "tea_lover", displayName: "Tea Lover" },
          type: "LOCAL_SPECIALTY",
          title: "Darjeeling First Flush Tea Selection",
          content: "Always check Chowrasta boutiques for authentic first flush harvest.",
          status: "APPROVED",
          createdAt: new Date(),
          updatedAt: new Date(),
          evidence: [{ id: "ev_1", type: "PHOTO", mediaUrl: "https://example.com/tea.jpg" }],
          support: { count: 6, usefulCount: 4, confirmCount: 2, agreeCount: 0 },
          verification: {
            status: "COMMUNITY_VERIFIED",
            strength: "HIGH",
            score: 0.92,
            supportedCount: 6,
            externalCorroborated: true,
          },
        },
      ],
      pagination: { page: 1, limit: 30, total: 1, totalPages: 1, hasMore: false },
    })),
  } as unknown as CommunityService;

  const mockSerpApi = {
    searchPlaces: vi.fn(async () => [
      {
        provider: "google_maps",
        externalId: "ext_serp_tea_shop",
        name: "Himalayan Tea Emporium",
        address: "The Mall, Darjeeling",
        latitude: 27.045,
        longitude: 88.267,
        rating: 4.7,
        reviewCount: 210,
        categories: ["tea store"],
      },
    ]),
  } as unknown as SerpApiService;

  it("resolves destination correctly from destination ID, slug, and name", async () => {
    const collector = new TakeHomeCandidateCollector(mockPlacesRepo, mockCommunitySvc, mockSerpApi);

    const byId = await collector.resolveDestination("dest_darjeeling");
    expect(byId.id).toBe("dest_darjeeling");
    expect(byId.name).toBe("Darjeeling");

    const bySlug = await collector.resolveDestination("darjeeling");
    expect(bySlug.id).toBe("dest_darjeeling");
    expect(bySlug.name).toBe("Darjeeling");

    const byName = await collector.resolveDestination("Darjeeling");
    expect(byName.id).toBe("dest_darjeeling");
    expect(byName.name).toBe("Darjeeling");
  });

  it("resolves destination context from place ID entry point", async () => {
    const collector = new TakeHomeCandidateCollector(mockPlacesRepo, mockCommunitySvc, mockSerpApi);

    const resolved = await collector.resolveDestination(undefined, "place_tiger_hill");
    expect(resolved.id).toBe("dest_darjeeling");
    expect(resolved.name).toBe("Darjeeling");
    expect(resolved.place?.name).toBe("Tiger Hill");
  });

  it("collects canonical items and enriches with community intelligence", async () => {
    const collector = new TakeHomeCandidateCollector(mockPlacesRepo, mockCommunitySvc, mockSerpApi);

    const candidates = await collector.collectCandidates(
      { id: "dest_darjeeling", name: "Darjeeling", regionId: "IN-WB" },
      {},
    );

    expect(candidates.length).toBeGreaterThan(0);
    const teaCandidate = candidates.find((c) => c.id === "item_darjeeling_tea");
    expect(teaCandidate).toBeDefined();
    expect(teaCandidate?.localRelevance).toBe("SIGNATURE");

    // Verified community signals were enriched
    expect(teaCandidate?.community).toBeDefined();
    expect(teaCandidate?.community?.status).toBe("COMMUNITY_VERIFIED");
  });

  it("gracefully resolves external places-to-find using SerpApi", async () => {
    const collector = new TakeHomeCandidateCollector(mockPlacesRepo, mockCommunitySvc, mockSerpApi);

    const candidates = await collector.collectCandidates(
      { id: "dest_darjeeling", name: "Darjeeling", regionId: "IN-WB" },
      {},
    );

    expect(candidates.length).toBeGreaterThan(0);
    // Verified sources exist and have internal or serpapi provenance
    const sources = candidates[0]?.placesToFind || [];
    expect(sources.length).toBeGreaterThan(0);
    expect(["INTERNAL", "SERPAPI"]).toContain(sources[0]?.source);
  });
});
