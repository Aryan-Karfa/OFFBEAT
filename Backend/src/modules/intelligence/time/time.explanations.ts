import type { OperatingHoursDto, RecommendedTimeDto } from "./time.types.js";

/**
 * Generates transparent, human-readable explanations that strictly separate
 * operating facts from community recommendations.
 */
export function generateTimeExplanation(
  operatingHours: OperatingHoursDto,
  recommendedTimes: RecommendedTimeDto[],
  experienceTastes?: string[],
): string {
  const parts: string[] = [];

  // 1. Operating hours statement (Fact)
  if (operatingHours.schedule && operatingHours.schedule.length > 0) {
    const first = operatingHours.schedule[0];
    if (first) {
      if (first.is24Hours) {
        parts.push("Open 24 hours daily.");
      } else if (first.open && first.close) {
        parts.push(`Operating hours from ${first.open} to ${first.close}.`);
      } else if (first.description) {
        parts.push(`Opening information: ${first.description}.`);
      }
    }
  }

  // 2. Community recommendations (Observation)
  if (recommendedTimes.length > 0) {
    const topRec = recommendedTimes[0];
    if (topRec) {
      const sourceLabel =
        topRec.source === "COMMUNITY" ? "Community travelers recommend" : "Recommended";
      parts.push(
        `${sourceLabel} visiting between ${topRec.start} and ${topRec.end}${topRec.reason ? ` (${topRec.reason})` : ""}.`,
      );
    }
  }

  // 3. Experience match context
  if (experienceTastes && experienceTastes.length > 0) {
    if (experienceTastes.includes("sunrise") || experienceTastes.includes("photography")) {
      parts.push("Optimal lighting conditions occur in the early morning window.");
    } else if (experienceTastes.includes("sunset") || experienceTastes.includes("golden_hour")) {
      parts.push("Best evening atmosphere coincides with pre-sunset hours.");
    }
  }

  if (parts.length === 0) {
    return "Operating hours and timing recommendations are not yet recorded for this location.";
  }

  return parts.join(" ");
}
