import { describe, it, expect } from "vitest";
import { ItineraryService } from "../../src/modules/itinerary/itinerary.service.js";
import type { ValidatedCreateItineraryRequest } from "../../src/modules/itinerary/itinerary.schema.js";

describe("Phase 13: Itinerary Service Unit Tests", () => {
  const service = new ItineraryService();

  const baseRequest: ValidatedCreateItineraryRequest = {
    country: "India",
    regionId: "region_west_bengal",
    destinationId: "dest_darjeeling",
    travelTaste: ["mountains", "photography"],
    experienceTaste: ["sunrise", "nature"],
    dayNight: "DAY",
    preferredStartTime: "06:00",
    preferredEndTime: "20:00",
    durationDays: 1,
    pace: "BALANCED",
    intent: "EXPLORE",
    mustVisitPlaceIds: ["place_tiger_hill"],
    selectedAlternativePlaceIds: [],
    avoidPlaceIds: [],
  };

  it("generates a complete valid itinerary for Darjeeling with day stops and why explanations", async () => {
    const itinerary = await service.createItinerary(baseRequest);

    expect(itinerary).toBeDefined();
    expect(itinerary.id).toBeDefined();
    expect(itinerary.destination).toBe("Darjeeling");
    expect(itinerary.durationDays).toBe(1);
    expect(itinerary.pace).toBe("BALANCED");
    expect(itinerary.days).toHaveLength(1);

    const day1 = itinerary.days[0]!;
    expect(day1.day).toBe(1);
    expect(day1.stops.length).toBeGreaterThanOrEqual(1);

    // Verify must-visit place was scheduled
    const tigerHillStop = day1.stops.find((s) => s.placeId === "place_tiger_hill");
    expect(tigerHillStop).toBeDefined();
    expect(tigerHillStop?.name).toBe("Tiger Hill");
    expect(tigerHillStop?.why).toBeDefined();

    // Verify reasoning explanation
    expect(itinerary.reasoning).toBeDefined();
    expect(itinerary.reasoning?.explanation).toBeDefined();
    expect(itinerary.source).toBeDefined();
  }, 15000);

  it("persists generated itineraries and retrieves by ID", async () => {
    const created = await service.createItinerary(baseRequest);
    const retrieved = await service.getItinerary(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.destination).toBe(created.destination);
  });

  it("returns null for non-existent itinerary ID", async () => {
    const nonexistent = await service.getItinerary("nonexistent_itinerary_id");
    expect(nonexistent).toBeNull();
  });

  it("preserves selectedAlternativePlaceIds into the candidate pool", async () => {
    const reqWithAlt: ValidatedCreateItineraryRequest = {
      ...baseRequest,
      selectedAlternativePlaceIds: ["place_batasia_loop"],
    };

    const itinerary = await service.createItinerary(reqWithAlt);
    const stopIds = itinerary.days[0]!.stops.map((s) => s.placeId);
    expect(stopIds).toContain("place_batasia_loop");
  });

  it("strictly honors avoidPlaceIds by excluding them from the itinerary", async () => {
    const reqWithAvoid: ValidatedCreateItineraryRequest = {
      ...baseRequest,
      mustVisitPlaceIds: [],
      avoidPlaceIds: ["place_tiger_hill"],
    };

    const itinerary = await service.createItinerary(reqWithAvoid);
    const stopIds = itinerary.days[0]!.stops.map((s) => s.placeId);
    expect(stopIds).not.toContain("place_tiger_hill");
  });
});
