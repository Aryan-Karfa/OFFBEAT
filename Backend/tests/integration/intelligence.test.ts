import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import type {
  TimeIntelligenceDto,
  CrowdIntelligenceDto,
  PlaceDetailDto,
  DiscoveryResponseDataDto,
  DiscoveryResultItemDto,
} from "@offbeat/shared";

describe("Phase 10: Time & Crowd Intelligence Integration Tests", () => {
  const app = createApp();
  const tigerHillId = "place_tiger_hill";

  describe("GET /api/v1/places/:placeId/times", () => {
    it("returns 200 with structured time intelligence for Tiger Hill", async () => {
      const res = await request(app).get(`/api/v1/places/${tigerHillId}/times`).expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data as TimeIntelligenceDto;

      expect(data.operatingHours).toBeDefined();
      expect(Array.isArray(data.operatingHours.schedule)).toBe(true);
      expect(Array.isArray(data.recommendedTimes)).toBe(true);
      expect(data.recommendedTimes.length).toBeGreaterThanOrEqual(1);

      // Verify Tiger Hill's recommended sunrise window from seed data
      const sunriseRec = data.recommendedTimes.find((r) => r.start === "04:30");
      expect(sunriseRec).toBeDefined();
      expect(sunriseRec?.source).toBe("COMMUNITY");
      expect(sunriseRec?.reason).toContain("unobstructed eastern view");

      expect(Array.isArray(data.availableWindows)).toBe(true);
      expect(typeof data.explanation).toBe("string");
      expect(data.explanation.length).toBeGreaterThan(0);
    });

    it("returns 404 for non-existent place", async () => {
      const res = await request(app).get("/api/v1/places/place_unknown_9999/times").expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /api/v1/places/:placeId/crowd", () => {
    it("returns 200 with structured crowd intelligence for Tiger Hill", async () => {
      const res = await request(app).get(`/api/v1/places/${tigerHillId}/crowd`).expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data as CrowdIntelligenceDto;

      expect(["LOW", "MODERATE", "HIGH", "VERY_HIGH", "UNKNOWN"]).toContain(data.overall);
      expect(Array.isArray(data.patterns)).toBe(true);
      expect(data.patterns.length).toBeGreaterThanOrEqual(1);

      // Verify weekday vs weekend separation in seed patterns
      const weekdayPattern = data.patterns.find((p) => p.dayType === "WEEKDAY");
      expect(weekdayPattern).toBeDefined();
      expect(weekdayPattern?.level).toBe("LOW");
      expect(weekdayPattern?.source).toBe("COMMUNITY");

      expect(typeof data.confidence).toBe("number");
      expect(typeof data.explanation).toBe("string");
    });

    it("returns 404 for non-existent place", async () => {
      const res = await request(app).get("/api/v1/places/place_unknown_9999/crowd").expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("POST /api/v1/places/:placeId/time-observations", () => {
    it("creates a structured time observation with 201 status", async () => {
      const res = await request(app)
        .post(`/api/v1/places/${tigerHillId}/time-observations`)
        .set("x-user-id", "user_demo_traveler")
        .send({
          type: "BEST_TIME",
          startTime: "05:00",
          endTime: "06:15",
          dayType: "WEEKDAY",
          observation: "Optimal morning glow on Kanchenjunga",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.source).toBe("COMMUNITY");
      expect(res.body.data.startTime).toBe("05:00");
    });

    it("rejects invalid time formats with 400 status", async () => {
      const res = await request(app)
        .post(`/api/v1/places/${tigerHillId}/time-observations`)
        .send({
          type: "BEST_TIME",
          startTime: "25:99", // invalid
          endTime: "06:00",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/v1/places/:placeId/crowd-observations", () => {
    it("creates a structured crowd observation with 201 status", async () => {
      const res = await request(app)
        .post(`/api/v1/places/${tigerHillId}/crowd-observations`)
        .set("x-user-id", "user_demo_traveler")
        .send({
          level: "MODERATE",
          timeStart: "06:30",
          timeEnd: "08:00",
          dayType: "WEEKEND",
          season: "SPRING",
          observation: "Post-sunrise crowd thinning out",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.level).toBe("MODERATE");
      expect(res.body.data.source).toBe("COMMUNITY");
    });

    it("rejects invalid crowd level with 400 status", async () => {
      const res = await request(app)
        .post(`/api/v1/places/${tigerHillId}/crowd-observations`)
        .send({
          level: "SUPER_PACKED", // invalid level
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/v1/destinations/:destinationId/crowd", () => {
    it("returns destination level crowd patterns", async () => {
      const res = await request(app).get("/api/v1/destinations/dest_darjeeling/crowd").expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.patterns).toBeDefined();
      expect(Array.isArray(res.body.data.patterns)).toBe(true);
    });
  });

  describe("Place Detail Enrichment Integration", () => {
    it("GET /api/v1/places/:id includes timeIntelligence and crowdIntelligence", async () => {
      const res = await request(app).get(`/api/v1/places/${tigerHillId}`).expect(200);

      expect(res.body.success).toBe(true);
      const place = res.body.data as PlaceDetailDto;

      expect(place.id).toBe(tigerHillId);
      expect(place.timeIntelligence).toBeDefined();
      expect(place.timeIntelligence?.recommendedTimes.length).toBeGreaterThanOrEqual(1);

      expect(place.crowdIntelligence).toBeDefined();
      expect(place.crowdIntelligence?.patterns.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Discovery Engine Enrichment Integration", () => {
    it("POST /api/v1/discover enriches candidate places with bestTime, crowd, timeFit, crowdFit", async () => {
      const res = await request(app)
        .post("/api/v1/discover")
        .send({
          regionId: "IN-WB",
          destination: "dest_darjeeling",
          travelTaste: ["mountains"],
          experienceTaste: ["sunrise"],
          dayNight: "DAY",
          limit: 10,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data as DiscoveryResponseDataDto;

      expect(data.results.length).toBeGreaterThan(0);

      // Find Tiger Hill in results
      const tigerHill = data.results.find(
        (r: DiscoveryResultItemDto) =>
          r.place.name.includes("Tiger Hill") || r.place.id === tigerHillId,
      );
      if (tigerHill) {
        expect(tigerHill.bestTime).toBeDefined();
        expect(tigerHill.bestTime?.source).toBe("COMMUNITY");
        expect(["04:30", "05:00"]).toContain(tigerHill.bestTime?.start);

        expect(tigerHill.crowd).toBeDefined();
        expect(["LOW", "MODERATE"]).toContain(tigerHill.crowd?.level);
        expect(tigerHill.crowd?.source).toBe("COMMUNITY");

        expect(tigerHill.timeFit).toBeDefined();
        expect(tigerHill.crowdFit).toBeDefined();
      }
    });
  });
});
