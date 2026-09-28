import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { userRepository } from "../../src/modules/users/user.repository.js";
import { UserStatus } from "@prisma/client";

describe("Users Module Integration", () => {
  const app = createApp();

  it("GET /api/v1/users/:id should return 404 for non-existent user", async () => {
    vi.spyOn(userRepository, "findById").mockResolvedValueOnce(null);

    const res = await request(app).get("/api/v1/users/non-existent-id");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.meta.requestId).toBeDefined();
  });

  it("GET /api/v1/users/:id should return 200 with sanitized user and profile", async () => {
    const mockUserWithProfile = {
      id: "usr_mock_1",
      email: "mock@offbeat.travel",
      username: "mock_user",
      passwordHash: "secret_hash",
      status: UserStatus.ACTIVE,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      profile: {
        id: "prof_mock_1",
        userId: "usr_mock_1",
        displayName: "Mock Traveler",
        avatarUrl: null,
        bio: "Mock Bio",
        homeCountry: "India",
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    };

    vi.spyOn(userRepository, "findById").mockResolvedValueOnce(mockUserWithProfile);

    const res = await request(app).get("/api/v1/users/usr_mock_1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("usr_mock_1");
    expect(res.body.data.email).toBe("mock@offbeat.travel");
    expect(res.body.data.profile.displayName).toBe("Mock Traveler");
    // Ensure passwordHash is never leaked
    expect("passwordHash" in (res.body.data as Record<string, unknown>)).toBe(false);
  });

  it("POST /api/v1/users should return 409 CONFLICT if email already exists", async () => {
    vi.spyOn(userRepository, "findByEmail").mockResolvedValueOnce({
      id: "existing_user",
      email: "already@exists.com",
      username: "existing_user",
      passwordHash: "hash",
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: null,
    });

    const res = await request(app).post("/api/v1/users").send({
      email: "already@exists.com",
      username: "new_traveler",
      displayName: "New Traveler",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CONFLICT");
  });
});
