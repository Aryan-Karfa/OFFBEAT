import { z } from "zod";

/**
 * Validates place identifier from route parameters.
 * Accepts place UUIDs, custom prefixed IDs ("place_tiger_hill"), or slugs ("tiger-hill").
 */
export const placeParamsSchema = z.object({
  placeId: z
    .string()
    .min(1, "Place identifier is required")
    .max(64, "Place identifier must not exceed 64 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid place identifier format"),
});

export type PlaceParams = z.infer<typeof placeParamsSchema>;
