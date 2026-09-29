import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEED_CATEGORIES,
  SEED_DESTINATIONS,
  SEED_PLACES,
} from "../../src/modules/geography/geography.seed-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawGeoRegion {
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

describe("Geography & Place Data Integrity Tests", () => {
  const geoPath = path.resolve(
    __dirname,
    "../../../Frontend/src/features/geography/data/india-administrative.json",
  );
  const metaPath = path.resolve(
    __dirname,
    "../../../Frontend/src/features/geography/data/regionMetadata.ts",
  );

  const rawData = JSON.parse(fs.readFileSync(geoPath, "utf8"));
  const metaContent = fs.readFileSync(metaPath, "utf8");
  const regions: RawGeoRegion[] = rawData.regions;

  it("India geography contains exactly 36 regions (28 States + 8 Union Territories)", () => {
    expect(regions).toHaveLength(36);

    const states = regions.filter((r) => r.type === "STATE");
    const unionTerritories = regions.filter((r) => r.type === "UNION_TERRITORY");

    expect(states).toHaveLength(28);
    expect(unionTerritories).toHaveLength(8);
  });

  it("all 36 regions have valid ISO-3166-2:IN IDs, 2-letter codes, and unique slugs", () => {
    const idSet = new Set<string>();
    const codeSet = new Set<string>();
    const slugSet = new Set<string>();

    for (const r of regions) {
      expect(r.id).toMatch(/^IN-[A-Z]{2}$/);
      expect(r.code).toMatch(/^[A-Z]{2}$/);
      expect(r.slug).toBeTruthy();

      expect(idSet.has(r.id)).toBe(false);
      expect(codeSet.has(r.code)).toBe(false);
      expect(slugSet.has(r.slug)).toBe(false);

      idSet.add(r.id);
      codeSet.add(r.code);
      slugSet.add(r.slug);
    }
  });

  it("all 36 regions possess valid geometry, coordinates, and 1:1 editorial metadata linkage", () => {
    for (const r of regions) {
      // Geometry check
      expect(r.geometry).toBeDefined();
      expect(typeof r.geometry).toBe("object");

      // Centroid coordinates check within India's geographic bounds
      expect(r.coordinates.lat).toBeGreaterThan(6);
      expect(r.coordinates.lat).toBeLessThan(38);
      expect(r.coordinates.lng).toBeGreaterThan(68);
      expect(r.coordinates.lng).toBeLessThan(98);

      // Metadata linkage check
      expect(metaContent).toContain(`"${r.id}":`);
    }
  });

  it("Hierarchy: every Destination links to a valid seeded Region", () => {
    const regionIds = new Set(regions.map((r) => r.id));

    expect(SEED_DESTINATIONS.length).toBeGreaterThanOrEqual(5);

    for (const dest of SEED_DESTINATIONS) {
      expect(regionIds.has(dest.regionId)).toBe(true);
      expect(dest.slug).toBeTruthy();
      expect(dest.name).toBeTruthy();
    }
  });

  it("Hierarchy: every Place links to a valid seeded Destination", () => {
    const destinationIds = new Set(SEED_DESTINATIONS.map((d) => d.id));

    expect(SEED_PLACES.length).toBeGreaterThanOrEqual(8);

    for (const place of SEED_PLACES) {
      expect(destinationIds.has(place.destinationId)).toBe(true);
      expect(place.name).toBeTruthy();
      expect(place.slug).toBeTruthy();
      expect(typeof place.latitude).toBe("number");
      expect(typeof place.longitude).toBe("number");
      expect(place.latitude).toBeGreaterThan(6);
      expect(place.latitude).toBeLessThan(38);
      expect(place.longitude).toBeGreaterThan(68);
      expect(place.longitude).toBeLessThan(98);
    }
  });

  it("Categories: every Category has a unique slug and non-empty description", () => {
    const categorySlugs = new Set<string>();

    expect(SEED_CATEGORIES.length).toBeGreaterThanOrEqual(10);

    for (const cat of SEED_CATEGORIES) {
      expect(categorySlugs.has(cat.slug)).toBe(false);
      categorySlugs.add(cat.slug);
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
  });

  it("Place-Category associations reference existing categories without duplicates", () => {
    const validCategorySlugs = new Set(SEED_CATEGORIES.map((c) => c.slug));

    for (const place of SEED_PLACES) {
      expect(place.categorySlugs.length).toBeGreaterThan(0);
      const placeCategorySet = new Set<string>();

      for (const catSlug of place.categorySlugs) {
        expect(validCategorySlugs.has(catSlug)).toBe(true);
        expect(placeCategorySet.has(catSlug)).toBe(false);
        placeCategorySet.add(catSlug);
      }
    }
  });

  it("Representative journey destinations and places are present in seed data", () => {
    const placeSlugs = SEED_PLACES.map((p) => p.slug);

    // Required demo journey locations from Phase 5 specifications
    expect(placeSlugs).toContain("tiger-hill");
    expect(placeSlugs).toContain("victoria-memorial");
    expect(placeSlugs).toContain("jorasanko-thakur-bari");
    expect(placeSlugs).toContain("digha-beach");
  });
});
