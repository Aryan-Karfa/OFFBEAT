import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";

describe("Backend Foundation — Health Check", () => {
  it("GET /api/v1/health returns 200 OK with standard envelope", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("status", "ok");
    expect(res.body.data).toHaveProperty("version", "0.1.0");
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toHaveProperty("requestId");
    expect(res.headers).toHaveProperty("x-request-id");
  });

  it("GET /undefined-route returns 404 with standard error envelope", async () => {
    const res = await request(app).get("/api/v1/unknown-endpoint");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("success", false);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body).toHaveProperty("meta");
  });
});
