import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("Zod Validation Middleware Integration", () => {
  const app = createApp();

  it("should reject payload with missing required fields with 400 VALIDATION_ERROR", async () => {
    const res = await request(app).post("/api/v1/users").send({
      // Missing email, username, displayName
      bio: "Just a traveler",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);

    const fields = res.body.error.details.map((d: { field?: string }) => d.field);
    expect(fields).toContain("email");
    expect(fields).toContain("username");
    expect(fields).toContain("displayName");
  });

  it("should reject payload with invalid email format", async () => {
    const res = await request(app).post("/api/v1/users").send({
      email: "not-an-email",
      username: "traveler_1",
      displayName: "Traveler One",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    const emailIssue = res.body.error.details.find((d: { field?: string }) => d.field === "email");
    expect(emailIssue).toBeDefined();
  });
});
