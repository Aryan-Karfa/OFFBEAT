import fs from "node:fs";
import path from "node:path";

const EXPECTED_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const EXPECTED_UTS = [
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

console.log("--- OFFBEAT GEOGRAPHIC VALIDATION SUITE ---");

const geoPath = path.resolve("Frontend/src/features/geography/data/india-administrative.json");
const metaPath = path.resolve("Frontend/src/features/geography/data/regionMetadata.ts");

if (!fs.existsSync(geoPath)) {
  console.error(`❌ Missing geography data file: ${geoPath}`);
  process.exit(1);
}

if (!fs.existsSync(metaPath)) {
  console.error(`❌ Missing metadata file: ${metaPath}`);
  process.exit(1);
}

const geoData = JSON.parse(fs.readFileSync(geoPath, "utf8"));
const metaContent = fs.readFileSync(metaPath, "utf8");

const failures = [];
const regions = geoData.regions || [];

// 1. Total counts check
if (regions.length !== 36) {
  failures.push(`Expected 36 regions, got ${regions.length}`);
}

const states = regions.filter((r) => r.type === "STATE");
const uts = regions.filter((r) => r.type === "UNION_TERRITORY");

if (states.length !== 28) {
  failures.push(`Expected 28 states, got ${states.length}`);
}

if (uts.length !== 8) {
  failures.push(`Expected 8 union territories, got ${uts.length}`);
}

// 2. Expected names presence
for (const expectedState of EXPECTED_STATES) {
  if (!states.some((s) => s.name === expectedState)) {
    failures.push(`Missing required state: "${expectedState}"`);
  }
}

for (const expectedUt of EXPECTED_UTS) {
  if (!uts.some((u) => u.name === expectedUt)) {
    failures.push(`Missing required union territory: "${expectedUt}"`);
  }
}

// 3. Uniqueness of IDs, codes, slugs
const idSet = new Set();
const codeSet = new Set();
const slugSet = new Set();

for (const r of regions) {
  // Check ID
  if (!r.id || !r.id.startsWith("IN-")) {
    failures.push(`Invalid ISO 3166-2:IN id: "${r.id}" for ${r.name}`);
  }
  if (idSet.has(r.id)) {
    failures.push(`Duplicate region id: "${r.id}"`);
  }
  idSet.add(r.id);

  // Check code
  if (!r.code || r.code.length !== 2) {
    failures.push(`Invalid 2-letter state code: "${r.code}" for ${r.name}`);
  }
  if (codeSet.has(r.code)) {
    failures.push(`Duplicate state code: "${r.code}"`);
  }
  codeSet.add(r.code);

  // Check slug
  if (!r.slug) {
    failures.push(`Missing slug for ${r.name}`);
  }
  if (slugSet.has(r.slug)) {
    failures.push(`Duplicate slug: "${r.slug}"`);
  }
  slugSet.add(r.slug);

  // 4. Geometry validity
  if (!r.geometry || !r.geometry.type || !Array.isArray(r.geometry.coordinates)) {
    failures.push(`Invalid GeoJSON geometry for ${r.name}`);
  }
  if (r.geometry.coordinates.length === 0) {
    failures.push(`Empty GeoJSON geometry coordinates for ${r.name}`);
  }

  // 5. Projected SVG path validity
  if (!r.svgPath || typeof r.svgPath !== "string" || !r.svgPath.startsWith("M")) {
    failures.push(`Missing or invalid SVG path for ${r.name}`);
  }

  // 6. Coordinates and bounds
  if (
    typeof r.coordinates?.lat !== "number" ||
    typeof r.coordinates?.lng !== "number" ||
    r.coordinates.lat < 6 ||
    r.coordinates.lat > 38 ||
    r.coordinates.lng < 68 ||
    r.coordinates.lng > 98
  ) {
    failures.push(
      `Coordinates out of India bounding bounds for ${r.name}: [${r.coordinates?.lat}, ${r.coordinates?.lng}]`,
    );
  }

  // 7. Projected Bounds
  if (
    !Array.isArray(r.projectedBounds) ||
    r.projectedBounds.length !== 2 ||
    r.projectedBounds[0][0] >= r.projectedBounds[1][0] ||
    r.projectedBounds[0][1] >= r.projectedBounds[1][1]
  ) {
    failures.push(`Invalid projected bounds for ${r.name}: ${JSON.stringify(r.projectedBounds)}`);
  }

  // 8. 1:1 metadata match
  const metaKeySearch = `"${r.id}":`;
  if (!metaContent.includes(metaKeySearch)) {
    failures.push(`Missing editorial metadata record for region: ${r.id} (${r.name})`);
  }
}

if (failures.length > 0) {
  console.error("❌ Geography validation failed with errors:");
  for (const f of failures) {
    console.error(`  - ${f}`);
  }
  process.exit(1);
}

console.log("✅ All 28 States and 8 Union Territories validated successfully.");
console.log("✅ All IDs (ISO 3166-2:IN), state codes, and slugs are unique and valid.");
console.log("✅ All GeoJSON geometries and pre-projected SVG paths are non-empty and valid.");
console.log("✅ Real geographical coordinates and projected bounds are verified within bounds.");
console.log("✅ 1:1 linkage between geographic features and editorial metadata verified.");
console.log("--- GEOGRAPHY VALIDATION PASS ---");
