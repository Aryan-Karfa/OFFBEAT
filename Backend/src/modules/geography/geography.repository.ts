import { prisma, isDatabaseConnected } from "../../lib/db/prisma.js";
import type { Country, Region, Destination } from "@prisma/client";
import { RegionType, DestinationStatus } from "@prisma/client";
import type { CountryWithRegions, RegionWithDestinations } from "./geography.types.js";
import { SEED_DESTINATIONS } from "./geography.seed-data.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory canonical cache for development when PostgreSQL is not running
let cachedCountries: Country[] | null = null;
let cachedRegions: Region[] | null = null;
let cachedDestinations: Destination[] | null = null;

function loadFallbackData() {
  if (cachedCountries && cachedRegions && cachedDestinations) {
    return {
      countries: cachedCountries,
      regions: cachedRegions,
      destinations: cachedDestinations,
    };
  }

  const india: Country = {
    id: "country_in",
    name: "India",
    code: "IND",
    slug: "india",
    geometry: { type: "Country", code: "IND", name: "India" },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  cachedCountries = [india];

  // Try locating india-administrative.json
  const candidatePaths = [
    path.resolve(
      __dirname,
      "../../../../Frontend/src/features/geography/data/india-administrative.json",
    ),
    path.resolve(process.cwd(), "Frontend/src/features/geography/data/india-administrative.json"),
  ];

  let rawRegions: Array<{
    id: string;
    name: string;
    code: string;
    slug: string;
    type: string;
    coordinates: { lat: number; lng: number };
    geometry: unknown;
  }> = [];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
      rawRegions = parsed.regions || [];
      break;
    }
  }

  cachedRegions = rawRegions.map((r) => ({
    id: r.id,
    countryId: india.id,
    name: r.name,
    code: r.code,
    type: r.type === "UNION_TERRITORY" ? RegionType.UNION_TERRITORY : RegionType.STATE,
    slug: r.slug,
    description: `Authentic offbeat journeys and regional heritage across ${r.name}.`,
    geometry: r.geometry as object,
    centroid: { lat: r.coordinates.lat, lng: r.coordinates.lng },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  }));

  cachedDestinations = SEED_DESTINATIONS.map((d) => ({
    id: d.id,
    regionId: d.regionId,
    name: d.name,
    slug: d.slug,
    description: d.description,
    coordinates: d.coordinates,
    imageUrl: null,
    status: DestinationStatus.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  }));

  return {
    countries: cachedCountries,
    regions: cachedRegions,
    destinations: cachedDestinations,
  };
}

export class GeographyRepository {
  async findAllCountries(): Promise<Country[]> {
    if (isDatabaseConnected()) {
      try {
        return await prisma.country.findMany({
          orderBy: { name: "asc" },
        });
      } catch {
        // Fall back gracefully to canonical domain data
      }
    }
    const { countries } = loadFallbackData();
    return countries;
  }

  async findCountryByIdOrSlug(identifier: string): Promise<Country | null> {
    const normalized = identifier.trim();
    if (isDatabaseConnected()) {
      try {
        const found = await prisma.country.findFirst({
          where: {
            OR: [
              { id: normalized },
              { slug: normalized.toLowerCase() },
              { code: normalized.toUpperCase() },
            ],
          },
        });
        if (found) return found;
      } catch {
        // Fall back gracefully
      }
    }

    const { countries } = loadFallbackData();
    const lower = normalized.toLowerCase();
    const upper = normalized.toUpperCase();
    return (
      countries.find(
        (c) =>
          c.id === normalized || c.slug.toLowerCase() === lower || c.code.toUpperCase() === upper,
      ) ?? null
    );
  }

  async findCountryWithRegions(identifier: string): Promise<CountryWithRegions | null> {
    const country = await this.findCountryByIdOrSlug(identifier);
    if (!country) return null;

    if (isDatabaseConnected()) {
      try {
        const regions = await prisma.region.findMany({
          where: { countryId: country.id },
          orderBy: { name: "asc" },
        });
        return {
          ...country,
          regions,
        };
      } catch {
        // Fall back gracefully
      }
    }

    const { regions } = loadFallbackData();
    const matched = regions
      .filter((r) => r.countryId === country.id)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      ...country,
      regions: matched,
    };
  }

  async findRegionsByCountryIdOrSlug(countryIdentifier: string): Promise<Region[] | null> {
    const country = await this.findCountryByIdOrSlug(countryIdentifier);
    if (!country) return null;

    if (isDatabaseConnected()) {
      try {
        return await prisma.region.findMany({
          where: { countryId: country.id },
          orderBy: { name: "asc" },
        });
      } catch {
        // Fall back gracefully
      }
    }

    const { regions } = loadFallbackData();
    return regions
      .filter((r) => r.countryId === country.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findRegionByIdOrSlug(identifier: string): Promise<Region | null> {
    const raw = identifier.trim();
    const lower = raw.toLowerCase();
    const upper = raw.toUpperCase();

    // Support prefixed formats e.g. "reg_wb" -> "IN-WB"
    let candidateIsoId = upper;
    if (lower.startsWith("reg_")) {
      candidateIsoId = "IN-" + upper.replace("REG_", "");
    } else if (!candidateIsoId.startsWith("IN-") && candidateIsoId.length === 2) {
      candidateIsoId = "IN-" + candidateIsoId;
    }

    if (isDatabaseConnected()) {
      try {
        const found = await prisma.region.findFirst({
          where: {
            OR: [
              { id: raw },
              { id: candidateIsoId },
              { slug: lower },
              { code: upper },
              { code: raw.replace(/^reg_/i, "").toUpperCase() },
            ],
          },
        });
        if (found) return found;
      } catch {
        // Fall back gracefully
      }
    }

    const { regions } = loadFallbackData();
    return (
      regions.find(
        (r) =>
          r.id === raw ||
          r.id === candidateIsoId ||
          r.slug.toLowerCase() === lower ||
          r.code.toUpperCase() === upper ||
          r.code.toUpperCase() === raw.replace(/^reg_/i, "").toUpperCase(),
      ) ?? null
    );
  }

  async findRegionWithDestinations(identifier: string): Promise<RegionWithDestinations | null> {
    const region = await this.findRegionByIdOrSlug(identifier);
    if (!region) return null;

    if (isDatabaseConnected()) {
      try {
        const destinations = await prisma.destination.findMany({
          where: { regionId: region.id },
          orderBy: { name: "asc" },
        });
        return {
          ...region,
          destinations,
        };
      } catch {
        // Fall back gracefully
      }
    }

    const { destinations } = loadFallbackData();
    const matched = destinations
      .filter((d) => d.regionId === region.id)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      ...region,
      destinations: matched,
    };
  }

  async findDestinationsByRegion(regionIdentifier: string): Promise<Destination[] | null> {
    const region = await this.findRegionByIdOrSlug(regionIdentifier);
    if (!region) return null;

    if (isDatabaseConnected()) {
      try {
        return await prisma.destination.findMany({
          where: { regionId: region.id },
          orderBy: { name: "asc" },
        });
      } catch {
        // Fall back gracefully
      }
    }

    const { destinations } = loadFallbackData();
    return destinations
      .filter((d) => d.regionId === region.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const geographyRepository = new GeographyRepository();
