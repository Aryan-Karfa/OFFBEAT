import { z } from "zod";

export const createItinerarySchema = z.object({
  country: z.string().optional().default("India"),
  regionId: z.string().min(1, "regionId is required"),
  destinationId: z.string().nullable().optional(),

  travelTaste: z.array(z.string()).optional().default([]),
  experienceTaste: z.array(z.string()).optional().default([]),

  dayNight: z.enum(["DAY", "NIGHT", "ANY"]).optional().default("DAY"),

  preferredStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "preferredStartTime must be in HH:MM format")
    .nullable()
    .optional(),
  preferredEndTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "preferredEndTime must be in HH:MM format")
    .nullable()
    .optional(),

  durationDays: z.coerce.number().int().min(1).max(7).optional().default(1),

  pace: z.enum(["RELAXED", "BALANCED", "PACKED"]).optional().default("BALANCED"),

  mustVisitPlaceIds: z.array(z.string()).optional().default([]),
  selectedAlternativePlaceIds: z.array(z.string()).optional().default([]),
  avoidPlaceIds: z.array(z.string()).optional().default([]),

  intent: z
    .enum(["EXPLORE", "PHOTOGRAPHY", "FOOD", "NATURE", "CULTURE", "MIXED"])
    .optional()
    .default("EXPLORE"),
});

export type ValidatedCreateItineraryRequest = z.infer<typeof createItinerarySchema>;

export const getItineraryParamsSchema = z.object({
  itineraryId: z.string().min(1, "itineraryId parameter is required"),
});
