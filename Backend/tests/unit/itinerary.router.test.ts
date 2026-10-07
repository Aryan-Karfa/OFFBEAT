import { describe, it, expect, vi } from "vitest";
import { ItineraryRouter } from "../../src/modules/itinerary/itinerary.router.js";
import type { CandidatePlaceWithSignals } from "../../src/modules/itinerary/itinerary.types.js";

describe("Phase 13: Itinerary Router Unit Tests", () => {
  const mockSerpApi = {
    getDirections: vi.fn().mockResolvedValue(null),
  } as unknown as import("../../src/integrations/serpapi/serpapi.service.js").SerpApiService;
  const router = new ItineraryRouter(mockSerpApi);

  const mockPlaces: CandidatePlaceWithSignals[] = [
    {
      id: "place_south",
      name: "Southern Viewpoint",
      destination: "Darjeeling",
      categories: ["Viewpoint"],
      location: { lat: 26.98, lng: 88.27 },
      timeFit: "GOOD",
      crowdFit: "GOOD",
      isMustVisit: false,
      isAlternative: false,
      score: 1.0,
    },
    {
      id: "place_mid_1",
      name: "Middle Heritage Site",
      destination: "Darjeeling",
      categories: ["Heritage"],
      location: { lat: 27.01, lng: 88.275 },
      timeFit: "GOOD",
      crowdFit: "GOOD",
      isMustVisit: false,
      isAlternative: false,
      score: 1.0,
    },
    {
      id: "place_north",
      name: "Northern Monastery",
      destination: "Darjeeling",
      categories: ["Monastery"],
      location: { lat: 27.05, lng: 88.28 },
      timeFit: "GOOD",
      crowdFit: "GOOD",
      isMustVisit: false,
      isAlternative: false,
      score: 1.0,
    },
  ];

  it("sequences places geographically to avoid excessive zig-zagging / backtracking", async () => {
    // Shuffled order: [South, North, Mid]
    const p0 = mockPlaces[0]!;
    const p1 = mockPlaces[1]!;
    const p2 = mockPlaces[2]!;
    const unorganized: CandidatePlaceWithSignals[] = [p0, p2, p1];

    const routedTransitions = await router.orderGeographically(unorganized, 3);

    expect(routedTransitions).toHaveLength(3);
    const ordered = routedTransitions.map((t) => t.candidate);
    expect(ordered[0]?.id).toBe("place_south");
    expect(ordered[1]?.id).toBe("place_mid_1");
    expect(ordered[2]?.id).toBe("place_north");
  });

  it("prioritizes must-visit places as route anchors", async () => {
    const candidatesWithMustVisit = mockPlaces.map((p) => ({
      ...p,
      isMustVisit: p.id === "place_north",
    }));

    const routedTransitions = await router.orderGeographically(candidatesWithMustVisit, 3);
    expect(routedTransitions[0]?.candidate.id).toBe("place_north");
  });

  it("safely handles candidates without coordinates", async () => {
    const candidateWithoutCoords: CandidatePlaceWithSignals = {
      id: "place_unknown_coords",
      name: "Unknown Coords Place",
      destination: "Darjeeling",
      categories: ["Market"],
      timeFit: "UNKNOWN",
      crowdFit: "UNKNOWN",
      isMustVisit: false,
      isAlternative: false,
      score: 0.7,
    };

    const routedTransitions = await router.orderGeographically(
      [mockPlaces[0]!, candidateWithoutCoords],
      2,
    );

    expect(routedTransitions).toHaveLength(2);
  });

  it("calculates realistic Haversine distance between coordinates", () => {
    const dist = router.calculateDistanceMeters(
      { lat: 26.98, lng: 88.27 },
      { lat: 27.01, lng: 88.275 },
    );
    expect(dist).toBeGreaterThan(1000);
    expect(dist).toBeLessThan(10000);
  });
});
