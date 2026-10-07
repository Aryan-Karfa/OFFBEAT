import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Phase 14: Take Home API Integration Tests", () => {
  const app = createApp();

  it("GET /api/v1/take-home/dest_darjeeling returns 200 with full structured payload", async () => {
    const res = await request(app).get("/api/v1/take-home/dest_darjeeling");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const data = res.body.data;
    expect(data.destination).toBeDefined();
    expect(data.destination.id).toBe("dest_darjeeling");
    expect(data.destination.name).toBe("Darjeeling");

    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);

    const teaItem = data.items.find((i: { id: string }) => i.id === "item_darjeeling_tea");
    expect(teaItem).toBeDefined();
    expect(teaItem.name).toContain("Tea");
    expect(teaItem.localRelevance).toBe("SIGNATURE");
    expect(teaItem.whyTakeHome).toBeDefined();
    expect(Array.isArray(teaItem.placesToFind)).toBe(true);
    expect(teaItem.placesToFind.length).toBeGreaterThan(0);

    expect(data.reasoning).toBeDefined();
    expect(data.reasoning.explanation).toBeDefined();
    expect(data.source).toBeDefined();
  });

  it("GET /api/v1/take-home/dest_darjeeling?category=TEA_COFFEE filters correctly", async () => {
    const res = await request(app)
      .get("/api/v1/take-home/dest_darjeeling?category=TEA_COFFEE")
      .expect(200);

    const data = res.body.data;
    expect(data.items.length).toBeGreaterThan(0);
    // Top item should be of the requested category
    expect(data.items[0].category).toBe("TEA_COFFEE");
  });

  it("GET /api/v1/take-home/dest_darjeeling?giftFor=GIFT prioritizes gift items", async () => {
    const res = await request(app)
      .get("/api/v1/take-home/dest_darjeeling?giftFor=GIFT")
      .expect(200);

    const data = res.body.data;
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items[0].goodFor).toContain("GIFT");
  });

  it("GET /api/v1/take-home/dest_darjeeling?verifiedOnly=true returns verified items only", async () => {
    const res = await request(app)
      .get("/api/v1/take-home/dest_darjeeling?verifiedOnly=true")
      .expect(200);

    const data = res.body.data;
    expect(data.items.length).toBeGreaterThan(0);
    for (const item of data.items) {
      const isHighConf = item.confidence?.evidenceStrength === "HIGH";
      const isVerified =
        item.community?.status === "COMMUNITY_VERIFIED" ||
        item.community?.status === "OFFICIAL_CURATED";
      expect(isHighConf || isVerified).toBe(true);
    }
  });

  it("GET /api/v1/places/place_tiger_hill/take-home resolves contextual destination", async () => {
    const res = await request(app).get("/api/v1/places/place_tiger_hill/take-home").expect(200);

    const data = res.body.data;
    expect(data.destination.name).toBe("Darjeeling");
    expect(data.place).toBeDefined();
    expect(data.place.id).toBe("place_tiger_hill");
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/take-home/dest_unknown returns truthful empty state without fabricating products", async () => {
    const res = await request(app).get("/api/v1/take-home/dest_unknown").expect(200);

    const data = res.body.data;
    expect(data.items).toHaveLength(0);
    expect(data.totalCount).toBe(0);
    expect(data.reasoning.explanation).toContain("doesn't have enough reliable local information");
  });
});
