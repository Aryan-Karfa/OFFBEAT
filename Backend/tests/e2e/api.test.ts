import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("E2E API Pipeline", () => {
  const app = createApp();

  it("should process request through full middleware pipeline and return standard envelope", async () => {
    const res = await request(app).get("/api/v1/health").set("Origin", "http://localhost:5173");

    expect(res.status).toBe(200);
    // CORS headers
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    // Request ID header
    expect(res.headers["x-request-id"]).toBeDefined();
    // Standard body envelope
    expect(res.body).toEqual({
      success: true,
      data: expect.objectContaining({
        status: "ok",
        service: "offbeat-backend",
      }),
      meta: expect.objectContaining({
        requestId: res.headers["x-request-id"],
        timestamp: expect.any(String),
      }),
    });
  });

  it("should handle invalid route through 404 pipeline and return standard error envelope", async () => {
    const res = await request(app).post("/api/v1/unknown-path").send({ some: "data" });

    expect(res.status).toBe(404);
    expect(res.headers["x-request-id"]).toBeDefined();
    expect(res.body).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: expect.stringContaining("Cannot POST /api/v1/unknown-path"),
        details: expect.any(Array),
      },
      meta: expect.objectContaining({
        requestId: res.headers["x-request-id"],
        timestamp: expect.any(String),
      }),
    });
  });
});
