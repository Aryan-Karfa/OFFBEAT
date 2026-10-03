/**
 * OFFBEAT — Phase 7 Verification Script
 * Validates the Discovery Engine Pipeline:
 * DiscoveryContext -> Query / Retrieval -> Internal & SerpApi Candidate Generation
 * -> Deduplication & Merging -> Deterministic Scoring -> Explainability -> Diversity Pass -> Pagination
 */
import { discoveryService } from "../Backend/src/modules/discovery/discovery.service.js";
import { discoveryScorer } from "../Backend/src/modules/discovery/discovery.scorer.js";
import { CandidateMerger } from "../Backend/src/modules/discovery/discovery.merger.js";
import { DiscoveryDiversity } from "../Backend/src/modules/discovery/discovery.diversity.js";
import { discoveryRequestSchema } from "../Backend/src/modules/discovery/discovery.schema.js";
import type {
  DiscoveryCandidate,
  ScoredCandidate,
} from "../Backend/src/modules/discovery/discovery.types.js";

async function main() {
  console.log("--- OFFBEAT PHASE 7 VERIFICATION SUITE ---");

  // 1. Validate Schema & Context Normalization
  console.log("1. Verifying DiscoveryContext & Input Validation...");
  const rawInput = {
    regionId: "IN-WB",
    travelTaste: ["mountains", "photography", "mountains"],
    experienceTaste: ["SUNRISE", " peaceful ", ""],
    dayNight: "DAY",
    intent: "DISCOVER_PLACES",
    page: "1",
    limit: "12",
  };
  const validated = discoveryRequestSchema.parse(rawInput);
  if (validated.travelTaste.length !== 2 || !validated.travelTaste.includes("mountains")) {
    throw new Error("Travel taste deduplication failed");
  }
  if (validated.experienceTaste.length !== 2 || !validated.experienceTaste.includes("sunrise")) {
    throw new Error("Experience taste normalization failed");
  }
  console.log("   ✅ Discovery request successfully validated, sanitized, and deduplicated.");

  // 2. Validate Deterministic Scoring
  console.log("2. Verifying Deterministic Scorer & Explainability...");
  const testCandidate: DiscoveryCandidate = {
    id: "place_tiger_hill",
    source: "INTERNAL",
    provider: "OFFBEAT",
    name: "Tiger Hill",
    slug: "tiger-hill",
    destination: "Darjeeling",
    region: "West Bengal",
    categories: ["Mountain", "Sunrise", "Photography", "Nature"],
    location: { lat: 27.012, lng: 88.261 },
    address: "Senchal Forest, Darjeeling",
    description: "Renowned summit offering dawn panoramas of Mount Kanchenjunga.",
    rating: 4.8,
  };
  const scored = discoveryScorer.scoreCandidate(testCandidate, {
    country: "India",
    regionId: "IN-WB",
    region: "West Bengal",
    destination: "Darjeeling",
    travelTaste: ["mountains", "photography"],
    experienceTaste: ["sunrise", "peaceful", "nature"],
    dayNight: "DAY",
    intent: "DISCOVER_PLACES",
  });

  if (scored.score < 80) {
    throw new Error(`Expected score >= 80 for Tiger Hill match, received: ${scored.score}`);
  }
  if (scored.why.length === 0) {
    throw new Error("Expected explainable why reasons, received none");
  }
  console.log(`   ✅ Deterministic score calculated: ${scored.score}%`);
  console.log(`   ✅ Explainable signals generated:`);
  scored.why.forEach((reason) => console.log(`      • "${reason}"`));

  // 3. Validate Candidate Merger & Deduplication
  console.log("3. Verifying Candidate Merger & Canonical Identity...");
  const merged = CandidateMerger.merge(
    [
      {
        id: "place_tiger_hill",
        destinationId: "dest_darjeeling",
        name: "Tiger Hill",
        slug: "tiger-hill",
        description: "Summit.",
        latitude: 27.012,
        longitude: 88.261,
        address: "Darjeeling",
        website: null,
        phone: null,
        imageUrl: null,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        destination: {
          id: "dest_darjeeling",
          regionId: "IN-WB",
          name: "Darjeeling",
          slug: "darjeeling",
          description: null,
          coordinates: null,
          imageUrl: null,
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        categories: [
          {
            id: "rel_1",
            placeId: "place_tiger_hill",
            categoryId: "cat_mountain",
            createdAt: new Date(),
            category: {
              id: "cat_mountain",
              name: "Mountain",
              slug: "mountain",
              description: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      },
    ],
    [
      {
        provider: "SERPAPI",
        externalId: "ext_th_99",
        name: "Tiger Hill, Darjeeling",
        rating: 4.8,
        reviewCount: 3000,
        categories: ["Scenic viewpoint"],
        thumbnailUrl: "https://example.com/tiger-hill.jpg",
      },
    ],
    { regionName: "West Bengal" },
  );

  if (merged.length !== 1) {
    throw new Error(`Expected 1 merged candidate, received: ${merged.length}`);
  }
  if (merged[0]?.source !== "COMBINED" || merged[0]?.rating !== 4.8) {
    throw new Error("Expected COMBINED source with external rating enrichment");
  }
  console.log(`   ✅ Canonical Place identity preserved with COMBINED intelligence.`);

  // 4. Validate Result Diversity Pass
  console.log("4. Verifying Deterministic Diversity Pass...");
  const mockScoredList: ScoredCandidate[] = [
    {
      candidate: { ...testCandidate, id: "1", name: "Peak 1", categories: ["Mountain"] },
      score: 95,
      why: ["Match"],
      breakdown: {
        travelTasteScore: 95,
        experienceTasteScore: 95,
        categoryScore: 95,
        geographicScore: 95,
        dayNightScore: 95,
        ratingScore: 95,
        completenessScore: 95,
        totalScore: 95,
      },
    },
    {
      candidate: { ...testCandidate, id: "2", name: "Peak 2", categories: ["Mountain"] },
      score: 94,
      why: ["Match"],
      breakdown: {
        travelTasteScore: 94,
        experienceTasteScore: 94,
        categoryScore: 94,
        geographicScore: 94,
        dayNightScore: 94,
        ratingScore: 94,
        completenessScore: 94,
        totalScore: 94,
      },
    },
    {
      candidate: { ...testCandidate, id: "3", name: "Peak 3", categories: ["Mountain"] },
      score: 93,
      why: ["Match"],
      breakdown: {
        travelTasteScore: 93,
        experienceTasteScore: 93,
        categoryScore: 93,
        geographicScore: 93,
        dayNightScore: 93,
        ratingScore: 93,
        completenessScore: 93,
        totalScore: 93,
      },
    },
    {
      candidate: { ...testCandidate, id: "4", name: "Tea Garden", categories: ["Food"] },
      score: 90,
      why: ["Match"],
      breakdown: {
        travelTasteScore: 90,
        experienceTasteScore: 90,
        categoryScore: 90,
        geographicScore: 90,
        dayNightScore: 90,
        ratingScore: 90,
        completenessScore: 90,
        totalScore: 90,
      },
    },
  ];
  const diversified = DiscoveryDiversity.diversify(mockScoredList, 2, 2);
  if (diversified[2]?.candidate.categories[0] !== "Food") {
    throw new Error("Diversity pass did not interleave alternative category");
  }
  console.log("   ✅ Overcrowding prevented by interleaving alternative category.");

  // 5. End-to-End Benchmark Discovery Execution
  console.log("5. Executing End-to-End Benchmark Discovery Flow...");
  const benchmarkResult = await discoveryService.discover({
    regionId: "IN-WB",
    country: "India",
    travelTaste: ["mountains", "photography"],
    experienceTaste: ["sunrise", "peaceful", "nature"],
    dayNight: "DAY",
    intent: "DISCOVER_PLACES",
    page: 1,
    limit: 12,
  });

  if (!benchmarkResult.results || benchmarkResult.results.length === 0) {
    throw new Error("Discovery returned 0 results for West Bengal benchmark scenario!");
  }

  const topMatch = benchmarkResult.results[0]!;
  console.log(
    `   ✅ Discovered ${benchmarkResult.results.length} ranked places in ${benchmarkResult.context.region}.`,
  );
  console.log(`   🏆 Top Ranked: "${topMatch.place.name}" (${topMatch.place.destination})`);
  console.log(`      Score: ${topMatch.score}% | Source: ${topMatch.source.type}`);
  console.log(`      Why: ${topMatch.why.join(" • ")}`);

  if (!topMatch.place.name.toLowerCase().includes("tiger hill")) {
    console.warn(`      (Note: Top match is ${topMatch.place.name})`);
  }

  // 6. Verify Pagination Envelope
  console.log("6. Verifying Pagination Contract...");
  if (
    typeof benchmarkResult.pagination.total !== "number" ||
    typeof benchmarkResult.pagination.totalPages !== "number" ||
    benchmarkResult.pagination.page !== 1
  ) {
    throw new Error("Pagination metadata incomplete or invalid");
  }
  console.log(
    `   ✅ Pagination verified: page ${benchmarkResult.pagination.page}/${benchmarkResult.pagination.totalPages} (total ${benchmarkResult.pagination.total} places)`,
  );

  console.log("--- PHASE 7 DISCOVERY ENGINE VERIFICATION PASS ---");
}

main().catch((err) => {
  console.error("❌ Phase 7 Verification Failed:", err);
  process.exit(1);
});
