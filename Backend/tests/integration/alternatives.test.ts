import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Phase 12: Find An Alternative API Integration Tests", () => {
  const app = createApp();

  it("GET /api/v1/places/place_tiger_hill/alternatives returns 200 with all default fields", async () => {
    const res = await request(app).get("/api/v1/places/place_tiger_hill/alternatives");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const data = res.body.data;
    expect(data.originalPlace).toBeDefined();
    expect(data.originalPlace.id).toBe("place_tiger_hill");
    expect(data.originalPlace.name).toBe("Tiger Hill");
    expect(data.mode).toBe("REPLACEMENT");
    expect(Array.isArray(data.alternatives)).toBe(true);
    expect(data.reasoning).toBeDefined();
    expect(data.reasoning.explanation).toBeDefined();

    // Verify original place is never included in the alternatives
    expect(
      data.alternatives.some((a: { placeId?: string }) => a.placeId === "place_tiger_hill"),
    ).toBe(false);

    // Verify fields on each alternative
    if (data.alternatives.length > 0) {
      const alt = data.alternatives[0];
      expect(alt.name).toBeDefined();
      expect(alt.why).toBeDefined();
      expect(alt.source).toBeDefined();
    }
  }, 15000);

  it("GET /api/v1/places/place_tiger_hill/alternatives supports all 6 modes", async () => {
    const modes = [
      "REPLACEMENT",
      "ENHANCEMENT",
      "COMPLEMENTARY",
      "NEARBY_DISCOVERY",
      "TIMING_ALTERNATIVE",
      "LOWER_CROWD",
    ] as const;

    for (const mode of modes) {
      const res = await request(app)
        .get(`/api/v1/places/place_tiger_hill/alternatives?mode=${mode}`)
        .expect(200);

      expect(res.body.data.mode).toBe(mode);
      expect(res.body.data.reasoning.mode).toBe(mode);
    }
  }, 30000);

  it("GET /api/v1/places/place_tiger_hill/alternatives with travel & experience taste filters", async () => {
    const res = await request(app)
      .get(
        "/api/v1/places/place_tiger_hill/alternatives?mode=REPLACEMENT&travelTaste=mountain&experienceTaste=sunrise&dayNight=DAY",
      )
      .expect(200);

    expect(res.body.data.alternatives).toBeDefined();
  });

  it("GET /api/v1/places/invalid_place_id_999/alternatives returns 404 Not Found", async () => {
    const res = await request(app).get("/api/v1/places/invalid_place_id_999/alternatives");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain("not found");
  });

  it("GET /api/v1/alternatives/place_tiger_hill returns 200 via direct route", async () => {
    const res = await request(app).get("/api/v1/alternatives/place_tiger_hill");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.originalPlace.id).toBe("place_tiger_hill");
  });
});
