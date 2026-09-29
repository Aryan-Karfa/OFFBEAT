import { describe, it, expect, vi, beforeEach } from "vitest";
import { PlaceService } from "../../src/modules/places/places.service.js";
import { PlaceRepository } from "../../src/modules/places/places.repository.js";
import { NotFoundError } from "../../src/lib/errors/AppError.js";
import { DestinationStatus, PlaceStatus } from "@prisma/client";
import type { PlaceWithDetails } from "../../src/modules/places/places.types.js";

describe("PlaceService Unit Tests", () => {
  let repo: PlaceRepository;
  let service: PlaceService;

  const mockPlaceWithDetails: PlaceWithDetails = {
    id: "place_tiger_hill",
    destinationId: "dest_darjeeling",
    name: "Tiger Hill",
    slug: "tiger-hill",
    description: "Renowned summit in Darjeeling.",
    latitude: 27.012,
    longitude: 88.261,
    address: "Senchal Forest, Darjeeling, West Bengal",
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
      description: "Colonial tea capital.",
      coordinates: { lat: 27.036, lng: 88.2627 },
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
          description: "High altitude peaks.",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      },
      {
        id: "rel_2",
        placeId: "place_tiger_hill",
        categoryId: "cat_sunrise",
        createdAt: new Date("2026-01-01"),
        category: {
          id: "cat_sunrise",
          name: "Sunrise",
          slug: "sunrise",
          description: "Early morning viewpoints.",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      },
      {
        id: "rel_3",
        placeId: "place_tiger_hill",
        categoryId: "cat_photography",
        createdAt: new Date("2026-01-01"),
        category: {
          id: "cat_photography",
          name: "Photography",
          slug: "photography",
          description: "Vantage points.",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      },
    ],
  };

  beforeEach(() => {
    repo = new PlaceRepository();
    service = new PlaceService(repo);
  });

  it("getPlaceById should return canonical product-oriented PlaceDetailDto", async () => {
    vi.spyOn(repo, "findPlaceByIdOrSlug").mockResolvedValueOnce(mockPlaceWithDetails);

    const result = await service.getPlaceById("place_tiger_hill");

    expect(result.id).toBe("place_tiger_hill");
    expect(result.name).toBe("Tiger Hill");
    expect(result.slug).toBe("tiger-hill");
    expect(result.destination).toBe("Darjeeling");
    expect(result.categories).toEqual(["Mountain", "Sunrise", "Photography"]);
    expect(result.location).toEqual({ lat: 27.012, lng: 88.261 });
    expect(result.description).toBe("Renowned summit in Darjeeling.");
    expect(result.status).toBe("ACTIVE");
  });

  it("getPlaceById should throw NotFoundError for non-existent place", async () => {
    vi.spyOn(repo, "findPlaceByIdOrSlug").mockResolvedValueOnce(null);

    await expect(service.getPlaceById("unknown-place")).rejects.toThrow(NotFoundError);
  });

  it("getCategories should return mapped categories", async () => {
    vi.spyOn(repo, "findAllCategories").mockResolvedValueOnce([
      {
        id: "cat_beach",
        name: "Beach",
        slug: "beach",
        description: "Coastal retreats.",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ]);

    const result = await service.getCategories();

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Beach");
    expect(result[0]!.slug).toBe("beach");
  });
});
