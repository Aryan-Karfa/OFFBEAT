import { describe, it, expect } from "vitest";
import { CandidateMerger } from "../../src/modules/discovery/discovery.merger.js";
import { DestinationStatus, PlaceStatus } from "@prisma/client";
import type { PlaceWithDetails } from "../../src/modules/places/places.types.js";
import type { NormalizedExternalPlace } from "@offbeat/shared";

describe("CandidateMerger Unit Tests", () => {
  const internalPlace: PlaceWithDetails = {
    id: "place_tiger_hill",
    destinationId: "dest_darjeeling",
    name: "Tiger Hill",
    slug: "tiger-hill",
    description: "Famous summit view.",
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

  const matchingExternalPlace: NormalizedExternalPlace = {
    provider: "SERPAPI",
    externalId: "ext_th_123",
    placeId: "ChIJ_tiger_hill",
    name: "Tiger Hill, Darjeeling",
    description: "Observation deck with panoramic views of Mt. Kanchenjunga.",
    address: "Darjeeling, West Bengal 734102",
    latitude: 27.0125,
    longitude: 88.2612,
    categories: ["Tourist attraction", "Scenic viewpoint"],
    rating: 4.8,
    reviewCount: 3200,
    openingHours: ["Open 24 hours"],
    thumbnailUrl: "https://example.com/tiger-hill-serpapi.jpg",
    sourceUrl: "https://maps.google.com/?cid=123",
  };

  const newExternalPlace: NormalizedExternalPlace = {
    provider: "SERPAPI",
    externalId: "ext_sandakphu_456",
    placeId: "ChIJ_sandakphu",
    name: "Sandakphu Peak",
    description: "Highest peak in West Bengal along Singalila Ridge.",
    address: "Singalila National Park, West Bengal",
    latitude: 27.105,
    longitude: 88.001,
    categories: ["Hiking area", "Mountain peak"],
    rating: 4.9,
    reviewCount: 1540,
    thumbnailUrl: "https://example.com/sandakphu.jpg",
  };

  it("should merge matching external place into canonical internal place with COMBINED source", () => {
    const merged = CandidateMerger.merge([internalPlace], [matchingExternalPlace], {
      regionName: "West Bengal",
      defaultDestination: "Darjeeling",
    });

    expect(merged).toHaveLength(1);
    const candidate = merged[0]!;

    expect(candidate.id).toBe("place_tiger_hill"); // Preserves canonical internal ID
    expect(candidate.name).toBe("Tiger Hill"); // Canonical internal name
    expect(candidate.source).toBe("COMBINED");
    expect(candidate.provider).toBe("COMBINED");
    expect(candidate.rating).toBe(4.8); // Enriched from external
    expect(candidate.reviewCount).toBe(3200);
    expect(candidate.imageUrl).toBe("https://example.com/tiger-hill-serpapi.jpg");
    expect(candidate.openingHours).toEqual(["Open 24 hours"]);
    expect(candidate.categories).toContain("Mountain");
    expect(candidate.categories).toContain("Tourist attraction");
  });

  it("should preserve non-matching external places as EXTERNAL candidates", () => {
    const merged = CandidateMerger.merge([internalPlace], [newExternalPlace], {
      regionName: "West Bengal",
      defaultDestination: "Darjeeling",
    });

    expect(merged).toHaveLength(2);

    const internalCandidate = merged.find((c) => c.id === "place_tiger_hill")!;
    const externalCandidate = merged.find((c) => c.name === "Sandakphu Peak")!;

    expect(internalCandidate.source).toBe("INTERNAL");
    expect(externalCandidate.source).toBe("EXTERNAL");
    expect(externalCandidate.provider).toBe("SERPAPI");
    expect(externalCandidate.rating).toBe(4.9);
  });

  it("should deduplicate duplicate external entries", () => {
    const duplicateExternal = { ...newExternalPlace, externalId: "ext_sandakphu_dup" };

    const merged = CandidateMerger.merge([], [newExternalPlace, duplicateExternal], {
      regionName: "West Bengal",
    });

    expect(merged).toHaveLength(1);
  });
});
