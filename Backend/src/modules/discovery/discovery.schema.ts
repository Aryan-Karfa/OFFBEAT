import { z } from "zod";

/**
 * Sanitizes an array of preference strings:
 * - Trims whitespace
 * - Converts to lowercase
 * - Strips empty elements
 * - Removes duplicates
 */
const sanitizedStringArraySchema = z
  .array(z.string())
  .or(z.string().transform((v) => [v]))
  .optional()
  .default([])
  .transform((items) => {
    const cleaned = items
      .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
      .filter((item) => item.length > 0);
    return Array.from(new Set(cleaned));
  });

/**
 * Zod schema for POST /api/v1/discover
 */
export const discoveryRequestSchema = z.object({
  regionId: z
    .string({ required_error: "Region identifier is required" })
    .trim()
    .min(1, "Region identifier is required")
    .max(100, "Region identifier must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9_\-\s]+$/, "Invalid region identifier format"),
  country: z.string().trim().max(100).optional(),
  destination: z.string().trim().max(100).optional(),
  travelTaste: sanitizedStringArraySchema,
  experienceTaste: sanitizedStringArraySchema,
  dayNight: z.enum(["DAY", "NIGHT", "ANY"]).optional().default("DAY"),
  preferredTime: z.string().trim().max(50).optional(),
  placeType: z.string().trim().max(50).optional(),
  intent: z
    .enum(["DISCOVER_PLACES", "FIND_EXPERIENCE", "FIND_ALTERNATIVE", "FIND_LESS_CROWDED"])
    .optional()
    .default("DISCOVER_PLACES"),
  page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .optional()
    .default(12),
});

export type ValidatedDiscoveryRequest = z.infer<typeof discoveryRequestSchema>;
