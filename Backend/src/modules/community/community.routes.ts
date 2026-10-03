import { Router } from "express";
import { communityController } from "./community.controller.js";

export const communityRoutes: Router = Router();

// Submissions
communityRoutes.post("/submissions", communityController.createSubmission);
communityRoutes.get("/submissions", communityController.listSubmissions);
communityRoutes.get("/submissions/:submissionId", communityController.getSubmission);

// Support & Report
communityRoutes.post("/submissions/:submissionId/support", communityController.supportSubmission);
communityRoutes.post("/submissions/:submissionId/report", communityController.reportSubmission);

// Verification & Confidence (Phase 9)
communityRoutes.get("/submissions/:submissionId/verification", communityController.getVerification);
communityRoutes.post(
  "/submissions/:submissionId/verification/recalculate",
  communityController.recalculateVerification,
);
