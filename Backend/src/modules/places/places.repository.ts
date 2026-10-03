import { prisma, isDatabaseConnected } from "../../lib/db/prisma.js";
import type { PlaceCategory } from "@prisma/client";
import { DestinationStatus, PlaceStatus } from "@prisma/client";
import type { PlaceWithDetails } from "./places.types.js";
import {
  SEED_CATEGORIES,
  SEED_DESTINATIONS,
  SEED_PLACES,
} from "../geography/geography.seed-data.js";

let cachedPlacesWithDetails: PlaceWithDetails[] | null = null;
let cachedCategories: PlaceCategory[] | null = null;

function loadFallbackPlaceData(): {
  places: PlaceWithDetails[];
  categories: PlaceCategory[];
} {
  if (cachedPlacesWithDetails && cachedCategories) {
    return {
      places: cachedPlacesWithDetails,
      categories: cachedCategories,
    };
  }

  cachedCategories = SEED_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  }));

  const categoryMap = new Map(cachedCategories.map((c) => [c.slug, c]));
  const destMap = new Map(
    SEED_DESTINATIONS.map((d) => [
      d.id,
      {
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
      },
    ]),
  );

  cachedPlacesWithDetails = SEED_PLACES.map((p) => {
    const destination = destMap.get(p.destinationId) ?? {
      id: p.destinationId,
      regionId: "IN-WB",
      name: "Darjeeling",
      slug: "darjeeling",
      description: null,
      coordinates: null,
      imageUrl: null,
      status: DestinationStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    const categories = p.categorySlugs
      .map((slug) => categoryMap.get(slug))
      .filter((cat): cat is PlaceCategory => Boolean(cat))
      .map((cat) => ({
        id: `rel_${p.id}_${cat.slug}`,
        placeId: p.id,
        categoryId: cat.id,
        createdAt: new Date("2026-01-01"),
        category: cat,
      }));

    return {
      id: p.id,
      destinationId: p.destinationId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      latitude: p.latitude,
      longitude: p.longitude,
      address: p.address,
      website: null,
      phone: null,
      imageUrl: null,
      status: PlaceStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      destination,
      categories,
    };
  });

  return {
    places: cachedPlacesWithDetails,
    categories: cachedCategories,
  };
}

export class PlaceRepository {
  async findPlaceByIdOrSlug(identifier: string): Promise<PlaceWithDetails | null> {
    const raw = identifier.trim();
    const lower = raw.toLowerCase();
    const slugWithoutPrefix = lower.replace(/^place_/, "").replace(/_/g, "-");

    if (isDatabaseConnected()) {
      try {
        const found = await prisma.place.findFirst({
          where: {
            OR: [{ id: raw }, { id: lower }, { slug: lower }, { slug: slugWithoutPrefix }],
          },
          include: {
            destination: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
        });
        if (found) return found;
      } catch {
        // Fall back gracefully
      }
    }

    const { places } = loadFallbackPlaceData();
    return (
      places.find(
        (p) =>
          p.id === raw ||
          p.id.toLowerCase() === lower ||
          p.slug.toLowerCase() === lower ||
          p.slug.toLowerCase() === slugWithoutPrefix,
      ) ?? null
    );
  }

  async findPlacesByDestination(destinationId: string): Promise<PlaceWithDetails[]> {
    if (isDatabaseConnected()) {
      try {
        return await prisma.place.findMany({
          where: { destinationId },
          include: {
            destination: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { name: "asc" },
        });
      } catch {
        // Fall back gracefully
      }
    }

    const { places } = loadFallbackPlaceData();
    return places
      .filter((p) => p.destinationId === destinationId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findPlacesByRegion(regionId: string): Promise<PlaceWithDetails[]> {
    const raw = regionId.trim();
    const lower = raw.toLowerCase();

    if (isDatabaseConnected()) {
      try {
        return await prisma.place.findMany({
          where: {
            destination: {
              OR: [
                { regionId: raw },
                { regionId: lower },
                { region: { id: raw } },
                { region: { code: raw.toUpperCase() } },
                { region: { slug: lower } },
              ],
            },
          },
          include: {
            destination: true,
            categories: {
              include: {
                category: true,
              },
            },
          },
          orderBy: { name: "asc" },
        });
      } catch {
        // Fall back gracefully
      }
    }

    const { places } = loadFallbackPlaceData();
    return places
      .filter((p) => {
        const destRegion = p.destination.regionId;
        return (
          destRegion === raw ||
          destRegion.toLowerCase() === lower ||
          destRegion.toUpperCase() === raw.toUpperCase()
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findAllCategories(): Promise<PlaceCategory[]> {
    if (isDatabaseConnected()) {
      try {
        return await prisma.placeCategory.findMany({
          orderBy: { name: "asc" },
        });
      } catch {
        // Fall back gracefully
      }
    }

    const { categories } = loadFallbackPlaceData();
    return categories;
  }
}

export const placeRepository = new PlaceRepository();
