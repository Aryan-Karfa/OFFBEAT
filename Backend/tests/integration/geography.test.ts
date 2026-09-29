import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { geographyRepository } from "../../src/modules/geography/geography.repository.js";
import { RegionType, DestinationStatus } from "@prisma/client";

describe("Geography API Integration Tests", () => {
  const app = createApp();

  const mockCountry = {
    id: "country_in",
    name: "India",
    code: "IND",
    slug: "india",
    geometry: { type: "Country", code: "IND" },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  const mockRegion = {
    id: "IN-WB",
    countryId: "country_in",
    name: "West Bengal",
    code: "WB",
    type: RegionType.STATE,
    slug: "west-bengal",
    description: "Cultural capital and Himalayan gateway.",
    geometry: { type: "Polygon" },
    centroid: { lat: 22.9868, lng: 87.855 },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  const mockDestination = {
    id: "dest_darjeeling",
    regionId: "IN-WB",
    name: "Darjeeling",
    slug: "darjeeling",
    description: "Queen of the Hills.",
    coordinates: { lat: 27.036, lng: 88.2627 },
    imageUrl: null,
    status: DestinationStatus.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  describe("GET /api/v1/countries", () => {
    it("should return 200 with standard envelope and countries list", async () => {
      vi.spyOn(geographyRepository, "findAllCountries").mockResolvedValueOnce([mockCountry]);

      const res = await request(app).get("/api/v1/countries");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].id).toBe("country_in");
      expect(res.body.data[0].code).toBe("IND");
      expect(res.body.meta.requestId).toBeDefined();
    });
  });

  describe("GET /api/v1/countries/:countryId", () => {
    it("should return 200 with country details and regions", async () => {
      vi.spyOn(geographyRepository, "findCountryWithRegions").mockResolvedValueOnce({
        ...mockCountry,
        regions: [mockRegion],
      });

      const res = await request(app).get("/api/v1/countries/country_in");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("country_in");
      expect(res.body.data.regions).toHaveLength(1);
      expect(res.body.data.regions[0].id).toBe("IN-WB");
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should return 404 for valid identifier format when country does not exist", async () => {
      vi.spyOn(geographyRepository, "findCountryWithRegions").mockResolvedValueOnce(null);

      const res = await request(app).get("/api/v1/countries/non-existent-country");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should return 400 VALIDATION_ERROR for invalid route parameter characters", async () => {
      const res = await request(app).get("/api/v1/countries/@invalid!country#");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.meta.requestId).toBeDefined();
    });
  });

  describe("GET /api/v1/countries/:countryId/regions", () => {
    it("should return 200 with region list for specified country", async () => {
      vi.spyOn(geographyRepository, "findRegionsByCountryIdOrSlug").mockResolvedValueOnce([
        mockRegion,
      ]);

      const res = await request(app).get("/api/v1/countries/country_in/regions");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe("IN-WB");
      expect(res.body.data[0].centroid.lat).toBe(22.9868);
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should return 404 when country does not exist", async () => {
      vi.spyOn(geographyRepository, "findRegionsByCountryIdOrSlug").mockResolvedValueOnce(null);

      const res = await request(app).get("/api/v1/countries/unknown-country/regions");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /api/v1/regions/:regionId", () => {
    it("should return 200 with region details", async () => {
      vi.spyOn(geographyRepository, "findRegionByIdOrSlug").mockResolvedValueOnce(mockRegion);

      const res = await request(app).get("/api/v1/regions/IN-WB");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("IN-WB");
      expect(res.body.data.name).toBe("West Bengal");
      expect(res.body.data.description).toBe("Cultural capital and Himalayan gateway.");
      expect(res.body.data.centroid.lat).toBe(22.9868);
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should return 404 when region does not exist", async () => {
      vi.spyOn(geographyRepository, "findRegionByIdOrSlug").mockResolvedValueOnce(null);

      const res = await request(app).get("/api/v1/regions/non-existent-region");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 400 for malformed region parameter format", async () => {
      const res = await request(app).get("/api/v1/regions/invalid%20param!*");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/v1/regions/:regionId/destinations", () => {
    it("should return 200 with destination list when region has destinations", async () => {
      vi.spyOn(geographyRepository, "findDestinationsByRegion").mockResolvedValueOnce([
        mockDestination,
      ]);

      const res = await request(app).get("/api/v1/regions/IN-WB/destinations");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe("dest_darjeeling");
      expect(res.body.data[0].name).toBe("Darjeeling");
      expect(res.body.data[0].status).toBe("ACTIVE");
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should return 200 with empty array when region has no destinations (not an error)", async () => {
      vi.spyOn(geographyRepository, "findDestinationsByRegion").mockResolvedValueOnce([]);

      const res = await request(app).get("/api/v1/regions/IN-SK/destinations");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should return 404 when region does not exist", async () => {
      vi.spyOn(geographyRepository, "findDestinationsByRegion").mockResolvedValueOnce(null);

      const res = await request(app).get("/api/v1/regions/unknown-region/destinations");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
