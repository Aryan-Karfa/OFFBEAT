import { z } from "zod";
import { DayTypeEnum } from "../time/time.schema.js";

export const CrowdLevelEnum = z.enum(["LOW", "MODERATE", "HIGH", "VERY_HIGH", "UNKNOWN"]);

export const SeasonEnum = z.enum([
  "SPRING",
  "SUMMER",
  "MONSOON",
  "AUTUMN",
  "WINTER",
  "ANY",
  "UNKNOWN",
]);

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createCrowdObservationSchema = z.object({
  level: CrowdLevelEnum,
  timeStart: z
    .string()
    .trim()
    .regex(timeRegex, "Start time must be formatted as HH:mm (24-hour, e.g. 05:00)")
    .optional(),
  timeEnd: z
    .string()
    .trim()
    .regex(timeRegex, "End time must be formatted as HH:mm (24-hour, e.g. 06:30)")
    .optional(),
  dayType: DayTypeEnum.optional().default("ANY"),
  season: SeasonEnum.optional().default("ANY"),
  observation: z.string().trim().max(500, "Observation cannot exceed 500 characters").optional(),
  destinationId: z.string().trim().optional(),
  expiresAt: z
    .string()
    .datetime({ message: "expiresAt must be a valid ISO 8601 string" })
    .optional(),
});

export const crowdQuerySchema = z.object({
  dayType: DayTypeEnum.optional().default("ANY"),
  timeWindow: z.string().trim().optional(),
  season: SeasonEnum.optional().default("ANY"),
});

export type CreateCrowdObservationInput = z.infer<typeof createCrowdObservationSchema>;
export type CrowdQueryInput = z.infer<typeof crowdQuerySchema>;
