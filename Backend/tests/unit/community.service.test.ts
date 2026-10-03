import { describe, it, expect, beforeEach } from "vitest";
import { CommunityService } from "../../src/modules/community/community.service.js";
import { CommunityRepository } from "../../src/modules/community/community.repository.js";
import { PlaceRepository } from "../../src/modules/places/places.repository.js";
import { UserRepository } from "../../src/modules/users/user.repository.js";
import { ConflictError, NotFoundError } from "../../src/lib/errors/AppError.js";

describe("Community Service Unit Tests", () => {
  let service: CommunityService;
  let repo: CommunityRepository;
  let placesRepo: PlaceRepository;
  let userRepo: UserRepository;

  beforeEach(() => {
    repo = new CommunityRepository();
    placesRepo = new PlaceRepository();
    userRepo = new UserRepository();
    service = new CommunityService(repo, placesRepo, userRepo);
  });

  describe("createSubmission", () => {
    it("should successfully create a new community submission", async () => {
      const result = await service.createSubmission(
        {
          placeId: "place_tiger_hill",
          type: "PHOTO_SPOT",
          title: "Early dawn ridge angle",
          content: "Walk beyond the telescope platform to find empty boulders facing Kanchenjunga.",
        },
        "user_demo_traveler",
      );

      expect(result.id).toBeDefined();
      expect(result.title).toBe("Early dawn ridge angle");
      expect(result.type).toBe("PHOTO_SPOT");
      expect(result.author.displayName).toBe("Offbeat Traveler");
      expect(result.place?.name).toBe("Tiger Hill");
    });

    it("should prevent duplicate submission from same user with identical normalized title", async () => {
      await service.createSubmission(
        {
          placeId: "place_tiger_hill",
          type: "PHOTO_SPOT",
          title: "Unique Mountain Angle",
          content: "Observation content for original submission testing duplicate logic.",
        },
        "user_demo_traveler",
      );

      // Attempt second submission with slightly different casing/punctuation
      await expect(
        service.createSubmission(
          {
            placeId: "place_tiger_hill",
            type: "PHOTO_SPOT",
            title: "unique mountain angle!",
            content: "Different content but same place and normalized title.",
          },
          "user_demo_traveler",
        ),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError if specified place does not exist", async () => {
      await expect(
        service.createSubmission(
          {
            placeId: "nonexistent_place_xyz",
            type: "TRAVEL_TIP",
            title: "Valid title here",
            content: "Valid content description for missing place test.",
          },
          "user_demo_traveler",
        ),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("supportSubmission", () => {
    it("should allow a user to support a submission", async () => {
      const summary = await service.supportSubmission(
        "sub_tiger_hill_best_time",
        "user_new_supporter",
        "CONFIRM",
      );

      expect(summary.count).toBeGreaterThan(0);
      expect(summary.userSupported).toBe(true);
      expect(summary.userSupportType).toBe("CONFIRM");
    });

    it("should reject duplicate support by the same user with ConflictError", async () => {
      // First support
      await service.supportSubmission(
        "sub_tiger_hill_best_time",
        "user_unique_supporter",
        "USEFUL",
      );

      // Duplicate support
      await expect(
        service.supportSubmission("sub_tiger_hill_best_time", "user_unique_supporter", "USEFUL"),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw NotFoundError for invalid submission id", async () => {
      await expect(
        service.supportSubmission("nonexistent_sub_123", "user_demo_traveler", "USEFUL"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("reportSubmission", () => {
    it("should successfully record a report for a submission", async () => {
      const result = await service.reportSubmission(
        "sub_tiger_hill_best_time",
        "user_demo_supporter",
        "OUTDATED",
        "Timings shifted slightly after local forest gate hours were revised.",
      );

      expect(result.reported).toBe(true);
      expect(result.submissionId).toBe("sub_tiger_hill_best_time");
    });

    it("should throw NotFoundError when reporting nonexistent submission", async () => {
      await expect(
        service.reportSubmission("nonexistent_sub_123", "user_demo_traveler", "SPAM"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getCommunitySignalsForPlace", () => {
    it("should compute aggregated signals and top highlights for Tiger Hill", async () => {
      const signals = await service.getCommunitySignalsForPlace("place_tiger_hill");

      expect(signals.submissionCount).toBeGreaterThanOrEqual(3);
      expect(signals.usefulCount).toBeGreaterThan(0);
      expect(signals.confirmCount).toBeGreaterThan(0);
      expect(signals.highlights.length).toBeLessThanOrEqual(3);

      const topHighlight = signals.highlights[0]!;
      expect(topHighlight).toBeDefined();
      expect(topHighlight.title).toBeDefined();
      expect(topHighlight.supportCount).toBeGreaterThan(0);
      expect(topHighlight.author.displayName).toBeDefined();
    });
  });
});
