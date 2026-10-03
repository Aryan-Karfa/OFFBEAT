import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import type { VerificationDetailDto, CommunitySubmissionDto } from "@offbeat/shared";

describe("Phase 9: Verification & Confidence Integration Tests", () => {
  const app = createApp();
  const existingSubmissionId = "sub_tiger_hill_best_time";

  describe("GET /api/v1/community/submissions/:submissionId/verification", () => {
    it("returns 200 with full verification and confidence detail for a valid submission", async () => {
      const res = await request(app)
        .get(`/api/v1/community/submissions/${existingSubmissionId}/verification`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data as VerificationDetailDto;

      expect(data.submissionId).toBe(existingSubmissionId);
      expect(data.status).toBeDefined();
      expect(["COMMUNITY_VERIFIED", "COMMUNITY_SUPPORTED", "PENDING"]).toContain(data.status);
      expect(data.method).toBeDefined();

      // Confidence structure
      expect(data.confidence).toBeDefined();
      expect(data.confidence.score).toBeGreaterThanOrEqual(0.0);
      expect(data.confidence.score).toBeLessThanOrEqual(1.0);
      expect(data.confidence.version).toBe("confidence-v1");
      expect(typeof data.confidence.externalCorroboration).toBe("boolean");

      // Strength and explanations
      expect(["HIGH", "MODERATE", "EMERGING", "CONTESTED"]).toContain(data.strength);
      expect(data.explanation).toBeDefined();
      expect(data.explanation.headline).toBeDefined();
      expect(Array.isArray(data.explanation.signals)).toBe(true);
      expect(data.explanation.signals.length).toBeGreaterThanOrEqual(1);
      expect(data.explanation.summary).toBeDefined();
    });

    it("returns 404 for unknown submission", async () => {
      const res = await request(app)
        .get("/api/v1/community/submissions/sub_non_existent_9999/verification")
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("Automatic Recalculation on Support and Report", () => {
    let createdSubmissionId: string;

    it("creates a submission with initial verification evaluation", async () => {
      const createRes = await request(app)
        .post("/api/v1/community/submissions")
        .set("x-user-id", "user_demo_traveler")
        .send({
          placeId: "place_tiger_hill",
          type: "PHOTO_SPOT",
          title: "Sunrise telephoto angle from Ghum rock",
          content: "Bring a 200mm lens for the morning light catching Kanchenjunga peak edges.",
          evidence: [
            {
              type: "PHOTO",
              mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
            },
          ],
        })
        .expect(201);

      const created = createRes.body.data as CommunitySubmissionDto;
      createdSubmissionId = created.id;

      expect(created.id).toBeDefined();
      expect(created.verification).toBeDefined();
      expect(created.verification?.score).toBeGreaterThan(0.0);
    });

    it("recalculates confidence upward when community support is submitted", async () => {
      // Get baseline verification
      const beforeRes = await request(app)
        .get(`/api/v1/community/submissions/${createdSubmissionId}/verification`)
        .expect(200);

      const scoreBefore = beforeRes.body.data.confidence.score;

      // Add support
      await request(app)
        .post(`/api/v1/community/submissions/${createdSubmissionId}/support`)
        .set("x-user-id", "user_supporter_new_1")
        .send({ type: "CONFIRM" })
        .expect(201);

      // Verify recalculated state
      const afterRes = await request(app)
        .get(`/api/v1/community/submissions/${createdSubmissionId}/verification`)
        .expect(200);

      const afterData = afterRes.body.data as VerificationDetailDto;
      expect(afterData.confidence.supportCount).toBe(1);
      expect(afterData.confidence.score).toBeGreaterThanOrEqual(scoreBefore);
    });

    it("recalculates confidence downward and flags when report is submitted", async () => {
      // Submit a report
      await request(app)
        .post(`/api/v1/community/submissions/${createdSubmissionId}/report`)
        .set("x-user-id", "user_reporter_test")
        .send({
          reason: "SPAM",
          description: "This does not seem genuine",
        })
        .expect(201);

      // Verify recalculated state
      const reportedRes = await request(app)
        .get(`/api/v1/community/submissions/${createdSubmissionId}/verification`)
        .expect(200);

      const reportedData = reportedRes.body.data as VerificationDetailDto;
      expect(reportedData.confidence.contradictionCount).toBe(1);
      expect(reportedData.status).toBe("FLAGGED");
    });
  });

  describe("POST /api/v1/community/submissions/:submissionId/verification/recalculate", () => {
    it("returns 200 with refreshed verification details", async () => {
      const res = await request(app)
        .post(`/api/v1/community/submissions/${existingSubmissionId}/verification/recalculate`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data as VerificationDetailDto;
      expect(data.submissionId).toBe(existingSubmissionId);
      expect(data.confidence.version).toBe("confidence-v1");
    });
  });
});
