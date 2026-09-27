import type { Country, Region } from "../../types/geography";
import adminData from "./data/india-administrative.json";
import { REGION_EDITORIAL_METADATA } from "./data/regionMetadata";

export const FEATURED_COUNTRIES: Country[] = [
  {
    id: "in",
    name: "India",
    code: "IND",
    tagline: "28 States · 8 Union Territories · Countless Micro-cultures",
    description:
      "Explore beyond the golden triangle. Discover remote Himalayan villages, pristine coastal fishing towns, and ancient living traditions.",
    regionsCount: 36,
    communityDiscoveriesCount: 1420,
    isAvailable: true,
  },
  {
    id: "jp",
    name: "Japan",
    code: "JPN",
    tagline: "47 Prefectures · Mountain Passes & Coastal Inlets",
    description:
      "From alpine craft hamlets in Gifu to secluded hot springs on the Shimokita peninsula.",
    regionsCount: 47,
    communityDiscoveriesCount: 890,
    isAvailable: false,
  },
  {
    id: "it",
    name: "Italy",
    code: "ITA",
    tagline: "20 Distinct Regions · Regional Dialects & Culinary Roots",
    description:
      "Venture past Florence and Rome into the rugged interior of Basilicata and the quiet valleys of Friuli.",
    regionsCount: 20,
    communityDiscoveriesCount: 740,
    isAvailable: false,
  },
  {
    id: "pe",
    name: "Peru",
    code: "PER",
    tagline: "25 Regions · Andean Cloud Forests & Coastal Valleys",
    description:
      "Discover pre-Inca ruins in Chachapoyas and highland community-led trails beyond Cusco.",
    regionsCount: 25,
    communityDiscoveriesCount: 410,
    isAvailable: false,
  },
];

interface RawGeoRegion {
  id: string;
  name: string;
  code: string;
  slug: string;
  type: "STATE" | "UNION_TERRITORY";
  zone: "North" | "South" | "East" | "West" | "Northeast" | "Central";
  isSmallTerritory: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  bbox: [number, number, number, number];
  projectedCentroid: [number, number];
  projectedBounds: [[number, number], [number, number]];
  svgPath: string;
  geometry: unknown;
}

/**
 * Composed single source of truth for all Indian states and Union Territories.
 * Merges official Survey of India administrative geometries with OFFBEAT editorial metadata.
 */
export const INDIA_REGIONS: Region[] = (adminData.regions as RawGeoRegion[]).map((geo) => {
  const meta = REGION_EDITORIAL_METADATA[geo.id] || {
    id: geo.id,
    tagline: `${geo.name} · Cultural Exploration`,
    description: `Discover authentic community gems and offbeat destinations across ${geo.name}.`,
    tags: ["Culture", "Heritage", "Landscape"],
    discoveryCount: 40,
    highlight: `Regional highlights and heritage pathways across ${geo.name}.`,
    destinations: [],
  };

  return {
    id: geo.id,
    countryId: "in",
    name: geo.name,
    code: geo.code,
    type: geo.type,
    slug: geo.slug,
    zone: geo.zone,
    isSmallTerritory: geo.isSmallTerritory,
    tagline: meta.tagline,
    description: meta.description,
    tags: meta.tags,
    discoveryCount: meta.discoveryCount,
    highlight: meta.highlight,
    coordinates: geo.coordinates,
    bbox: geo.bbox,
    projectedCentroid: geo.projectedCentroid,
    projectedBounds: geo.projectedBounds,
    svgPath: geo.svgPath,
    geometry: geo.geometry,
    destinations: meta.destinations,
  };
});

/**
 * Universal lookup supporting ISO ID ("IN-WB"), short code ("WB" or "wb"),
 * or URL slug ("west-bengal") for maximum backwards compatibility.
 */
export function findRegion(query: string | undefined | null): Region | undefined {
  if (!query) return undefined;
  const normalized = query.toLowerCase().trim();

  return INDIA_REGIONS.find(
    (r) =>
      r.id.toLowerCase() === normalized ||
      r.code.toLowerCase() === normalized ||
      r.slug.toLowerCase() === normalized ||
      r.name.toLowerCase() === normalized ||
      r.id.replace("in-", "").toLowerCase() === normalized,
  );
}
