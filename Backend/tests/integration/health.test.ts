import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("GET /api/v1/health", () => {
  const app = createApp();

  it("should return HTTP 200 with standard success envelope", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
    expect(res.body.data.service).toBe("offbeat-backend");
    expect(res.body.meta.requestId).toBeDefined();

    // Verify X-Request-ID header
    expect(res.headers["x-request-id"]).toBe(res.body.meta.requestId);
  });

  it("should preserve client-supplied X-Request-ID", async () => {
    const customId = "client-trace-99887766";
    const res = await request(app).get("/api/v1/health").set("X-Request-ID", customId);

    expect(res.status).toBe(200);
    expect(res.headers["x-request-id"]).toBe(customId);
    expect(res.body.meta.requestId).toBe(customId);
  });
});
