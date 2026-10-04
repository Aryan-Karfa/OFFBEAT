import { z } from "zod";

export const TimeObservationTypeEnum = z.enum([
  "OPENING_TIME",
  "CLOSING_TIME",
  "BEST_TIME",
  "SUNRISE_TIME",
  "SUNSET_TIME",
  "LOW_CROWD_TIME",
  "COMMUNITY_RECOMMENDED_TIME",
]);

export const ObservationSourceEnum = z.enum(["EXTERNAL", "COMMUNITY", "SYSTEM"]);

export const DayTypeEnum = z.enum(["WEEKDAY", "WEEKEND", "ANY"]);

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createTimeObservationSchema = z.object({
  type: TimeObservationTypeEnum,
  startTime: z
    .string()
    .trim()
    .regex(timeRegex, "Start time must be formatted as HH:mm (24-hour, e.g. 05:00)"),
  endTime: z
    .string()
    .trim()
    .regex(timeRegex, "End time must be formatted as HH:mm (24-hour, e.g. 06:15)"),
  dayType: DayTypeEnum.optional().default("ANY"),
  observation: z.string().trim().max(500, "Observation cannot exceed 500 characters").optional(),
  expiresAt: z
    .string()
    .datetime({ message: "expiresAt must be a valid ISO 8601 string" })
    .optional(),
});

export const timeQuerySchema = z.object({
  dayNight: z.enum(["DAY", "NIGHT", "ANY"]).optional().default("ANY"),
  preferredTime: z.string().trim().optional(),
  experienceTaste: z.union([z.string(), z.array(z.string())]).optional(),
});

export type CreateTimeObservationInput = z.infer<typeof createTimeObservationSchema>;
export type TimeQueryInput = z.infer<typeof timeQuerySchema>;
