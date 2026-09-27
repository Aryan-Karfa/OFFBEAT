import * as topojson from "topojson-client";
import * as d3 from "d3-geo";
import * as fs from "node:fs";
import * as path from "node:path";

// Mapping of TopoJSON state names to standardized OFFBEAT metadata
const REGION_REGISTRY = {
  "Andaman and Nicobar Islands": {
    id: "IN-AN",
    code: "AN",
    slug: "andaman-and-nicobar-islands",
    type: "UNION_TERRITORY",
    zone: "South",
    isSmallTerritory: false,
  },
  "Andhra Pradesh": {
    id: "IN-AP",
    code: "AP",
    slug: "andhra-pradesh",
    type: "STATE",
    zone: "South",
    isSmallTerritory: false,
  },
  "Arunachal Pradesh": {
    id: "IN-AR",
    code: "AR",
    slug: "arunachal-pradesh",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  Assam: {
    id: "IN-AS",
    code: "AS",
    slug: "assam",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  Bihar: {
    id: "IN-BR",
    code: "BR",
    slug: "bihar",
    type: "STATE",
    zone: "East",
    isSmallTerritory: false,
  },
  Chandigarh: {
    id: "IN-CH",
    code: "CH",
    slug: "chandigarh",
    type: "UNION_TERRITORY",
    zone: "North",
    isSmallTerritory: true,
  },
  Chhattisgarh: {
    id: "IN-CT",
    code: "CT",
    slug: "chhattisgarh",
    type: "STATE",
    zone: "Central",
    isSmallTerritory: false,
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    id: "IN-DH",
    code: "DH",
    slug: "dadra-and-nagar-haveli-and-daman-and-diu",
    type: "UNION_TERRITORY",
    zone: "West",
    isSmallTerritory: true,
  },
  Delhi: {
    id: "IN-DL",
    code: "DL",
    slug: "delhi",
    type: "UNION_TERRITORY",
    zone: "North",
    isSmallTerritory: true,
  },
  Goa: {
    id: "IN-GA",
    code: "GA",
    slug: "goa",
    type: "STATE",
    zone: "West",
    isSmallTerritory: false,
  },
  Gujarat: {
    id: "IN-GJ",
    code: "GJ",
    slug: "gujarat",
    type: "STATE",
    zone: "West",
    isSmallTerritory: false,
  },
  Haryana: {
    id: "IN-HR",
    code: "HR",
    slug: "haryana",
    type: "STATE",
    zone: "North",
    isSmallTerritory: false,
  },
  "Himachal Pradesh": {
    id: "IN-HP",
    code: "HP",
    slug: "himachal-pradesh",
    type: "STATE",
    zone: "North",
    isSmallTerritory: false,
  },
  "Jammu and Kashmir": {
    id: "IN-JK",
    code: "JK",
    slug: "jammu-and-kashmir",
    type: "UNION_TERRITORY",
    zone: "North",
    isSmallTerritory: false,
  },
  Jharkhand: {
    id: "IN-JH",
    code: "JH",
    slug: "jharkhand",
    type: "STATE",
    zone: "East",
    isSmallTerritory: false,
  },
  Karnataka: {
    id: "IN-KA",
    code: "KA",
    slug: "karnataka",
    type: "STATE",
    zone: "South",
    isSmallTerritory: false,
  },
  Kerala: {
    id: "IN-KL",
    code: "KL",
    slug: "kerala",
    type: "STATE",
    zone: "South",
    isSmallTerritory: false,
  },
  Ladakh: {
    id: "IN-LA",
    code: "LA",
    slug: "ladakh",
    type: "UNION_TERRITORY",
    zone: "North",
    isSmallTerritory: false,
  },
  Lakshadweep: {
    id: "IN-LD",
    code: "LD",
    slug: "lakshadweep",
    type: "UNION_TERRITORY",
    zone: "South",
    isSmallTerritory: true,
  },
  "Madhya Pradesh": {
    id: "IN-MP",
    code: "MP",
    slug: "madhya-pradesh",
    type: "STATE",
    zone: "Central",
    isSmallTerritory: false,
  },
  Maharashtra: {
    id: "IN-MH",
    code: "MH",
    slug: "maharashtra",
    type: "STATE",
    zone: "West",
    isSmallTerritory: false,
  },
  Manipur: {
    id: "IN-MN",
    code: "MN",
    slug: "manipur",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  Meghalaya: {
    id: "IN-ML",
    code: "ML",
    slug: "meghalaya",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  Mizoram: {
    id: "IN-MZ",
    code: "MZ",
    slug: "mizoram",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  Nagaland: {
    id: "IN-NL",
    code: "NL",
    slug: "nagaland",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  Odisha: {
    id: "IN-OD",
    code: "OD",
    slug: "odisha",
    type: "STATE",
    zone: "East",
    isSmallTerritory: false,
  },
  Puducherry: {
    id: "IN-PY",
    code: "PY",
    slug: "puducherry",
    type: "UNION_TERRITORY",
    zone: "South",
    isSmallTerritory: true,
  },
  Punjab: {
    id: "IN-PB",
    code: "PB",
    slug: "punjab",
    type: "STATE",
    zone: "North",
    isSmallTerritory: false,
  },
  Rajasthan: {
    id: "IN-RJ",
    code: "RJ",
    slug: "rajasthan",
    type: "STATE",
    zone: "West",
    isSmallTerritory: false,
  },
  Sikkim: {
    id: "IN-SK",
    code: "SK",
    slug: "sikkim",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  "Tamil Nadu": {
    id: "IN-TN",
    code: "TN",
    slug: "tamil-nadu",
    type: "STATE",
    zone: "South",
    isSmallTerritory: false,
  },
  Telangana: {
    id: "IN-TG",
    code: "TG",
    slug: "telangana",
    type: "STATE",
    zone: "South",
    isSmallTerritory: false,
  },
  Tripura: {
    id: "IN-TR",
    code: "TR",
    slug: "tripura",
    type: "STATE",
    zone: "Northeast",
    isSmallTerritory: false,
  },
  "Uttar Pradesh": {
    id: "IN-UP",
    code: "UP",
    slug: "uttar-pradesh",
    type: "STATE",
    zone: "North",
    isSmallTerritory: false,
  },
  Uttarakhand: {
    id: "IN-UT",
    code: "UT",
    slug: "uttarakhand",
    type: "STATE",
    zone: "North",
    isSmallTerritory: false,
  },
  "West Bengal": {
    id: "IN-WB",
    code: "WB",
    slug: "west-bengal",
    type: "STATE",
    zone: "East",
    isSmallTerritory: false,
  },
};

async function main() {
  console.log("Fetching official Survey of India / Census TopoJSON...");
  const res = await globalThis.fetch(
    "https://raw.githubusercontent.com/udit-001/india-maps-data/master/topojson/india.json",
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch TopoJSON: ${res.statusText}`);
  }
  const topology = await res.json();
  const geojson = topojson.feature(topology, topology.objects.states);

  console.log(`Loaded ${geojson.features.length} state/UT features.`);

  // Projection: Official Survey of India Lambert Conformal Conic (LCC)
  // Standard parallels: 12°N and 32°N, central meridian: 78.9629°E
  const projection = d3
    .geoConicConformal()
    .parallels([12, 32])
    .rotate([-78.9629, 0])
    .fitSize([800, 920], geojson);

  const pathGenerator = d3.geoPath().projection(projection);

  const regions = [];

  for (const feature of geojson.features) {
    const rawName = feature.properties.st_nm;
    const reg = REGION_REGISTRY[rawName];

    if (!reg) {
      console.warn(`Warning: Unknown state in TopoJSON: "${rawName}"`);
      continue;
    }

    const svgPath = pathGenerator(feature);
    const projectedBounds = pathGenerator.bounds(feature);
    const projectedCentroid = pathGenerator.centroid(feature);

    // Compute raw geographic centroid (lat/lng)
    // GeoJSON coordinates are [lng, lat]
    const geoCentroid = d3.geoCentroid(feature); // returns [lng, lat]
    const geoBounds = d3.geoBounds(feature); // returns [[minLng, minLat], [maxLng, maxLat]]

    regions.push({
      id: reg.id,
      name: rawName,
      code: reg.code,
      slug: reg.slug,
      type: reg.type,
      zone: reg.zone,
      isSmallTerritory: reg.isSmallTerritory,
      coordinates: {
        lng: Math.round(geoCentroid[0] * 10000) / 10000,
        lat: Math.round(geoCentroid[1] * 10000) / 10000,
      },
      bbox: [
        Math.round(geoBounds[0][0] * 10000) / 10000,
        Math.round(geoBounds[0][1] * 10000) / 10000,
        Math.round(geoBounds[1][0] * 10000) / 10000,
        Math.round(geoBounds[1][1] * 10000) / 10000,
      ],
      projectedCentroid: [
        Math.round(projectedCentroid[0] * 10) / 10,
        Math.round(projectedCentroid[1] * 10) / 10,
      ],
      projectedBounds: [
        [Math.round(projectedBounds[0][0] * 10) / 10, Math.round(projectedBounds[0][1] * 10) / 10],
        [Math.round(projectedBounds[1][0] * 10) / 10, Math.round(projectedBounds[1][1] * 10) / 10],
      ],
      svgPath: svgPath,
      geometry: feature.geometry,
    });
  }

  // Sort regions by name
  regions.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Processed ${regions.length} regions.`);
  const stateCount = regions.filter((r) => r.type === "STATE").length;
  const utCount = regions.filter((r) => r.type === "UNION_TERRITORY").length;
  console.log(`States: ${stateCount}, Union Territories: ${utCount}`);

  if (stateCount !== 28 || utCount !== 8) {
    throw new Error(
      `Invalid state count (${stateCount}) or UT count (${utCount})! Must be 28 and 8.`,
    );
  }

  const outDir = path.resolve("Frontend/src/features/geography/data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const targetPath = path.join(outDir, "india-administrative.json");
  fs.writeFileSync(targetPath, JSON.stringify({ type: "FeatureCollection", regions }, null, 2));
  console.log(`Successfully generated ${targetPath}`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
