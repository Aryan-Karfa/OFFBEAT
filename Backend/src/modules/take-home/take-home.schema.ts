import { z } from "zod";

const stringOrArray = z.preprocess((val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val.includes(",") ? val.split(",").map((s) => s.trim()) : [val.trim()];
  }
  return [];
}, z.array(z.string()));

export const takeHomeQuerySchema = z.object({
  category: z
    .enum([
      "FOOD",
      "TEA_COFFEE",
      "SPICES",
      "SWEETS",
      "HANDICRAFT",
      "TEXTILE",
      "ART",
      "CULTURAL_GOOD",
      "BEAUTY_WELLNESS",
      "LOCAL_PRODUCT",
      "GIFT",
      "OTHER",
    ])
    .optional(),
  travelTaste: stringOrArray.optional().default([]),
  experienceTaste: stringOrArray.optional().default([]),
  giftFor: z.enum(["PERSONAL", "GIFT", "FAMILY", "FRIENDS", "COLLECTOR"]).optional(),
  budget: z.enum(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]).optional(),
  verifiedOnly: z
    .preprocess((val) => {
      if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
      return Boolean(val);
    }, z.boolean())
    .optional()
    .default(false),
});

export type ValidatedTakeHomeQuery = z.infer<typeof takeHomeQuerySchema>;

export const takeHomeDestinationParamsSchema = z.object({
  destinationId: z.string().min(1, "destinationId parameter is required"),
});

export const takeHomePlaceParamsSchema = z.object({
  placeId: z.string().min(1, "placeId parameter is required"),
});
