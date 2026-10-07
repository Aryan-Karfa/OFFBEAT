import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Phase 15: Memory & Personalization API Integration Tests", () => {
  const app = createApp();
  const userA = "user_test_alice_integration";
  const userB = "user_test_bob_integration";

  it("POST /api/v1/me/memory/events records interaction events and returns 201", async () => {
    const res = await request(app).post("/api/v1/me/memory/events").set("x-user-id", userA).send({
      eventType: "TASTE_SELECTED",
      signalKey: "mountains",
      signalValue: "Mountains",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.memory).toBeDefined();
    expect(res.body.data.memory.key).toBe("mountains");
    expect(res.body.data.memory.source).toBe("EXPLICIT");
  });

  it("GET /api/v1/me/memory returns list of memories for the authenticated traveler", async () => {
    const res = await request(app).get("/api/v1/me/memory").set("x-user-id", userA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].explanation).toBeDefined();
  });

  it("GET /api/v1/me/personalization returns normalized profile", async () => {
    const res = await request(app).get("/api/v1/me/personalization").set("x-user-id", userA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.memoryEnabled).toBe(true);
    expect(Array.isArray(res.body.data.travelTaste)).toBe(true);
  });

  it("PATCH /api/v1/me/memory/settings toggles memory on/off", async () => {
    const res = await request(app)
      .patch("/api/v1/me/memory/settings")
      .set("x-user-id", userA)
      .send({ memoryEnabled: false });

    expect(res.status).toBe(200);
    expect(res.body.data.memoryEnabled).toBe(false);

    // Re-enable
    await request(app)
      .patch("/api/v1/me/memory/settings")
      .set("x-user-id", userA)
      .send({ memoryEnabled: true });
  });

  it("enforces user identity isolation (User B cannot see or delete User A's memories)", async () => {
    // 1. Create a memory for User A
    const eventRes = await request(app)
      .post("/api/v1/me/memory/events")
      .set("x-user-id", userA)
      .send({
        eventType: "TASTE_SELECTED",
        signalKey: "private_taste",
        signalValue: "Private Taste",
      });

    const memoryIdA = eventRes.body.data.memory.id;

    // 2. User B tries to delete User A's memory -> 404
    const deleteRes = await request(app)
      .delete(`/api/v1/me/memory/${memoryIdA}`)
      .set("x-user-id", userB);

    expect(deleteRes.status).toBe(404);

    // 3. User B cannot see User A's memories
    const listResB = await request(app).get("/api/v1/me/memory").set("x-user-id", userB);

    const foundInB = listResB.body.data.find((m: { id: string }) => m.id === memoryIdA);
    expect(foundInB).toBeUndefined();
  });

  it("DELETE /api/v1/me/memory clears all traveler memories", async () => {
    const res = await request(app).delete("/api/v1/me/memory").set("x-user-id", userA);

    expect(res.status).toBe(200);
    expect(res.body.data.cleared).toBe(true);

    const afterRes = await request(app).get("/api/v1/me/memory").set("x-user-id", userA);

    expect(afterRes.body.data).toHaveLength(0);
  });
});
