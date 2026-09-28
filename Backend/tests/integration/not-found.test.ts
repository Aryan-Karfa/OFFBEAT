import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("404 Not Found Handling", () => {
  const app = createApp();

  it("should return HTTP 404 with standard error envelope for undefined routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toContain("Cannot GET /api/v1/does-not-exist");
    expect(res.body.meta.requestId).toBeDefined();
    expect(res.headers["x-request-id"]).toBe(res.body.meta.requestId);
  });
});
