import { describe, it, expect } from "vitest";
import {
  calculateTimeIntelligence,
  parseOperatingHoursList,
  evaluateTimeFit,
} from "../../src/modules/intelligence/time/time.engine.js";
import type {
  TimeEngineInput,
  TimeObservationRecord,
} from "../../src/modules/intelligence/time/time.types.js";

describe("Phase 10: Time Engine Unit Tests", () => {
  it("handles opening hours available with single window", () => {
    const rawHours = ["Monday: 9:00 AM – 5:00 PM", "Tuesday: 9:00 AM – 5:00 PM"];
    const parsed = parseOperatingHoursList(rawHours);

    expect(parsed.raw).toEqual(rawHours);
    expect(parsed.schedule.length).toBe(2);
    expect(parsed.schedule[0]?.open).toBe("09:00");
    expect(parsed.schedule[0]?.close).toBe("17:00");
    expect(parsed.schedule[0]?.closed).toBe(false);

    const input: TimeEngineInput = {
      placeId: "place_test_1",
      openingHours: rawHours,
      observations: [],
    };
    const result = calculateTimeIntelligence(input);
    expect(result.operatingHours.schedule.length).toBe(2);
    expect(result.availableWindows.length).toBeGreaterThanOrEqual(1);
    expect(result.availableWindows[0]?.source).toBe("EXTERNAL");
  });

  it("handles opening hours unavailable without guessing", () => {
    const input: TimeEngineInput = {
      placeId: "place_test_2",
      openingHours: null,
      observations: [],
    };
    const result = calculateTimeIntelligence(input);

    expect(result.operatingHours.raw).toEqual([]);
    expect(result.operatingHours.schedule).toEqual([]);
    expect(result.availableWindows).toEqual([]);
    expect(result.explanation).toContain(
      "Operating hours and timing recommendations are not yet recorded",
    );
  });

  it("handles closed day and 24-hour windows correctly", () => {
    const rawHours = [
      "Monday: Closed",
      "Tuesday: Open 24 hours",
      "Wednesday: 06:00 - 12:00, 15:00 - 20:00",
    ];
    const parsed = parseOperatingHoursList(rawHours);

    const mon = parsed.schedule.find((s) => s.day === "Monday");
    expect(mon?.closed).toBe(true);
    expect(mon?.open).toBeNull();

    const tue = parsed.schedule.find((s) => s.day === "Tuesday");
    expect(tue?.open).toBe("00:00");
    expect(tue?.close).toBe("24:00");
    expect(tue?.closed).toBe(false);

    const wed = parsed.schedule.find((s) => s.day === "Wednesday");
    expect(wed?.windows?.length).toBe(2);
    expect(wed?.windows?.[0]?.open).toBe("06:00");
    expect(wed?.windows?.[1]?.close).toBe("20:00");
  });

  it("incorporates community recommendations while keeping source as COMMUNITY", () => {
    const obs: TimeObservationRecord[] = [
      {
        id: "obs_1",
        placeId: "place_tiger_hill",
        type: "BEST_TIME",
        startTime: "04:30",
        endTime: "05:30",
        dayType: "WEEKDAY",
        observation: "Arrive early for sunrise positioning",
        source: "COMMUNITY",
        confidence: 0.85,
        createdAt: new Date(),
        expiresAt: null,
      },
    ];

    const input: TimeEngineInput = {
      placeId: "place_tiger_hill",
      openingHours: ["Every day: 04:00 AM – 6:00 PM"],
      observations: obs,
    };

    const result = calculateTimeIntelligence(input);
    expect(result.recommendedTimes.length).toBe(1);
    expect(result.recommendedTimes[0]?.source).toBe("COMMUNITY");
    expect(result.recommendedTimes[0]?.start).toBe("04:30");
    expect(result.recommendedTimes[0]?.end).toBe("05:30");
    expect(result.recommendedTimes[0]?.reason).toContain("sunrise positioning");
    expect(result.explanation).toContain("Community travelers recommend");
  });

  it("excludes expired observations from recommendations", () => {
    const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
    const obs: TimeObservationRecord[] = [
      {
        id: "obs_expired",
        placeId: "place_test",
        type: "BEST_TIME",
        startTime: "07:00",
        endTime: "08:00",
        dayType: "ANY",
        observation: "Old tip",
        source: "COMMUNITY",
        confidence: 0.5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        expiresAt: expiredDate,
      },
    ];

    const result = calculateTimeIntelligence({
      placeId: "place_test",
      openingHours: null,
      observations: obs,
    });

    expect(result.recommendedTimes.length).toBe(0);
    expect(result.signals.length).toBe(0);
  });

  it("preserves conflicting community observations rather than flattening them", () => {
    const obs: TimeObservationRecord[] = [
      {
        id: "obs_a",
        placeId: "place_test",
        type: "LOW_CROWD_TIME",
        startTime: "06:00",
        endTime: "07:00",
        dayType: "WEEKDAY",
        observation: "Quiet at 6 AM",
        source: "COMMUNITY",
        confidence: 0.7,
        createdAt: new Date(),
        expiresAt: null,
      },
      {
        id: "obs_b",
        placeId: "place_test",
        type: "LOW_CROWD_TIME",
        startTime: "08:00",
        endTime: "09:00",
        dayType: "WEEKDAY",
        observation: "Quiet at 8 AM",
        source: "COMMUNITY",
        confidence: 0.6,
        createdAt: new Date(),
        expiresAt: null,
      },
    ];

    const result = calculateTimeIntelligence({
      placeId: "place_test",
      observations: obs,
    });

    expect(result.recommendedTimes.length).toBe(2);
    expect(result.recommendedTimes[0]?.start).toBe("06:00");
    expect(result.recommendedTimes[1]?.start).toBe("08:00");
  });

  it("evaluates day/night compatibility accurately", () => {
    // Night requested, sunrise window (05:00) -> CONFLICT
    const conflictFit = evaluateTimeFit(
      "NIGHT",
      undefined,
      ["sunrise"],
      [{ start: "05:00", end: "06:00", reason: "Sunrise", source: "COMMUNITY" }],
    );
    expect(conflictFit).toBe("CONFLICT");

    // Day requested, morning window (09:00) -> GOOD
    const goodFit = evaluateTimeFit(
      "DAY",
      "09:00",
      [],
      [{ start: "08:30", end: "11:00", reason: "Morning", source: "COMMUNITY" }],
    );
    expect(goodFit).toBe("GOOD");

    // Any requested -> GOOD
    const anyFit = evaluateTimeFit(
      "ANY",
      undefined,
      [],
      [{ start: "05:00", end: "06:00", reason: "Sunrise", source: "COMMUNITY" }],
    );
    expect(anyFit).toBe("GOOD");

    // No context, no times -> UNKNOWN
    const unknownFit = evaluateTimeFit(undefined, undefined, [], []);
    expect(unknownFit).toBe("UNKNOWN");
  });
});
