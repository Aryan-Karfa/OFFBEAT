import { z } from "zod";

const alternativeModes = [
  "REPLACEMENT",
  "ENHANCEMENT",
  "COMPLEMENTARY",
  "NEARBY_DISCOVERY",
  "TIMING_ALTERNATIVE",
  "LOWER_CROWD",
] as const;

export const findAlternativesParamsSchema = z.object({
  placeId: z.string().min(1, "placeId path parameter is required"),
});

export const findAlternativesQuerySchema = z.object({
  mode: z.enum(alternativeModes).default("REPLACEMENT"),
  country: z.string().optional(),
  region: z.string().optional(),
  destination: z.string().optional(),
  travelTaste: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }),
  experienceTaste: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }),
  dayNight: z.enum(["DAY", "NIGHT", "ANY"]).default("DAY"),
  preferredTime: z.string().optional(),
  intent: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 5;
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 5 : Math.min(num, 20);
    }),
});

export type ValidatedAlternativesParams = z.infer<typeof findAlternativesParamsSchema>;
export type ValidatedAlternativesQuery = z.infer<typeof findAlternativesQuerySchema>;
