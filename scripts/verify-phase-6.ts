/**
 * OFFBEAT — Phase 6 Verification Script
 * Validates the SerpApi Integration Pipeline:
 * QueryBuilder -> Adapter -> Normalizer -> Cache -> Client / Mocked Provider -> Reference Sync
 */
import { SerpApiQueryBuilder } from "../Backend/src/integrations/serpapi/serpapi.query-builder.js";
import { SerpApiCache } from "../Backend/src/integrations/serpapi/serpapi.cache.js";
import { SerpApiNormalizer } from "../Backend/src/integrations/serpapi/serpapi.normalizer.js";
import { SerpApiService } from "../Backend/src/integrations/serpapi/serpapi.service.js";
import { SerpApiClient } from "../Backend/src/integrations/serpapi/serpapi.client.js";

async function main() {
  console.log("--- OFFBEAT PHASE 6 VERIFICATION SUITE ---");

  // 1. Query Builder Verification
  console.log("1. Verifying Query Builder...");
  const context = {
    destination: "Darjeeling",
    region: "West Bengal",
    country: "India",
    travelTaste: ["mountains", "photography"],
    experienceTaste: ["sunrise"],
    coordinates: { lat: 27.041, lng: 88.266 },
  };
  const searchParams = SerpApiQueryBuilder.buildMapsSearchQuery(context);
  if (
    !searchParams.q?.includes(
      "mountains photography sunrise places in Darjeeling, West Bengal, India",
    )
  ) {
    throw new Error(`Query builder failed: unexpected query string: ${searchParams.q}`);
  }
  if (searchParams.ll !== "@27.041,88.266,14z") {
    throw new Error(`Query builder failed: unexpected ll coordinate: ${searchParams.ll}`);
  }
  console.log(`   ✅ Query correctly constructed: "${searchParams.q}" with ll=${searchParams.ll}`);

  // 2. Cache Key Determinism Verification
  console.log("2. Verifying Deterministic Cache Key...");
  const key1 = SerpApiCache.generateCacheKey("SERPAPI", { a: 1, b: 2, q: "test" });
  const key2 = SerpApiCache.generateCacheKey("SERPAPI", { b: 2, q: "test", a: 1 });
  if (key1 !== key2) {
    throw new Error("Cache keys are not deterministic!");
  }
  console.log(`   ✅ Cache key determinism verified: ${key1.slice(0, 16)}...`);

  // 3. Normalizer & Adapter Verification
  console.log("3. Verifying Adapter & Normalizer...");
  const mockLocalResult = {
    title: "Tiger Hill Sunrise Observatory",
    place_id: "ChIJ_tiger_hill_001",
    rating: 4.7,
    reviews: 4200,
    type: "scenic viewpoint",
    types: ["scenic viewpoint", "tourist attraction"],
    address: "Senchal Wildlife Sanctuary, Darjeeling, West Bengal 734102",
    gps_coordinates: { latitude: 27.012, longitude: 88.261 },
    hours: "Open 24 hours",
    phone: "+91 354 225 4200",
  };
  const normalized = SerpApiNormalizer.normalizeLocalResult(mockLocalResult);
  if (normalized.name !== "Tiger Hill Sunrise Observatory") {
    throw new Error("Normalizer name mismatch");
  }
  if (!normalized.categories.includes("Photography")) {
    throw new Error("Category normalization failed for viewpoint");
  }
  if (normalized.latitude !== 27.012 || normalized.longitude !== 88.261) {
    throw new Error("Coordinate normalization failed");
  }
  console.log(
    `   ✅ Place normalized: "${normalized.name}" -> Categories: [${normalized.categories.join(", ")}]`,
  );

  // 4. Cache & Single-Flight Deduplication Verification
  console.log("4. Verifying Cache & Single-Flight Deduplication...");
  let executionCount = 0;
  class MockSerpApiClient extends SerpApiClient {
    public override async execute<T>(): Promise<T> {
      executionCount++;
      return {
        local_results: [mockLocalResult],
      } as unknown as T;
    }
  }

  const mockClient = new MockSerpApiClient({ apiKey: "mock_key" });
  const service = new SerpApiService(mockClient);

  // Call searchPlaces twice
  const call1 = await service.searchPlaces(context);
  const call2 = await service.searchPlaces(context);

  if (call1.length !== 1 || call2.length !== 1) {
    throw new Error("Search places did not return expected results");
  }
  if (executionCount !== 1) {
    throw new Error(`Cache failed: expected 1 provider call, received ${executionCount}`);
  }
  console.log(
    `   ✅ Cache hit confirmed: 2 searches executed with exactly ${executionCount} provider call.`,
  );

  // 5. ExternalPlaceReference Synchronization Verification
  console.log("5. Verifying ExternalPlaceReference Synchronization...");
  const ref = await service.syncExternalPlaceReference(normalized, "internal_tiger_hill_id");
  if (ref.externalId !== "ChIJ_tiger_hill_001" || ref.provider !== "SERPAPI") {
    throw new Error("External reference sync failed");
  }
  console.log(
    `   ✅ External place reference synced: provider=${ref.provider}, externalId=${ref.externalId}, placeId=${ref.placeId}`,
  );

  // 6. Live External API Check (Optional if SERPAPI_API_KEY is configured)
  console.log("6. Checking Live SerpApi Credentials...");
  const liveKey = process.env.SERPAPI_API_KEY || process.env.SERPAPI_KEY;
  if (liveKey && liveKey.trim() && !liveKey.includes("placeholder")) {
    console.log(
      "   🔑 Live SERPAPI_API_KEY detected! Performing single live verification query...",
    );
    try {
      const liveClient = new SerpApiClient({ apiKey: liveKey.trim(), maxRetries: 1 });
      const liveService = new SerpApiService(liveClient);
      const liveResults = await liveService.searchPlaces({
        destination: "Darjeeling",
        country: "India",
        query: "tourist attractions",
      });
      console.log(
        `   ✅ Live SerpApi query succeeded: found ${liveResults.length} places on Google Maps.`,
      );
      if (liveResults.length > 0) {
        console.log(
          `      First result: "${liveResults[0]?.name}" (${liveResults[0]?.categories.join(", ")})`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`   ⚠️ Live query encountered provider message: ${msg}`);
    }
  } else {
    console.log(
      "   ℹ️ No live SERPAPI_API_KEY present in environment. Offline & mocked integration test passed 100%.",
    );
  }

  console.log("--- PHASE 6 VERIFICATION PASS ---");
}

main().catch((err) => {
  console.error("❌ Phase 6 Verification Failed:", err);
  process.exit(1);
});
