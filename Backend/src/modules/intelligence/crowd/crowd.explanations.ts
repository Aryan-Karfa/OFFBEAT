import type { CrowdPatternDto, DayType } from "./crowd.types.js";

/**
 * Generates transparent, human-readable crowd explanations based on contextual patterns.
 */
export function generateCrowdExplanation(
  patterns: CrowdPatternDto[],
  preferredDayType?: DayType,
): string {
  if (!patterns || patterns.length === 0) {
    return "Crowd information unavailable for this location.";
  }

  const parts: string[] = [];

  if (preferredDayType && preferredDayType !== "ANY") {
    const prefPattern = patterns.find((p) => p.dayType === preferredDayType);
    if (prefPattern) {
      parts.push(
        `For ${preferredDayType.toLowerCase()}s, conditions are typically ${prefPattern.level.toLowerCase().replace(/_/g, " ")}.`,
      );
    }
  }

  // 1. Identify low-crowd opportunities
  const lowCrowd = patterns.filter((p) => p.level === "LOW");
  if (lowCrowd.length > 0) {
    const contextStrs = lowCrowd.map((p) => {
      const day =
        p.dayType === "WEEKDAY" ? "weekday" : p.dayType === "WEEKEND" ? "weekend" : "general";
      const time = p.time ? ` (${p.time})` : "";
      return `${day}${time}`;
    });
    parts.push(`Lower crowd reported during ${contextStrs.join(", ")}.`);
  }

  // 2. Identify peak / busy times
  const highCrowd = patterns.filter((p) => p.level === "HIGH" || p.level === "VERY_HIGH");
  if (highCrowd.length > 0) {
    const contextStrs = highCrowd.map((p) => {
      const day =
        p.dayType === "WEEKEND" ? "weekends" : p.dayType === "WEEKDAY" ? "weekdays" : "peak hours";
      const time = p.time ? ` (${p.time})` : "";
      return `${day}${time}`;
    });
    parts.push(`Expect higher visitor traffic during ${contextStrs.join(", ")}.`);
  }

  // 3. Highlight specific observations if available
  const detailedObs = patterns.find((p) => Boolean(p.observation));
  if (detailedObs && detailedObs.observation) {
    parts.push(`Traveler note: "${detailedObs.observation}".`);
  }

  if (parts.length === 0) {
    const first = patterns[0];
    if (first) {
      return `Typically experiences ${first.level.toLowerCase()} crowd levels based on traveler observations.`;
    }
    return "Crowd levels vary depending on season and day of the week.";
  }

  return parts.join(" ");
}
