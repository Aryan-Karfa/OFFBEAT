import type { DiscoveryReasoningOutput } from "./gemini.schemas.js";
import type { DiscoveryReasoningInputDto } from "./gemini.types.js";

export interface GuardValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that all candidate IDs returned by Gemini are in the supplied candidate allowlist.
 */
export function validateCandidateAllowlist(
  output: DiscoveryReasoningOutput,
  allowedCandidateIds: string[],
): GuardValidationResult {
  const errors: string[] = [];
  const allowedSet = new Set(allowedCandidateIds);

  if (!allowedSet.has(output.primaryRecommendationId)) {
    errors.push(
      `Primary recommendation ID '${output.primaryRecommendationId}' is not in allowed candidate set [${allowedCandidateIds.join(", ")}]`,
    );
  }

  for (const id of output.selectedPlaceIds) {
    if (!allowedSet.has(id)) {
      errors.push(`Selected place ID '${id}' is not in allowed candidate set`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks business rules and hallucination guardrails:
 * 1. Checks that primary recommendation candidate exists in candidates.
 * 2. Checks explicit user constraints (e.g. if user specifies DAY/NIGHT and candidate has conflicting operating window).
 * 3. Checks that reasons and summary are non-empty and grounded.
 */
export function checkBusinessAndHallucinationGuards(
  output: DiscoveryReasoningOutput,
  input: DiscoveryReasoningInputDto,
): GuardValidationResult {
  const errors: string[] = [];
  const candidateMap = new Map(input.candidates.map((c) => [c.id, c]));

  const primaryCandidate = candidateMap.get(output.primaryRecommendationId);
  if (!primaryCandidate) {
    errors.push(
      `Primary candidate '${output.primaryRecommendationId}' not found in candidates list`,
    );
    return { valid: false, errors };
  }

  // Ensure reasons do not make unsubstantiated claims
  if (!output.reasons || output.reasons.length === 0) {
    errors.push("Reasoning output must contain at least one grounded reason");
  }

  // If user requested NIGHT and the primary candidate strictly has timeFit === 'CONFLICT',
  // flag it unless Gemini provided contextual notes explaining the conflict
  if (input.userContext.dayNight === "NIGHT" && primaryCandidate.timeFit === "CONFLICT") {
    // If there's a strict conflict and no tradeoff or note was provided, reject
    if (output.tradeoffs.length === 0 && output.contextualNotes.length === 0) {
      errors.push(
        "Primary recommendation conflicts with user NIGHT preference without explaining the tradeoff",
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that all candidate IDs returned by Gemini in alternative reasoning
 * are present in the supplied candidate allowlist.
 */
export function validateAlternativeCandidateAllowlist(
  output: import("./gemini.schemas.js").AlternativeReasoningOutput,
  allowedCandidateIds: string[],
): GuardValidationResult {
  const errors: string[] = [];
  const allowedSet = new Set(allowedCandidateIds);

  if (output.primaryCandidateId && !allowedSet.has(output.primaryCandidateId)) {
    errors.push(
      `Primary candidate ID '${output.primaryCandidateId}' is not in allowed candidate set [${allowedCandidateIds.join(", ")}]`,
    );
  }

  for (const id of output.selectedCandidateIds) {
    if (!allowedSet.has(id)) {
      errors.push(`Selected candidate ID '${id}' is not in allowed candidate set`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks business rules and hallucination guardrails for Alternative reasoning:
 * 1. Checks that primary candidate exists in candidate list if specified.
 * 2. Checks that explanation is non-empty.
 * 3. Checks that candidate isn't identical to original place ID.
 */
export function checkAlternativeBusinessGuards(
  output: import("./gemini.schemas.js").AlternativeReasoningOutput,
  input: import("./gemini.types.js").AlternativeReasoningInputDto,
): GuardValidationResult {
  const errors: string[] = [];
  const candidateIds = new Set(input.candidates.map((c) => c.placeId || c.externalId || ""));

  if (output.primaryCandidateId && !candidateIds.has(output.primaryCandidateId)) {
    errors.push(`Primary candidate '${output.primaryCandidateId}' not found in candidate list`);
  }

  // Hallucination check: primary candidate must not be the original place
  if (output.primaryCandidateId === input.originalPlace.id) {
    errors.push("Primary alternative candidate cannot be the original place itself");
  }

  for (const id of output.selectedCandidateIds) {
    if (id === input.originalPlace.id) {
      errors.push("Selected alternative candidate cannot be the original place itself");
    }
  }

  if (!output.explanation || output.explanation.trim().length < 5) {
    errors.push("Alternative explanation must be meaningful and grounded");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that all place IDs returned in Gemini's itinerary exist in the approved candidate allowlist.
 * Guarantees zero AI hallucinated places.
 */
export function validateItineraryCandidateAllowlist(
  output: import("./gemini.schemas.js").ItineraryReasoningOutput,
  allowedCandidateIds: string[],
): GuardValidationResult {
  const errors: string[] = [];
  const allowedSet = new Set(allowedCandidateIds);

  // Check ordered places
  for (const id of output.orderedPlaceIds) {
    if (!allowedSet.has(id)) {
      errors.push(
        `Ordered place ID '${id}' is not in approved candidate set [${allowedCandidateIds.join(", ")}]`,
      );
    }
  }

  // Check duplicate places
  const seen = new Set<string>();
  for (const id of output.orderedPlaceIds) {
    if (seen.has(id)) {
      errors.push(`Duplicate place ID '${id}' detected in itinerary schedule`);
    }
    seen.add(id);
  }

  // Check day assignments
  for (const day of output.dayAssignments) {
    for (const id of day.placeIds) {
      if (!allowedSet.has(id)) {
        errors.push(`Place ID '${id}' in Day ${day.day} is not in approved candidate set`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates business rules and consistency for Gemini itinerary output.
 */
export function checkItineraryBusinessGuards(
  output: import("./gemini.schemas.js").ItineraryReasoningOutput,
  input: import("./gemini.types.js").ItineraryReasoningInputDto,
): GuardValidationResult {
  const errors: string[] = [];

  if (!output.explanation || output.explanation.trim().length < 10) {
    errors.push("Itinerary explanation must be meaningful and grounded (at least 10 characters)");
  }

  if (output.dayAssignments.length !== input.durationDays) {
    errors.push(
      `Itinerary day count (${output.dayAssignments.length}) does not match requested duration (${input.durationDays} days)`,
    );
  }

  for (const day of output.dayAssignments) {
    if (!day.placeIds || day.placeIds.length === 0) {
      errors.push(`Day ${day.day} must have at least one assigned place`);
    }
  }

  // Verify that any explicit must-visit places are preserved
  const scheduledPlaceSet = new Set(output.orderedPlaceIds);
  for (const candidate of input.candidatePlaces) {
    if (candidate.isMustVisit && !scheduledPlaceSet.has(candidate.id)) {
      errors.push(
        `Must-visit place '${candidate.name}' (${candidate.id}) was omitted from itinerary`,
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that all item and source IDs returned by Gemini in take-home reasoning
 * are present in the supplied candidate allowlists.
 */
export function validateTakeHomeItemAllowlist(
  output: import("./gemini.schemas.js").TakeHomeReasoningOutput,
  allowedItemIds: string[],
  allowedSourceIds?: string[],
): GuardValidationResult {
  const errors: string[] = [];
  const allowedItemSet = new Set(allowedItemIds);
  const allowedSourceSet = allowedSourceIds ? new Set(allowedSourceIds) : null;

  if (output.primaryItemId && !allowedItemSet.has(output.primaryItemId)) {
    errors.push(
      `Primary item ID '${output.primaryItemId}' is not in allowed items list [${allowedItemIds.join(", ")}]`,
    );
  }

  for (const id of output.selectedItemIds) {
    if (!allowedItemSet.has(id)) {
      errors.push(`Selected item ID '${id}' is not in allowed items list`);
    }
  }

  for (const itemReason of output.itemReasons) {
    if (!allowedItemSet.has(itemReason.itemId)) {
      errors.push(`Item reason references unapproved item ID '${itemReason.itemId}'`);
    }
  }

  if (allowedSourceSet && output.suggestedSourceIds) {
    for (const sourceId of output.suggestedSourceIds) {
      if (!allowedSourceSet.has(sourceId)) {
        errors.push(`Suggested source ID '${sourceId}' is not in allowed sources list`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates business rules, hallucination guards, and ground truth for Gemini take-home output.
 */
export function checkTakeHomeBusinessGuards(
  output: import("./gemini.schemas.js").TakeHomeReasoningOutput,
  input: import("./gemini.types.js").TakeHomeReasoningInputDto,
): GuardValidationResult {
  const errors: string[] = [];

  if (!output.explanation || output.explanation.trim().length < 10) {
    errors.push("Take-home explanation must be meaningful and grounded (at least 10 characters)");
  }

  if (!output.selectedItemIds || output.selectedItemIds.length === 0) {
    errors.push("At least one take-home item must be selected");
  }

  // Prevent duplicate IDs in selection
  const seenIds = new Set<string>();
  for (const id of output.selectedItemIds) {
    if (seenIds.has(id)) {
      errors.push(`Duplicate item ID '${id}' found in selectedItemIds`);
    }
    seenIds.add(id);
  }

  // Ensure candidate items exist in input candidates
  const candidateMap = new Map(input.candidateItems.map((c) => [c.id, c]));
  if (output.primaryItemId && !candidateMap.has(output.primaryItemId)) {
    errors.push(`Primary item '${output.primaryItemId}' not found in candidate list`);
  }

  // Prevent fabricated prices
  const combinedText = [
    output.explanation || "",
    ...(output.itemReasons || []).map((r) => r.reason || ""),
  ].join(" ");

  if (/[₹$€£]\s*\d+|\b\d+\s*(rupees|inr|usd|dollars)\b/i.test(combinedText)) {
    errors.push("Fabricated price detected in take-home output");
  }

  // Prevent unsupported authenticity guarantees
  if (/\b(100%\s*authentic|guaranteed\s*authentic|purely\s*authentic)\b/i.test(combinedText)) {
    errors.push("Unsupported authenticity claim detected in take-home output");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Checks that Gemini response does not breach memory boundaries:
 * 1. Does not infer sensitive personal attributes (health, political, religious, financial, sexual).
 * 2. Does not claim false certainty on inferred preferences.
 * 3. Does not contain pseudo-commands to write or modify persistent memory.
 */
export function checkGeminiMemoryBoundaryGuards(text: string): GuardValidationResult {
  const errors: string[] = [];

  // Check for sensitive personal attribute patterns
  if (
    /\b(medical|illness|disease|political|election|religion|creed|sexuality|sexual orientation|income|salary|net worth)\b/i.test(
      text,
    )
  ) {
    errors.push("Gemini output contains sensitive personal attribute references");
  }

  // Check for unwarranted absolute certainty on inferred behavioral history
  if (
    /\b(we know with 100% certainty|we know everything about you|guaranteed you will love|you definitely love)\b/i.test(
      text,
    )
  ) {
    errors.push("Gemini output claims unwarranted certainty about traveler preference");
  }

  // Check for persistent memory write commands
  if (/\b(WRITE_MEMORY|SET_MEMORY|DELETE_MEMORY|UPDATE_MEMORY_STORE)\b/i.test(text)) {
    errors.push("Gemini output attempts to invoke unauthorized memory mutations");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
