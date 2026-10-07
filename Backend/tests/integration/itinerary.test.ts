import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Phase 13: Itinerary API Integration Tests", () => {
  const app = createApp();

  const validPayload = {
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
  };

  it("POST /api/v1/itineraries returns 201 with full itinerary payload", async () => {
    const res = await request(app).post("/api/v1/itineraries").send(validPayload).expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const itinerary = res.body.data;
    expect(itinerary.id).toBeDefined();
    expect(itinerary.destination).toBe("Darjeeling");
    expect(itinerary.durationDays).toBe(1);
    expect(itinerary.pace).toBe("BALANCED");
    expect(Array.isArray(itinerary.days)).toBe(true);
    expect(itinerary.days.length).toBe(1);

    const day1 = itinerary.days[0];
    expect(day1.stops.length).toBeGreaterThanOrEqual(1);
    expect(day1.stops.some((s: { placeId?: string }) => s.placeId === "place_tiger_hill")).toBe(
      true,
    );

    // Verify stop properties
    const stop = day1.stops[0];
    expect(stop.name).toBeDefined();
    expect(stop.arrivalTime).toBeDefined();
    expect(stop.departureTime).toBeDefined();
    expect(stop.durationMinutes).toBeGreaterThan(0);
    expect(stop.why).toBeDefined();
    expect(stop.timeFit).toBeDefined();
    expect(stop.crowdFit).toBeDefined();
  });

  it("GET /api/v1/itineraries/:itineraryId retrieves a previously created itinerary", async () => {
    // 1. Create
    const createRes = await request(app).post("/api/v1/itineraries").send(validPayload).expect(201);

    const createdId = createRes.body.data.id;

    // 2. Retrieve
    const getRes = await request(app).get(`/api/v1/itineraries/${createdId}`).expect(200);

    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.id).toBe(createdId);
    expect(getRes.body.data.destination).toBe("Darjeeling");
  });

  it("POST /api/v1/itineraries rejects invalid request payloads with 400 Bad Request", async () => {
    const invalidPayload = {
      country: "", // invalid empty string
      durationDays: 0, // must be >= 1
      pace: "HYPER_FAST", // invalid enum
    };

    const res = await request(app).post("/api/v1/itineraries").send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/v1/itineraries/:itineraryId returns 404 for unknown itinerary ID", async () => {
    const res = await request(app).get("/api/v1/itineraries/nonexistent_itinerary_12345");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain("not found");
  });
});
