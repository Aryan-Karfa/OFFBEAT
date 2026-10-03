import type { EvidenceStrength, VerificationExplanationDto } from "@offbeat/shared";
import type { ConfidenceResult } from "./confidence.types.js";

/**
 * Derives human-friendly, evidence-based explanations from a confidence result.
 *
 * Strict Rule: Never claim absolute truth or 100% verification.
 * Focus exclusively on evidence strength and traveler confirmation signals.
 */
export function deriveEvidenceStrength(result: ConfidenceResult): EvidenceStrength {
  if (result.contradictionCount > 0 && result.score < 0.45) {
    return "CONTESTED";
  }
  if (result.score >= 0.7) {
    return "HIGH";
  }
  if (result.score >= 0.4) {
    return "MODERATE";
  }
  return "EMERGING";
}

export function generateConfidenceExplanation(
  result: ConfidenceResult,
  extraSignals?: {
    confirmCount?: number;
    hasPhoto?: boolean;
  },
): VerificationExplanationDto {
  const strength = deriveEvidenceStrength(result);
  const signals: string[] = [];

  // Headline
  let headline = "Emerging traveler discovery";
  if (strength === "HIGH") {
    headline = "Strong community evidence";
  } else if (strength === "MODERATE") {
    headline = "Community supported discovery";
  } else if (strength === "CONTESTED") {
    headline = "Conflicting community reports";
  }

  // Traveler supports signal
  if (result.supportCount > 0) {
    const confirms = extraSignals?.confirmCount ?? 0;
    if (confirms > 0) {
      signals.push(
        `Supported by ${result.supportCount} travelers (${confirms} direct confirmation${confirms > 1 ? "s" : ""})`,
      );
    } else {
      signals.push(
        `Supported by ${result.supportCount} traveler${result.supportCount > 1 ? "s" : ""}`,
      );
    }
  } else {
    signals.push("Awaiting traveler confirmations");
  }

  // Evidence signal
  if (result.evidenceCount > 0) {
    if (extraSignals?.hasPhoto) {
      signals.push(
        `Visual evidence attached (${result.evidenceCount} item${result.evidenceCount > 1 ? "s" : ""})`,
      );
    } else {
      signals.push(
        `${result.evidenceCount} supporting evidence item${result.evidenceCount > 1 ? "s" : ""} attached`,
      );
    }
  }

  // External corroboration signal
  if (result.externalCorroboration) {
    signals.push("Corroborated by verified external place records");
  }

  // Contradiction / reports signal
  if (result.contradictionCount > 0) {
    signals.push(
      `${result.contradictionCount} report${result.contradictionCount > 1 ? "s" : ""} recorded for moderation review`,
    );
  } else {
    signals.push("No conflicting traveler reports detected");
  }

  // Summary
  let summary = "This discovery is emerging and awaiting confirmation from more travelers.";
  if (strength === "HIGH") {
    summary =
      "Multiple independent travelers have confirmed this observation with consistent evidence and external alignment.";
  } else if (strength === "MODERATE") {
    summary =
      "This discovery has verified community support from fellow travelers and consistent place details.";
  } else if (strength === "CONTESTED") {
    summary =
      "Conflicting feedback or reports have been submitted. Travelers should proceed with awareness.";
  }

  return {
    headline,
    signals,
    summary,
  };
}
