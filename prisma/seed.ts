import {
  PrismaClient,
  UserStatus,
  RegionType,
  DestinationStatus,
  PlaceStatus,
} from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REGION_EDITORIAL_METADATA } from "../Frontend/src/features/geography/data/regionMetadata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

export interface RawGeoRegion {
  id: string;
  name: string;
  code: string;
  slug: string;
  type: "STATE" | "UNION_TERRITORY";
  coordinates: {
    lat: number;
    lng: number;
  };
  geometry: unknown;
}

import {
  SEED_CATEGORIES,
  SEED_DESTINATIONS,
  SEED_PLACES,
} from "../Backend/src/modules/geography/geography.seed-data.js";

export { SEED_CATEGORIES, SEED_DESTINATIONS, SEED_PLACES };

export async function seedDatabase(client: PrismaClient = prisma) {
  console.log("🌱 Starting OFFBEAT database seed...");

  // 1. Baseline Demo User & Profile (Phase 4)
  const demoEmail = "traveler@offbeat.internal";
  const demoUsername = "offbeat_traveler";

  const user = await client.user.upsert({
    where: { email: demoEmail },
    update: {
      username: demoUsername,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: demoEmail,
      username: demoUsername,
      passwordHash: "$2b$10$epB3Q7kU8kS7qY9fC5vL.e0vV8wR2xW9zB8qA7tY6uI5oP4mN3lK2",
      status: UserStatus.ACTIVE,
    },
  });

  const profile = await client.profile.upsert({
    where: { userId: user.id },
    update: {
      displayName: "Offbeat Traveler",
      bio: "Curator of hidden trails, living root bridges, and high-altitude Himalayan monasteries.",
      homeCountry: "India",
    },
    create: {
      userId: user.id,
      displayName: "Offbeat Traveler",
      bio: "Curator of hidden trails, living root bridges, and high-altitude Himalayan monasteries.",
      homeCountry: "India",
    },
  });

  console.log(`✅ Seeded baseline user: ${user.username} (${user.id})`);

  // 2. Country: India
  const india = await client.country.upsert({
    where: { code: "IND" },
    update: {
      name: "India",
      slug: "india",
      geometry: { type: "Country", code: "IND", name: "India" },
    },
    create: {
      id: "country_in",
      name: "India",
      code: "IND",
      slug: "india",
      geometry: { type: "Country", code: "IND", name: "India" },
    },
  });

  console.log(`✅ Seeded Country: ${india.name} (${india.code})`);

  // 3. Indian Administrative Geography (All 28 States + 8 Union Territories = 36 Regions)
  const geoPath = path.resolve(
    __dirname,
    "../Frontend/src/features/geography/data/india-administrative.json",
  );
  const rawData = JSON.parse(fs.readFileSync(geoPath, "utf8"));
  const rawRegions: RawGeoRegion[] = rawData.regions;

  let seededRegionsCount = 0;
  for (const r of rawRegions) {
    const meta = REGION_EDITORIAL_METADATA[r.id];
    const regionType = r.type === "UNION_TERRITORY" ? RegionType.UNION_TERRITORY : RegionType.STATE;

    await client.region.upsert({
      where: { id: r.id },
      update: {
        countryId: india.id,
        name: r.name,
        code: r.code,
        type: regionType,
        slug: r.slug,
        description: meta?.description ?? null,
        geometry: r.geometry as object,
        centroid: {
          lat: r.coordinates.lat,
          lng: r.coordinates.lng,
        },
      },
      create: {
        id: r.id,
        countryId: india.id,
        name: r.name,
        code: r.code,
        type: regionType,
        slug: r.slug,
        description: meta?.description ?? null,
        geometry: r.geometry as object,
        centroid: {
          lat: r.coordinates.lat,
          lng: r.coordinates.lng,
        },
      },
    });
    seededRegionsCount++;
  }

  console.log(`✅ Seeded ${seededRegionsCount} Regions (28 States + 8 UTs) for ${india.name}`);

  // 4. Categories
  const categoryMap = new Map<string, string>();
  for (const cat of SEED_CATEGORIES) {
    const seededCat = await client.placeCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categoryMap.set(cat.slug, seededCat.id);
  }
  console.log(`✅ Seeded ${SEED_CATEGORIES.length} Place Categories`);

  // 5. Destinations
  for (const dest of SEED_DESTINATIONS) {
    await client.destination.upsert({
      where: {
        regionId_slug: {
          regionId: dest.regionId,
          slug: dest.slug,
        },
      },
      update: {
        name: dest.name,
        description: dest.description,
        coordinates: dest.coordinates,
        status: DestinationStatus.ACTIVE,
      },
      create: {
        id: dest.id,
        regionId: dest.regionId,
        name: dest.name,
        slug: dest.slug,
        description: dest.description,
        coordinates: dest.coordinates,
        status: DestinationStatus.ACTIVE,
      },
    });
  }
  console.log(`✅ Seeded ${SEED_DESTINATIONS.length} Destinations`);

  // 6. Places & Categories Relations
  let seededPlacesCount = 0;
  let seededRelationsCount = 0;

  for (const place of SEED_PLACES) {
    const seededPlace = await client.place.upsert({
      where: {
        destinationId_slug: {
          destinationId: place.destinationId,
          slug: place.slug,
        },
      },
      update: {
        name: place.name,
        description: place.description,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        status: PlaceStatus.ACTIVE,
      },
      create: {
        id: place.id,
        destinationId: place.destinationId,
        name: place.name,
        slug: place.slug,
        description: place.description,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        status: PlaceStatus.ACTIVE,
      },
    });
    seededPlacesCount++;

    // Associate categories
    for (const catSlug of place.categorySlugs) {
      const categoryId = categoryMap.get(catSlug);
      if (categoryId) {
        await client.placeCategoryRelation.upsert({
          where: {
            placeId_categoryId: {
              placeId: seededPlace.id,
              categoryId,
            },
          },
          update: {},
          create: {
            id: `rel_${seededPlace.id}_${catSlug}`,
            placeId: seededPlace.id,
            categoryId,
          },
        });
        seededRelationsCount++;
      }
    }
  }

  console.log(
    `✅ Seeded ${seededPlacesCount} Places with ${seededRelationsCount} Category Relations`,
  );

  return {
    user,
    profile,
    country: india,
    regionsCount: seededRegionsCount,
    categoriesCount: SEED_CATEGORIES.length,
    destinationsCount: SEED_DESTINATIONS.length,
    placesCount: seededPlacesCount,
    relationsCount: seededRelationsCount,
  };
}

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  main();
}
