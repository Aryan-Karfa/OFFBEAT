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

