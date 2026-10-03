import { z } from "zod";

export const SubmissionTypeEnum = z.enum([
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
]);

export const SubmissionStatusEnum = z.enum(["PENDING", "APPROVED", "FLAGGED", "REJECTED"]);

export const EvidenceTypeEnum = z.enum(["PHOTO", "TEXT", "EXTERNAL_REFERENCE"]);

export const SupportTypeEnum = z.enum(["AGREE", "USEFUL", "CONFIRM"]);

export const ReportReasonEnum = z.enum([
  "INCORRECT",
  "OUTDATED",
  "DUPLICATE",
  "SPAM",
  "MISLEADING",
  "INAPPROPRIATE",
  "OTHER",
]);

export const CreateEvidenceSchema = z
  .object({
    type: EvidenceTypeEnum,
    mediaUrl: z
      .string()
      .url("Evidence media URL must be a valid HTTP/HTTPS URL")
      .max(2048, "URL is too long")
      .optional(),
    content: z.string().trim().max(2000, "Content cannot exceed 2000 characters").optional(),
    externalReference: z.string().trim().max(500, "Reference is too long").optional(),
    source: z.string().trim().max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "PHOTO") {
        return !!data.mediaUrl;
      }
      if (data.type === "TEXT") {
        return !!data.content;
      }
      if (data.type === "EXTERNAL_REFERENCE") {
        return !!data.externalReference || !!data.mediaUrl;
      }
      return true;
    },
    {
      message: "Evidence must supply appropriate media URL or text content for its type",
    },
  );

export const CreateCommunitySubmissionSchema = z.object({
  placeId: z.string().trim().min(1).max(128).optional(),
  destinationId: z.string().trim().min(1).max(128).optional(),
  type: SubmissionTypeEnum,
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title cannot exceed 200 characters"),
  content: z
    .string()
    .trim()
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content cannot exceed 5000 characters"),
  evidence: z.array(CreateEvidenceSchema).max(5, "At most 5 evidence items allowed").optional(),
});

export type CreateCommunitySubmissionInput = z.infer<typeof CreateCommunitySubmissionSchema>;

export const ListSubmissionsQuerySchema = z.object({
  placeId: z.string().trim().optional(),
  destinationId: z.string().trim().optional(),
  type: SubmissionTypeEnum.optional(),
  status: SubmissionStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListSubmissionsQueryInput = z.infer<typeof ListSubmissionsQuerySchema>;

export const CreateSupportSchema = z.object({
  type: SupportTypeEnum.default("USEFUL"),
});

export type CreateSupportInput = z.infer<typeof CreateSupportSchema>;

export const CreateReportSchema = z.object({
  reason: ReportReasonEnum,
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
