import { z } from "zod";

/**
 * Validates country identifier from route parameters.
 * Accepts ISO codes ("IND"), slugs ("india"), or IDs ("country_in", "in").
 */
export const countryParamsSchema = z.object({
  countryId: z
    .string()
    .min(1, "Country identifier is required")
    .max(64, "Country identifier must not exceed 64 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid country identifier format"),
});

export type CountryParams = z.infer<typeof countryParamsSchema>;

/**
 * Validates region identifier from route parameters.
 * Accepts ISO IDs ("IN-WB"), state codes ("WB"), slugs ("west-bengal"), or prefixed IDs ("reg_wb").
 */
export const regionParamsSchema = z.object({
  regionId: z
    .string()
    .min(1, "Region identifier is required")
    .max(64, "Region identifier must not exceed 64 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid region identifier format"),
});

export type RegionParams = z.infer<typeof regionParamsSchema>;
