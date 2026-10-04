import { describe, it, expect } from "vitest";
import {
  calculateCrowdContext,
  evaluateCrowdFit,
} from "../../src/modules/intelligence/crowd/crowd.engine.js";
import type {
  CrowdEngineInput,
  CrowdObservationRecord,
} from "../../src/modules/intelligence/crowd/crowd.types.js";

describe("Phase 10: Crowd Engine Unit Tests", () => {
  it("handles empty observations gracefully without fabricating numbers or percentages", () => {
    const input: CrowdEngineInput = {
      placeId: "place_unknown",
      destinationId: "dest_unknown",
      placeObservations: [],
      destinationObservations: [],
    };

    const result = calculateCrowdContext(input);

    expect(result.overall).toBe("UNKNOWN");
    expect(result.patterns).toEqual([]);
    expect(result.contextualSignals).toEqual([]);
    expect(result.explanation).toContain("Crowd information unavailable");
  });

  it("prioritizes place-level observations over destination-level observations", () => {
    const placeObs: CrowdObservationRecord[] = [
      {
        id: "c_place_1",
        placeId: "place_tiger_hill",
        destinationId: null,
        level: "LOW",
        timeStart: "05:00",
        timeEnd: "06:30",
        dayType: "WEEKDAY",
        season: "ANY",
        observation: "Early weekday morning is quiet",
        source: "COMMUNITY",
        confidence: 0.8,
        createdAt: new Date(),
        expiresAt: null,
      },
    ];

    const destObs: CrowdObservationRecord[] = [
      {
        id: "c_dest_1",
        placeId: null,
        destinationId: "dest_darjeeling",
        level: "HIGH",
        timeStart: "08:00",
        timeEnd: "12:00",
        dayType: "WEEKEND",
        season: "SPRING",
        observation: "Darjeeling weekend mornings are bustling",
        source: "COMMUNITY",
        confidence: 0.7,
        createdAt: new Date(),
        expiresAt: null,
      },
    ];

    const input: CrowdEngineInput = {
      placeId: "place_tiger_hill",
      destinationId: "dest_darjeeling",
      placeObservations: placeObs,
      destinationObservations: destObs,
      dayType: "WEEKDAY",
      time: "05:30",
    };

    const result = calculateCrowdContext(input);

    expect(result.overall).toBe("LOW");
    expect(result.patterns.length).toBeGreaterThanOrEqual(1);
    expect(result.patterns[0]?.level).toBe("LOW");
    expect(result.explanation).toContain("Lower crowd reported during weekday");
  });

  it("filters out expired crowd observations", () => {
    const expiredObs: CrowdObservationRecord[] = [
      {
        id: "c_expired",
        placeId: "place_test",
        destinationId: null,
        level: "VERY_HIGH",
        timeStart: null,
        timeEnd: null,
        dayType: "ANY",
        season: "ANY",
        observation: "Old festival crowd",
        source: "COMMUNITY",
        confidence: 0.5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      },
    ];

    const result = calculateCrowdContext({
      placeId: "place_test",
      placeObservations: expiredObs,
    });

    expect(result.overall).toBe("UNKNOWN");
    expect(result.patterns).toEqual([]);
  });

  it("preserves distinct contextual patterns (e.g. weekday low vs weekend high) without average flattening", () => {
    const placeObs: CrowdObservationRecord[] = [
      {
        id: "c_1",
        placeId: "place_test",
        destinationId: null,
        level: "LOW",
        timeStart: "05:00",
        timeEnd: "06:30",
        dayType: "WEEKDAY",
        season: "ANY",
        observation: "Quiet at dawn",
        source: "COMMUNITY",
        confidence: 0.8,
        createdAt: new Date(),
        expiresAt: null,
      },
      {
        id: "c_2",
        placeId: "place_test",
        destinationId: null,
        level: "HIGH",
        timeStart: "08:00",
        timeEnd: "11:00",
        dayType: "WEEKEND",
        season: "ANY",
        observation: "Heavy weekend crowd",
        source: "COMMUNITY",
        confidence: 0.85,
        createdAt: new Date(),
        expiresAt: null,
      },
    ];

    const result = calculateCrowdContext({
      placeId: "place_test",
      placeObservations: placeObs,
    });

    // Patterns must keep both contexts separate
    expect(result.patterns.length).toBe(2);
    const weekdayPattern = result.patterns.find((p) => p.dayType === "WEEKDAY");
    const weekendPattern = result.patterns.find((p) => p.dayType === "WEEKEND");

    expect(weekdayPattern?.level).toBe("LOW");
    expect(weekendPattern?.level).toBe("HIGH");
  });

  it("evaluates crowd fit based on preferences and experience context", () => {
    // User wants peaceful/less crowded and crowd is LOW -> LOWER_CROWD_MATCH
    const matchFit = evaluateCrowdFit("LOW", ["less_crowded", "peaceful"]);
    expect(matchFit).toBe("LOWER_CROWD_MATCH");

    // User wants less crowded but crowd is HIGH -> HIGHER_CROWD
    const highFit = evaluateCrowdFit("HIGH", ["less_crowded"]);
    expect(highFit).toBe("HIGHER_CROWD");

    // User has general preference, crowd is MODERATE -> NEUTRAL
    const neutralFit = evaluateCrowdFit("MODERATE", ["photography"]);
    expect(neutralFit).toBe("NEUTRAL");

    // Crowd is UNKNOWN -> UNKNOWN
    const unknownFit = evaluateCrowdFit("UNKNOWN", ["less_crowded"]);
    expect(unknownFit).toBe("UNKNOWN");
  });
});
