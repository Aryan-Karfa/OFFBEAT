import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import type { DiscoveryResultItemDto } from "@offbeat/shared";

describe("Community Intelligence API Integration Tests", () => {
  const app = createApp();
  describe("POST /api/v1/community/submissions", () => {
    it("should successfully create a new community submission with evidence (201 Created)", async () => {
      const payload = {
        placeId: "place_batasia_loop",
        type: "PHOTO_SPOT",
        title: "Steam engine curve viewpoint",
        content:
          "Stand at the southwest spiral corner for the classic steam engine curve with Kanchenjunga background.",
        evidence: [
          {
            type: "PHOTO",
            mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
            content: "Corner angle view",
          },
        ],
      };

      const res = await request(app)
        .post("/api/v1/community/submissions")
        .set("x-user-id", "user_demo_traveler")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.type).toBe("PHOTO_SPOT");
      expect(res.body.data.author).toBeDefined();
      expect(res.body.data.author.displayName).toBe("Offbeat Traveler");
      expect(res.body.data.place?.name).toBe("Batasia Loop");
      expect(res.body.data.evidence).toHaveLength(1);
      expect(res.body.data.evidence[0].type).toBe("PHOTO");
      expect(res.body.meta.requestId).toBeDefined();
    });

    it("should reject submission with missing required fields (400 Bad Request)", async () => {
      const res = await request(app).post("/api/v1/community/submissions").send({
        title: "Too short content",
        // missing type and content
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject submission with invalid taxonomy type (400 Bad Request)", async () => {
      const res = await request(app).post("/api/v1/community/submissions").send({
        type: "UNSUPPORTED_TYPE",
        title: "Valid title format",
        content: "Valid length content description for submission test.",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when placeId does not exist", async () => {
      const res = await request(app).post("/api/v1/community/submissions").send({
        placeId: "place_non_existent_123",
        type: "TRAVEL_TIP",
        title: "Tips for nowhere",
        content: "Valid length description content for missing place test.",
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject duplicate submission by the same user for the same place and type (409 Conflict)", async () => {
      const submission = {
        placeId: "place_tiger_hill",
        type: "TRAVEL_TIP",
        title: "Pack a thermos flask for dawn",
        content:
          "The wind chill before sunrise is intense. A thermos of hot tea makes the wait enjoyable.",
      };

      // First creation
      const res1 = await request(app)
        .post("/api/v1/community/submissions")
        .set("x-user-id", "user_demo_local")
        .send(submission);
      expect(res1.status).toBe(201);

      // Attempt duplicate
      const res2 = await request(app)
        .post("/api/v1/community/submissions")
        .set("x-user-id", "user_demo_local")
        .send(submission);

      expect(res2.status).toBe(409);
      expect(res2.body.success).toBe(false);
      expect(res2.body.error.code).toBe("CONFLICT");
    });
  });

  describe("GET /api/v1/community/submissions", () => {
    it("should list community submissions with pagination envelope (200 OK)", async () => {
      const res = await request(app).get("/api/v1/community/submissions");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(20);
    });

    it("should filter community submissions by placeId", async () => {
      const res = await request(app)
        .get("/api/v1/community/submissions")
        .query({ placeId: "place_tiger_hill" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
      for (const item of res.body.data.items) {
        expect(item.placeId).toBe("place_tiger_hill");
      }
    });

    it("should filter community submissions by type", async () => {
      const res = await request(app)
        .get("/api/v1/community/submissions")
        .query({ type: "PHOTO_SPOT" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      for (const item of res.body.data.items) {
        expect(item.type).toBe("PHOTO_SPOT");
      }
    });
  });

  describe("GET /api/v1/community/submissions/:submissionId", () => {
    it("should return detailed submission information for valid id (200 OK)", async () => {
      const res = await request(app).get("/api/v1/community/submissions/sub_tiger_hill_best_time");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("sub_tiger_hill_best_time");
      expect(res.body.data.title).toBe("Arrive 30 minutes before first light");
      expect(res.body.data.author).toBeDefined();
      expect(res.body.data.support).toBeDefined();
      expect(res.body.data.support.count).toBeGreaterThanOrEqual(1);
      expect(res.body.data.support.confirmCount).toBeGreaterThanOrEqual(1);
    });

    it("should return 404 for nonexistent submission id", async () => {
      const res = await request(app).get("/api/v1/community/submissions/nonexistent_sub_999");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("POST /api/v1/community/submissions/:submissionId/support", () => {
    it("should allow a traveler to confirm/support a discovery (201 Created)", async () => {
      const res = await request(app)
        .post("/api/v1/community/submissions/sub_batasia_loop_tip/support")
        .set("x-user-id", "unique_traveler_vote_1")
        .send({ type: "CONFIRM" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBeGreaterThanOrEqual(1);
      expect(res.body.data.userSupported).toBe(true);
      expect(res.body.data.userSupportType).toBe("CONFIRM");
    });

    it("should reject duplicate support by the same user (409 Conflict)", async () => {
      // First support
      await request(app)
        .post("/api/v1/community/submissions/sub_batasia_loop_tip/support")
        .set("x-user-id", "unique_traveler_vote_2")
        .send({ type: "USEFUL" });

      // Duplicate support
      const duplicateRes = await request(app)
        .post("/api/v1/community/submissions/sub_batasia_loop_tip/support")
        .set("x-user-id", "unique_traveler_vote_2")
        .send({ type: "USEFUL" });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.code).toBe("CONFLICT");
    });

    it("should return 404 when supporting nonexistent submission", async () => {
      const res = await request(app)
        .post("/api/v1/community/submissions/nonexistent_sub_404/support")
        .set("x-user-id", "any_user")
        .send({ type: "USEFUL" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/community/submissions/:submissionId/report", () => {
    it("should accept a valid report for review (201 Created)", async () => {
      const res = await request(app)
        .post("/api/v1/community/submissions/sub_tiger_hill_photo_spot/report")
        .set("x-user-id", "user_demo_traveler")
        .send({
          reason: "OUTDATED",
          description: "A temporary wooden fence was erected along this path.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reported).toBe(true);
      expect(res.body.data.submissionId).toBe("sub_tiger_hill_photo_spot");
    });

    it("should reject invalid report reason (400 Bad Request)", async () => {
      const res = await request(app)
        .post("/api/v1/community/submissions/sub_tiger_hill_photo_spot/report")
        .send({
          reason: "INVALID_REASON",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 when reporting nonexistent submission", async () => {
      const res = await request(app)
        .post("/api/v1/community/submissions/nonexistent_sub_404/report")
        .send({
          reason: "SPAM",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Discovery Engine Integration", () => {
    it("should attach community highlights to discovered places when community knowledge exists", async () => {
      const res = await request(app)
        .post("/api/v1/discover")
        .send({
          regionId: "IN-WB",
          travelTaste: ["mountains", "photography"],
          experienceTaste: ["sunrise"],
          dayNight: "DAY",
          intent: "DISCOVER_PLACES",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const tigerHill = (res.body.data.results as DiscoveryResultItemDto[]).find(
        (r) => r.place.id === "place_tiger_hill",
      );

      if (tigerHill) {
        expect(tigerHill.community).toBeDefined();
        expect(tigerHill.community.submissionCount).toBeGreaterThanOrEqual(1);
        expect(tigerHill.community.highlights.length).toBeGreaterThanOrEqual(1);
        expect(tigerHill.community.highlights[0].title).toBeDefined();
      }
    });
  });
});
