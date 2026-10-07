import { z } from "zod";

/**
 * Zod schema for structured output from Gemini reasoning.
 * Ensures strict typing and adherence to candidate allowlisting.
 */
export const discoveryReasoningOutputSchema = z.object({
  selectedPlaceIds: z.array(z.string()).min(1, "At least one place ID must be selected"),
  primaryRecommendationId: z.string().min(1, "Primary recommendation ID is required"),
  recommendationSummary: z.string().min(5, "Recommendation summary must be meaningful"),
  reasons: z.array(z.string()).min(1, "At least one reason must be provided").max(5),
  tradeoffs: z.array(z.string()).max(5).default([]),
  contextualNotes: z.array(z.string()).max(5).default([]),
});

export type DiscoveryReasoningOutput = z.infer<typeof discoveryReasoningOutputSchema>;

/**
 * Zod schema for structured output from Gemini alternative reasoning.
 * Ensures strict typing, mode preservation, and candidate allowlisting.
 */
export const alternativeReasoningOutputSchema = z.object({
  selectedCandidateIds: z.array(z.string()).min(1, "At least one candidate ID must be selected"),
  primaryCandidateId: z.string().optional(),
  explanation: z.string().min(5, "Explanation must be meaningful"),
  mode: z.enum([
    "REPLACEMENT",
    "ENHANCEMENT",
    "COMPLEMENTARY",
    "NEARBY_DISCOVERY",
    "TIMING_ALTERNATIVE",
    "LOWER_CROWD",
  ]),
  tradeoff: z.string().optional(),
  relationship: z.string().optional(),
});

export type AlternativeReasoningOutput = z.infer<typeof alternativeReasoningOutputSchema>;

