/**
 * OFFBEAT — Phase 10 Verification Script
 * Validates Time & Crowd Intelligence Engine:
 * - Deterministic Time Intelligence: Operating Hours (fact) + Available Windows + Community Timing
 * - Deterministic Crowd Intelligence: Contextual patterns without statistical hallucination
 * - TimeObservation & CrowdObservation Persistence
 * - Freshness & Expiration Handling
 * - Place Detail & Discovery Engine Enrichment
 * - Source Transparency (Facts vs Community vs System)
 */
import {
  calculateTimeIntelligence,
  parseOperatingHours,
  evaluateTimeFit,
} from "../Backend/src/modules/intelligence/time/time.engine.js";
import {
  calculateCrowdIntelligence,
  evaluateCrowdFit,
} from "../Backend/src/modules/intelligence/crowd/crowd.engine.js";
import { timeService } from "../Backend/src/modules/intelligence/time/time.service.js";
import { crowdService } from "../Backend/src/modules/intelligence/crowd/crowd.service.js";
import { placeService } from "../Backend/src/modules/places/places.service.js";
import { discoveryService } from "../Backend/src/modules/discovery/discovery.service.js";

async function main() {
  console.log("=== OFFBEAT PHASE 10 VERIFICATION SUITE ===");

  // 1. Time Engine Verification
  console.log("1. Verifying Deterministic Time Engine & Priority Sequence...");
  const sampleRawHours = [
    "Monday: 04:00 AM – 6:00 PM",
    "Tuesday: 04:00 AM – 6:00 PM",
    "Wednesday: Closed",
    "Thursday: Open 24 hours",
  ];
  const parsedHours = parseOperatingHours(sampleRawHours);
  if (parsedHours.schedule.length !== 4) {
    throw new Error(`Expected 4 parsed schedule windows, got ${parsedHours.schedule.length}`);
  }
  const closedDay = parsedHours.schedule.find((s) => s.day === "Wednesday");
  if (!closedDay?.closed) {
    throw new Error("Closed day was not properly identified as closed!");
  }
  const allDay = parsedHours.schedule.find((s) => s.day === "Thursday");
  if (!allDay?.is24Hours) {
    throw new Error("24-hour day was not properly identified as 24-hours!");
  }

  const timeResult = calculateTimeIntelligence({
    placeId: "place_test",
    openingHours: sampleRawHours,
    userDayNight: "DAY",
    observations: [
      {
        id: "time_obs_demo_1",
        placeId: "place_test",
        type: "BEST_TIME",
        startTime: "04:30",
        endTime: "05:30",
        dayType: "WEEKDAY",
        observation: "Sunrise viewing before crowds gather",
        source: "COMMUNITY",
        confidence: 0.88,
        createdAt: new Date(),
        expiresAt: null,
      },
    ],
  });

  if (timeResult.recommendedTimes.length < 1) {
    throw new Error("Recommended times missing from time engine calculation!");
  }
  if (timeResult.recommendedTimes[0]?.source !== "COMMUNITY") {
    throw new Error("Community recommendation incorrectly labeled as external fact!");
  }
  if (timeResult.availableWindows[0]?.source !== "EXTERNAL") {
    throw new Error("Operating window incorrectly labeled as community recommendation!");
  }
  console.log(
    "   ✅ Strict separation of facts (EXTERNAL) vs recommendations (COMMUNITY) verified.",
  );
  console.log(
    `      • Operating Window: ${timeResult.availableWindows[0]?.start} – ${timeResult.availableWindows[0]?.end}`,
  );
  console.log(
    `      • Recommended Time: ${timeResult.recommendedTimes[0]?.start} – ${timeResult.recommendedTimes[0]?.end}`,
  );
  console.log(`      • Explanation: "${timeResult.explanation.slice(0, 60)}..."`);

  // 2. Day/Night Compatibility & Fit Evaluation
  console.log("2. Verifying Day/Night Fit & Compatibility Evaluation...");
  const nightConflict = evaluateTimeFit(
    "NIGHT",
    null,
    ["sunrise"],
    [{ start: "05:00", end: "06:15", reason: "Sunrise", source: "COMMUNITY" }],
  );
  if (nightConflict !== "CONFLICT") {
    throw new Error(`Expected CONFLICT for NIGHT request with sunrise tip, got ${nightConflict}`);
  }
  const dayMatch = evaluateTimeFit(
    "DAY",
    null,
    ["sunrise"],
    [{ start: "05:00", end: "06:15", reason: "Sunrise", source: "COMMUNITY" }],
  );
  if (dayMatch !== "GOOD") {
    throw new Error(`Expected GOOD for DAY request with sunrise tip, got ${dayMatch}`);
  }
  console.log("   ✅ Deterministic day/night compatibility matching verified.");

  // 3. Crowd Engine Verification (No Statistical Hallucination)
  console.log("3. Verifying Crowd Engine Determinism & Contextual Patterns...");
  const crowdEmpty = calculateCrowdIntelligence({
    placeId: "place_empty",
    placeObservations: [],
  });
  if (crowdEmpty.overall !== "UNKNOWN") {
    throw new Error(`Fabricated crowd level on empty observations: ${crowdEmpty.overall}`);
  }
  if (crowdEmpty.confidence !== 0) {
    throw new Error(`Fabricated confidence score on empty crowd: ${crowdEmpty.confidence}`);
  }
  console.log("   ✅ Graceful degradation verified: Zero crowd hallucination on missing data.");

  const crowdWithContext = calculateCrowdIntelligence({
    placeId: "place_tiger_hill",
    placeObservations: [
      {
        id: "c_obs_1",
        placeId: "place_tiger_hill",
        level: "LOW",
        timeStart: "05:00",
        timeEnd: "06:30",
        dayType: "WEEKDAY",
        season: "ANY",
        observation: "Dawn is quiet and serene",
        source: "COMMUNITY",
        createdAt: new Date(),
        expiresAt: null,
      },
      {
        id: "c_obs_2",
        placeId: "place_tiger_hill",
        level: "HIGH",
        timeStart: "08:00",
        timeEnd: "10:30",
        dayType: "WEEKEND",
        season: "ANY",
        observation: "Weekend tourist rush",
        source: "COMMUNITY",
        createdAt: new Date(),
        expiresAt: null,
      },
    ],
  });

  if (crowdWithContext.patterns.length !== 2) {
    throw new Error(`Expected 2 distinct patterns, got ${crowdWithContext.patterns.length}`);
  }
  const weekdayPattern = crowdWithContext.patterns.find((p) => p.dayType === "WEEKDAY");
  const weekendPattern = crowdWithContext.patterns.find((p) => p.dayType === "WEEKEND");
  if (weekdayPattern?.level !== "LOW" || weekendPattern?.level !== "HIGH") {
    throw new Error("Contextual patterns (weekday vs weekend) were incorrectly averaged!");
  }
  const lowCrowdFit = evaluateCrowdFit("LOW", ["less_crowded"]);
  if (lowCrowdFit !== "LOWER_CROWD_MATCH") {
    throw new Error(`Expected LOWER_CROWD_MATCH, got ${lowCrowdFit}`);
  }
  console.log("   ✅ Contextual crowd aggregation verified without average flattening.");
  console.log(`      • Weekday 05:00-06:30: ${weekdayPattern?.level}`);
  console.log(`      • Weekend 08:00-10:30: ${weekendPattern?.level}`);

  // 4. Freshness and Expiry Handling
  console.log("4. Verifying Observation Freshness & Expiry Exclusion...");
  const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const crowdExpired = calculateCrowdIntelligence({
    placeId: "place_expired",
    placeObservations: [
      {
        id: "c_expired_1",
        placeId: "place_expired",
        level: "VERY_HIGH",
        dayType: "ANY",
        season: "ANY",
        source: "COMMUNITY",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        expiresAt: expiredDate,
      },
    ],
  });
  if (crowdExpired.patterns.length !== 0 || crowdExpired.overall !== "UNKNOWN") {
    throw new Error("Expired crowd observation was incorrectly factored into active intelligence!");
  }
  console.log("   ✅ Expired observations excluded from current intelligence.");

  // 5. Persistence via Time & Crowd Services
  console.log("5. Verifying Time & Crowd Observation Persistence...");
  const createdTime = await timeService.createTimeObservation(
    "place_tiger_hill",
    {
      type: "BEST_TIME",
      startTime: "05:15",
      endTime: "06:15",
      dayType: "WEEKDAY",
      observation: "Golden hour illumination on Eastern Himalayas",
    },
    "user_demo_traveler",
  );
  if (!createdTime.id || createdTime.source !== "COMMUNITY") {
    throw new Error("Failed to persist TimeObservation!");
  }

  const createdCrowd = await crowdService.createCrowdObservation(
    {
      level: "LOW",
      timeStart: "05:15",
      timeEnd: "06:15",
      dayType: "WEEKDAY",
      season: "SPRING",
      observation: "Sparse traveler presence at top deck",
    },
    "user_demo_traveler",
    "place_tiger_hill",
  );
  if (!createdCrowd.id || createdCrowd.level !== "LOW") {
    throw new Error("Failed to persist CrowdObservation!");
  }
  console.log(
    `   ✅ Persisted TimeObservation (${createdTime.id}) and CrowdObservation (${createdCrowd.id}).`,
  );

  // 6. Place Detail Intelligence Enrichment
  console.log("6. Verifying Place Detail API Enrichment with Phase 10 Intelligence...");
  const placeDetail = await placeService.getPlaceById("place_tiger_hill");
  if (!placeDetail.timeIntelligence || !placeDetail.crowdIntelligence) {
    throw new Error("Place Detail DTO missing timeIntelligence or crowdIntelligence!");
  }
  if (placeDetail.timeIntelligence.recommendedTimes.length < 1) {
    throw new Error("Place Detail time intelligence missing recommended times!");
  }
  if (placeDetail.crowdIntelligence.patterns.length < 1) {
    throw new Error("Place Detail crowd intelligence missing crowd patterns!");
  }
  console.log("   ✅ Place Detail successfully enriched with Time & Crowd Intelligence.");
  console.log(`      • Place: ${placeDetail.name}`);
  console.log(
    `      • Operating Hours: ${placeDetail.timeIntelligence.operatingHours.rawText || "Parsed"}`,
  );
  console.log(
    `      • Recommended Window: ${placeDetail.timeIntelligence.recommendedTimes[0]?.start} – ${placeDetail.timeIntelligence.recommendedTimes[0]?.end} (${placeDetail.timeIntelligence.recommendedTimes[0]?.reason})`,
  );
  console.log(
    `      • Crowd Level: ${placeDetail.crowdIntelligence.overall} (${placeDetail.crowdIntelligence.patterns.length} patterns)`,
  );

  // 7. Discovery Engine Enrichment
  console.log("7. Verifying Discovery Engine Enrichment (bestTime, crowd, timeFit, crowdFit)...");
  const discoveryResult = await discoveryService.discover(
    {
      regionId: "IN-WB",
      destination: "dest_darjeeling",
      travelTaste: ["mountains"],
      experienceTaste: ["sunrise"],
      dayNight: "DAY",
      intent: "DISCOVER_PLACES",
      page: 1,
      limit: 10,
    },
    "phase_10_verifier",
  );

  if (discoveryResult.results.length === 0) {
    throw new Error("Discovery returned no candidate results!");
  }

  const enrichedPlace = discoveryResult.results.find(
    (r) => r.bestTime !== undefined && r.crowd !== undefined,
  );
  if (!enrichedPlace) {
    throw new Error("No discovery result item was enriched with bestTime and crowd!");
  }

  console.log("   ✅ Discovery candidate items successfully enriched with Phase 10 intelligence:");
  console.log(`      • Candidate Place: ${enrichedPlace.place.name}`);
  console.log(
    `      • Best Time: ${enrichedPlace.bestTime?.start} – ${enrichedPlace.bestTime?.end} [${enrichedPlace.bestTime?.source}]`,
  );
  console.log(
    `      • Crowd Expectation: ${enrichedPlace.crowd?.level} [${enrichedPlace.crowd?.source}]`,
  );
  console.log(`      • Time Fit: ${enrichedPlace.timeFit}, Crowd Fit: ${enrichedPlace.crowdFit}`);

  console.log("\n>>> ALL PHASE 10 VERIFICATION CHECKS PASSED DETERMINISTICALLY! <<<");
}

main().catch((err) => {
  console.error("\n❌ PHASE 10 VERIFICATION FAILED:", err);
  process.exit(1);
});
