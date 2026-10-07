import { describe, it, expect } from "vitest";
import { ItineraryScheduler } from "../../src/modules/itinerary/itinerary.scheduler.js";
import type { CandidatePlaceWithSignals } from "../../src/modules/itinerary/itinerary.types.js";
import type { RoutedStopTransition } from "../../src/modules/itinerary/itinerary.router.js";

describe("Phase 13: Itinerary Scheduler Unit Tests", () => {
  const scheduler = new ItineraryScheduler();

  const mockCandidates: CandidatePlaceWithSignals[] = [
    {
      id: "place_1",
      name: "Tiger Hill Sunrise",
      destination: "Darjeeling",
      categories: ["Viewpoint"],
      location: { lat: 26.995, lng: 88.286 },
      timeFit: "GOOD",
      crowdFit: "GOOD",
      recommendedTime: { start: "06:00", end: "08:00", reason: "Sunrise panorama" },
      isMustVisit: true,
      isAlternative: false,
      score: 1.0,
    },
    {
      id: "place_2",
      name: "Batasia Loop",
      destination: "Darjeeling",
      categories: ["Heritage"],
      location: { lat: 27.016, lng: 88.252 },
      timeFit: "GOOD",
      crowdFit: "GOOD",
      isMustVisit: false,
      isAlternative: false,
      score: 0.9,
    },
    {
      id: "place_3",
      name: "Peace Pagoda",
      destination: "Darjeeling",
      categories: ["Culture", "Temple"],
      location: { lat: 27.03, lng: 88.26 },
      timeFit: "GOOD",
      crowdFit: "GOOD",
      isMustVisit: false,
      isAlternative: false,
      score: 0.88,
    },
  ];

  const mockRoutedStops: RoutedStopTransition[] = mockCandidates.map((c, i) => ({
    candidate: c,
    travelFromPreviousMinutes: i === 0 ? 0 : 25,
    travelDistanceMeters: i === 0 ? 0 : 5000,
  }));

  it("schedules stops respecting requested start time and generates non-overlapping chronological times", () => {
    const days = scheduler.scheduleDays(mockRoutedStops, {
      durationDays: 1,
      pace: "BALANCED",
      preferredStartTime: "06:00",
      preferredEndTime: "20:00",
      destinationName: "Darjeeling",
    });

    expect(days).toHaveLength(1);
    const day = days[0]!;
    expect(day.stops.length).toBeGreaterThanOrEqual(2);

    // Check chronological order
    for (let i = 0; i < day.stops.length - 1; i++) {
      const current = day.stops[i]!;
      const next = day.stops[i + 1]!;
      expect(current.arrivalTime <= current.departureTime).toBe(true);
      expect(current.departureTime <= next.arrivalTime).toBe(true);
    }
  });

  it("injects dedicated free time / lunch window around midday", () => {
    const days = scheduler.scheduleDays(mockRoutedStops, {
      durationDays: 1,
      pace: "BALANCED",
      preferredStartTime: "06:00",
      preferredEndTime: "19:00",
      destinationName: "Darjeeling",
    });

    const day = days[0]!;
    const freeTimeStop = day.stops.find((s) => s.isFreeTime === true);
    expect(freeTimeStop).toBeDefined();
    expect(freeTimeStop?.name).toContain("Lunch & Local Exploration");
    expect(freeTimeStop?.durationMinutes).toBeGreaterThanOrEqual(40);
  });

  it("applies longer stop durations and buffers in RELAXED pace vs PACKED pace", () => {
    const relaxedDays = scheduler.scheduleDays(mockRoutedStops, {
      durationDays: 1,
      pace: "RELAXED",
      preferredStartTime: "08:00",
      preferredEndTime: "18:00",
      destinationName: "Darjeeling",
    });

    const packedDays = scheduler.scheduleDays(mockRoutedStops, {
      durationDays: 1,
      pace: "PACKED",
      preferredStartTime: "08:00",
      preferredEndTime: "18:00",
      destinationName: "Darjeeling",
    });

    const relaxedNonFreeStops = relaxedDays[0]!.stops.filter((s) => !s.isFreeTime);
    const packedNonFreeStops = packedDays[0]!.stops.filter((s) => !s.isFreeTime);

    if (relaxedNonFreeStops.length > 0 && packedNonFreeStops.length > 0) {
      expect(relaxedNonFreeStops[0]!.durationMinutes).toBeGreaterThan(
        packedNonFreeStops[0]!.durationMinutes,
      );
    }
  });

  it("flags CONFLICT if a place cannot fit inside operating hours without fabricating hours", () => {
    const conflictCandidate: CandidatePlaceWithSignals = {
      id: "place_night_only",
      name: "Night Club Only",
      destination: "Darjeeling",
      categories: ["Nightlife"],
      location: { lat: 27.04, lng: 88.26 },
      timeFit: "CONFLICT",
      crowdFit: "GOOD",
      isMustVisit: true,
      isAlternative: false,
      score: 0.9,
    };

    const conflictRouted: RoutedStopTransition[] = [
      {
        candidate: conflictCandidate,
        travelFromPreviousMinutes: 0,
        travelDistanceMeters: 0,
      },
    ];

    const days = scheduler.scheduleDays(conflictRouted, {
      durationDays: 1,
      pace: "BALANCED",
      preferredStartTime: "09:00",
      preferredEndTime: "17:00",
      destinationName: "Darjeeling",
    });

    const stop = days[0]!.stops.find((s) => s.placeId === "place_night_only");
    expect(stop).toBeDefined();
    expect(stop?.timeFit).toBe("CONFLICT");
  });
});
