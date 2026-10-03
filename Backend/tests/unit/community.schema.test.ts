import { describe, it, expect } from "vitest";
import {
  CreateCommunitySubmissionSchema,
  CreateEvidenceSchema,
  CreateSupportSchema,
  CreateReportSchema,
  ListSubmissionsQuerySchema,
} from "../../src/modules/community/community.schema.js";

describe("Community Schema Unit Tests", () => {
  describe("CreateEvidenceSchema", () => {
    it("should accept valid PHOTO evidence with URL", () => {
      const valid = {
        type: "PHOTO",
        mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
        content: "View from the pine trail",
      };
      const result = CreateEvidenceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject PHOTO evidence without mediaUrl", () => {
      const invalid = {
        type: "PHOTO",
        content: "No URL provided",
      };
      const result = CreateEvidenceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid mediaUrl format", () => {
      const invalid = {
        type: "PHOTO",
        mediaUrl: "not-a-valid-url",
      };
      const result = CreateEvidenceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept TEXT evidence with content", () => {
      const valid = {
        type: "TEXT",
        content: "Local guide recommendation from Ghum station master.",
      };
      const result = CreateEvidenceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject TEXT evidence without content", () => {
      const invalid = {
        type: "TEXT",
      };
      const result = CreateEvidenceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateCommunitySubmissionSchema", () => {
    it("should accept valid submission data", () => {
      const valid = {
        placeId: "place_tiger_hill",
        type: "BEST_TIME",
        title: "Arrive 30 minutes before first light",
        content:
          "The pre-dawn purple hue illuminating Mount Kanchenjunga before crowds gather is magnificent.",
      };
      const result = CreateCommunitySubmissionSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Arrive 30 minutes before first light");
      }
    });

    it("should reject submission with title shorter than 3 characters", () => {
      const invalid = {
        placeId: "place_tiger_hill",
        type: "BEST_TIME",
        title: "Hi",
        content: "Valid length content for submission testing purposes.",
      };
      const result = CreateCommunitySubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject submission with content shorter than 10 characters", () => {
      const invalid = {
        placeId: "place_tiger_hill",
        type: "PHOTO_SPOT",
        title: "Good viewpoint",
        content: "Short",
      };
      const result = CreateCommunitySubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid submission types outside taxonomy", () => {
      const invalid = {
        placeId: "place_tiger_hill",
        type: "INVALID_TAXONOMY",
        title: "Good viewpoint",
        content: "Valid content description for testing validation.",
      };
      const result = CreateCommunitySubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept all 12 documented submission types", () => {
      const types = [
        "HIDDEN_PLACE",
        "LOCAL_BUSINESS",
        "RESTAURANT",
        "PHOTO_SPOT",
        "BEST_TIME",
        "CROWD_TIP",
        "TRAVEL_TIP",
        "LOCAL_SPECIALTY",
        "TAKE_HOME",
        "EXPERIENCE",
        "ALTERNATIVE",
        "OTHER",
      ];

      for (const type of types) {
        const result = CreateCommunitySubmissionSchema.safeParse({
          placeId: "place_tiger_hill",
          type,
          title: `Testing type ${type}`,
          content: "Valid content description for each documented taxonomy type.",
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("CreateSupportSchema", () => {
    it("should default support type to USEFUL when empty", () => {
      const result = CreateSupportSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("USEFUL");
      }
    });

    it("should accept AGREE, USEFUL, CONFIRM types", () => {
      for (const type of ["AGREE", "USEFUL", "CONFIRM"]) {
        const result = CreateSupportSchema.safeParse({ type });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid support type", () => {
      const result = CreateSupportSchema.safeParse({ type: "UPVOTE" });
      expect(result.success).toBe(false);
    });
  });

  describe("CreateReportSchema", () => {
    it("should accept valid report reasons", () => {
      for (const reason of [
        "INCORRECT",
        "OUTDATED",
        "DUPLICATE",
        "SPAM",
        "MISLEADING",
        "INAPPROPRIATE",
        "OTHER",
      ]) {
        const result = CreateReportSchema.safeParse({
          reason,
          description: "Road conditions changed significantly in recent months.",
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid report reason", () => {
      const result = CreateReportSchema.safeParse({
        reason: "BOGUS_REASON",
        description: "Testing invalid reason rejection.",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ListSubmissionsQuerySchema", () => {
    it("should parse default pagination parameters", () => {
      const result = ListSubmissionsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should cap limit or enforce bounds", () => {
      const result = ListSubmissionsQuerySchema.safeParse({ limit: 999 });
      expect(result.success).toBe(false);
    });
  });
});
