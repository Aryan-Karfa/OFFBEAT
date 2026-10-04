import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { placeRepository } from "../../src/modules/places/places.repository.js";
import { DestinationStatus, PlaceStatus } from "@prisma/client";
import type { PlaceWithDetails } from "../../src/modules/places/places.types.js";

describe("Places API Integration Tests", () => {
  const app = createApp();

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

  describe("GET /api/v1/places/:placeId", () => {
    it("should return 200 with canonical internal Place shape", async () => {
      vi.spyOn(placeRepository, "findPlaceByIdOrSlug").mockResolvedValueOnce(mockPlaceWithDetails);

      const res = await request(app).get("/api/v1/places/place_tiger_hill");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("place_tiger_hill");
      expect(res.body.data.name).toBe("Tiger Hill");
      expect(res.body.data.destination).toBe("Darjeeling");
      expect(res.body.data.categories).toEqual(["Mountain", "Sunrise", "Photography"]);
      expect(res.body.data.location).toEqual({
        lat: 27.012,
        lng: 88.261,
      });
      expect(res.body.data.status).toBe("ACTIVE");
      expect(res.body.meta.requestId).toBeDefined();

      // Community and Phase 10 intelligence fields
      if (res.body.data.community) {
        expect(res.body.data.community.submissionCount).toBeGreaterThanOrEqual(1);
      }
      expect(res.body.data.timeIntelligence).toBeDefined();
      expect(res.body.data.crowdIntelligence).toBeDefined();
      expect(res.body.data.confidence).toBeUndefined();
    });

    it("should return 404 for valid identifier when place does not exist", async () => {
      vi.spyOn(placeRepository, "findPlaceByIdOrSlug").mockResolvedValueOnce(null);

      const res = await request(app).get("/api/v1/places/non-existent-place");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should return 400 VALIDATION_ERROR for invalid placeId format", async () => {
      const res = await request(app).get("/api/v1/places/@invalid!place#");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.meta.requestId).toBeDefined();
    });
  });

  describe("GET /api/v1/places/categories", () => {
    it("should return 200 with database-backed categories", async () => {
      vi.spyOn(placeRepository, "findAllCategories").mockResolvedValueOnce([
        {
          id: "cat_mountain",
          name: "Mountain",
          slug: "mountain",
          description: "High altitude peaks.",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
        {
          id: "cat_beach",
          name: "Beach",
          slug: "beach",
          description: "Coastal areas.",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      ]);

      const res = await request(app).get("/api/v1/places/categories");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].slug).toBe("mountain");
      expect(res.body.data[1].slug).toBe("beach");
      expect(res.body.meta.requestId).toBeDefined();
    });
  });
});
