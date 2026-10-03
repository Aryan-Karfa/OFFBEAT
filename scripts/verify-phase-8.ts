/**
 * OFFBEAT — Phase 8 Verification Script
 * Validates Community Intelligence:
 * Submissions -> Evidence -> Support / Confirmation -> Reporting
 * -> Duplicate Protection -> Community Signals on Places & Discovery
 */
import { communityService } from "../Backend/src/modules/community/community.service.js";
import { placeService } from "../Backend/src/modules/places/places.service.js";
import { discoveryService } from "../Backend/src/modules/discovery/discovery.service.js";
import { CreateCommunitySubmissionSchema } from "../Backend/src/modules/community/community.schema.js";

async function main() {
  console.log("--- OFFBEAT PHASE 8 VERIFICATION SUITE ---");

  // 1. Validate Schema & Taxonomy Input
  console.log("1. Verifying Community Submission Schemas & Documented Taxonomy...");
  const validSubmission = {
    placeId: "place_tiger_hill",
    type: "PHOTO_SPOT",
    title: "Quiet pine path for dawn photos",
    content:
      "Walk 150m south behind the observatory tower for unobstructed Kanchenjunga ridge views.",
    evidence: [
      {
        type: "PHOTO",
        mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
        content: "Prayer flags silhouetted at first light",
      },
    ],
  };

  const parsed = CreateCommunitySubmissionSchema.parse(validSubmission);
  if (parsed.type !== "PHOTO_SPOT" || parsed.evidence?.length !== 1) {
    throw new Error("Validation parsing error on community submission schema");
  }
  console.log("   ✅ Validated community submission and evidence schemas.");

  // 2. Test Community Submission Creation
  console.log("2. Verifying Community Submission Creation...");
  const created = await communityService.createSubmission(
    {
      placeId: "place_tiger_hill",
      type: "TRAVEL_TIP",
      title: "Shared jeep departure points from Chowrasta",
      content:
        "Jeeps gather at Clubside taxi stand from 3:45 AM. Pre-booking a seat the evening before saves morning hassle.",
    },
    "user_demo_traveler",
    "verify_req_1",
  );

  if (!created.id || created.title !== "Shared jeep departure points from Chowrasta") {
    throw new Error("Created submission verification failed");
  }
  console.log(`   ✅ Community discovery created: "${created.title}" (ID: ${created.id})`);
  console.log(`      Author: ${created.author.displayName} | Type: ${created.type}`);

  // 3. Test Deterministic Duplicate Protection
  console.log("3. Verifying Duplicate Submission Protection...");
  let duplicateCaught = false;
  try {
    await communityService.createSubmission(
      {
        placeId: "place_tiger_hill",
        type: "TRAVEL_TIP",
        title: "shared jeep departure points from chowrasta!", // identical normalized title
        content: "Attempting duplicate post with slightly different casing.",
      },
      "user_demo_traveler",
      "verify_req_2",
    );
  } catch (err: unknown) {
    const errorObj = err as { name?: string; statusCode?: number };
    if (errorObj?.name === "ConflictError" || errorObj?.statusCode === 409) {
      duplicateCaught = true;
    }
  }

  if (!duplicateCaught) {
    throw new Error("Expected ConflictError on duplicate submission, but none was thrown!");
  }
  console.log("   ✅ Deterministic duplicate submission correctly rejected with 409 Conflict.");

  // 4. Test Listing & Filtering
  console.log("4. Verifying Submission Listing & Place Filtering...");
  const listResult = await communityService.listSubmissions({
    placeId: "place_tiger_hill",
    page: 1,
    limit: 10,
  });

  if (listResult.items.length < 3) {
    throw new Error(
      `Expected at least 3 seeded submissions for Tiger Hill, got: ${listResult.items.length}`,
    );
  }
  console.log(`   ✅ Retrieved ${listResult.items.length} community discoveries for Tiger Hill.`);

  // 5. Test Support / Confirmation & Duplicate Support Prevention
  console.log("5. Verifying Support / Confirmation & Duplicate Protection...");
  const targetSubId = created.id;
  const supporterId = "user_demo_supporter";

  const initialSupport = await communityService.supportSubmission(
    targetSubId,
    supporterId,
    "CONFIRM",
  );

  if (!initialSupport.userSupported || initialSupport.confirmCount < 1) {
    throw new Error("Support registration verification failed");
  }
  console.log(`   ✅ Supporter confirmed discovery. Confirm count: ${initialSupport.confirmCount}`);

  let duplicateSupportCaught = false;
  try {
    await communityService.supportSubmission(targetSubId, supporterId, "CONFIRM");
  } catch (err: unknown) {
    const errorObj = err as { name?: string; statusCode?: number };
    if (errorObj?.name === "ConflictError" || errorObj?.statusCode === 409) {
      duplicateSupportCaught = true;
    }
  }

  if (!duplicateSupportCaught) {
    throw new Error("Expected ConflictError on duplicate support from same user!");
  }
  console.log("   ✅ Duplicate support correctly prevented with 409 Conflict.");

  // 6. Test Reporting
  console.log("6. Verifying Community Reporting Flow...");
  const reportResult = await communityService.reportSubmission(
    targetSubId,
    "user_demo_local",
    "OUTDATED",
    "Jeep stand shifted slightly due to mall road pedestrianization.",
  );

  if (!reportResult.reported) {
    throw new Error("Report registration failed");
  }
  console.log("   ✅ Community report recorded safely for review.");

  // 7. Test Place Detail Community Integration
  console.log("7. Verifying Place Detail Community Signals...");
  const placeDetail = await placeService.getPlaceById("place_tiger_hill");

  if (!placeDetail.community || placeDetail.community.submissionCount < 3) {
    throw new Error("Expected community signals on Tiger Hill place detail!");
  }
  console.log(`   ✅ Place Detail enriched with community knowledge:`);
  console.log(`      • Total Discoveries: ${placeDetail.community.submissionCount}`);
  console.log(`      • Useful Votes: ${placeDetail.community.usefulCount}`);
  console.log(`      • Confirmations: ${placeDetail.community.confirmCount}`);
  console.log(`      • Top Highlight: "${placeDetail.community.highlights[0]?.title}"`);

  // 8. Test Discovery Engine Community Highlights Integration
  console.log("8. Verifying Discovery Engine Integration...");
  const discoveryResult = await discoveryService.discover({
    regionId: "IN-WB",
    travelTaste: ["mountains", "photography"],
    experienceTaste: ["sunrise"],
    dayNight: "DAY",
    intent: "DISCOVER_PLACES",
    page: 1,
    limit: 6,
  });

  const tigerHillCandidate = discoveryResult.results.find((r) => r.place.id === "place_tiger_hill");

  if (!tigerHillCandidate || !tigerHillCandidate.community) {
    throw new Error("Tiger Hill candidate missing community signals in discovery response");
  }

  console.log("   ✅ Discovery Engine candidate includes community highlights:");
  console.log(`      • Place: ${tigerHillCandidate.place.name}`);
  console.log(`      • Score: ${tigerHillCandidate.score}%`);
  console.log(`      • Community Submissions: ${tigerHillCandidate.community.submissionCount}`);
  console.log(`      • Highlights:`);
  tigerHillCandidate.community.highlights.forEach((h) => {
    console.log(`        - [${h.type}] "${h.title}" (${h.supportCount} travelers supported)`);
  });

  console.log("\n=========================================");
  console.log("✨ ALL PHASE 8 COMMUNITY VERIFICATIONS PASSED!");
  console.log("=========================================\n");
}

main().catch((err) => {
  console.error("❌ Phase 8 Verification Failed:", err);
  process.exit(1);
});
