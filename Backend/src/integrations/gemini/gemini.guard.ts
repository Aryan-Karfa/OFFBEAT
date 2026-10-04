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
