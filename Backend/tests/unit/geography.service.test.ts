import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeographyService } from "../../src/modules/geography/geography.service.js";
import { GeographyRepository } from "../../src/modules/geography/geography.repository.js";
import { NotFoundError } from "../../src/lib/errors/AppError.js";
import { RegionType, DestinationStatus } from "@prisma/client";

describe("GeographyService Unit Tests", () => {
  let repo: GeographyRepository;
  let service: GeographyService;

  const mockCountry = {
    id: "country_in",
    name: "India",
    code: "IND",
    slug: "india",
    geometry: { type: "Country" },
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
    description: "Cultural and geographic gateway to Eastern India.",
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
    description: "Himalayan tea ridges.",
    coordinates: { lat: 27.036, lng: 88.2627 },
    imageUrl: null,
    status: DestinationStatus.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  beforeEach(() => {
    repo = new GeographyRepository();
    service = new GeographyService(repo);
  });

  it("getCountries should return mapped CountryDto list", async () => {
    vi.spyOn(repo, "findAllCountries").mockResolvedValueOnce([mockCountry]);

    const result = await service.getCountries();

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("country_in");
    expect(result[0]!.name).toBe("India");
    expect(result[0]!.code).toBe("IND");
    expect(result[0]!.slug).toBe("india");
  });

  it("getCountryById should return CountryWithRegionsDto when found", async () => {
    vi.spyOn(repo, "findCountryWithRegions").mockResolvedValueOnce({
      ...mockCountry,
      regions: [mockRegion],
    });

    const result = await service.getCountryById("country_in");

    expect(result.id).toBe("country_in");
    expect(result.regions).toHaveLength(1);
    expect(result.regions[0]!.id).toBe("IN-WB");
    expect(result.regions[0]!.name).toBe("West Bengal");
    expect(result.regions[0]!.centroid.lat).toBe(22.9868);
  });

  it("getCountryById should throw NotFoundError when country does not exist", async () => {
    vi.spyOn(repo, "findCountryWithRegions").mockResolvedValueOnce(null);

    await expect(service.getCountryById("non-existent")).rejects.toThrow(NotFoundError);
  });

  it("getCountryRegions should return RegionSummaryDto list for valid country", async () => {
    vi.spyOn(repo, "findRegionsByCountryIdOrSlug").mockResolvedValueOnce([mockRegion]);

    const result = await service.getCountryRegions("india");

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("IN-WB");
    expect(result[0]!.type).toBe("STATE");
    expect(result[0]!.centroid).toEqual({ lat: 22.9868, lng: 87.855 });
  });

  it("getCountryRegions should throw NotFoundError when country not found", async () => {
    vi.spyOn(repo, "findRegionsByCountryIdOrSlug").mockResolvedValueOnce(null);

    await expect(service.getCountryRegions("unknown")).rejects.toThrow(NotFoundError);
  });

  it("getRegionById should return RegionDetailDto with description and centroid", async () => {
    vi.spyOn(repo, "findRegionByIdOrSlug").mockResolvedValueOnce(mockRegion);

    const result = await service.getRegionById("IN-WB");

    expect(result.id).toBe("IN-WB");
    expect(result.name).toBe("West Bengal");
    expect(result.slug).toBe("west-bengal");
    expect(result.description).toBe("Cultural and geographic gateway to Eastern India.");
    expect(result.centroid.lat).toBe(22.9868);
  });

  it("getRegionById should throw NotFoundError when region not found", async () => {
    vi.spyOn(repo, "findRegionByIdOrSlug").mockResolvedValueOnce(null);

    await expect(service.getRegionById("unknown-region")).rejects.toThrow(NotFoundError);
  });

  it("getRegionDestinations should return destination summaries when destinations exist", async () => {
    vi.spyOn(repo, "findDestinationsByRegion").mockResolvedValueOnce([mockDestination]);

    const result = await service.getRegionDestinations("IN-WB");

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("dest_darjeeling");
    expect(result[0]!.name).toBe("Darjeeling");
    expect(result[0]!.coordinates?.lat).toBe(27.036);
  });

  it("getRegionDestinations should return empty array when region has no destinations", async () => {
    vi.spyOn(repo, "findDestinationsByRegion").mockResolvedValueOnce([]);

    const result = await service.getRegionDestinations("IN-SK");

    expect(result).toEqual([]);
  });

  it("getRegionDestinations should throw NotFoundError when region does not exist", async () => {
    vi.spyOn(repo, "findDestinationsByRegion").mockResolvedValueOnce(null);

    await expect(service.getRegionDestinations("invalid-region")).rejects.toThrow(NotFoundError);
  });
});
