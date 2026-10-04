import type {
  CrowdCalculationInputs,
  CrowdIntelligenceDto,
  CrowdPatternDto,
  CrowdLevel,
  CrowdFit,
  EvidenceStrength,
  ObservationSource,
} from "./crowd.types.js";
import { generateCrowdExplanation } from "./crowd.explanations.js";

/**
 * Determines crowd fit based on evaluated crowd level and optional experience tastes.
 */
export function evaluateCrowdFit(level: CrowdLevel, tastes?: string[]): CrowdFit {
  if (level === "UNKNOWN") return "UNKNOWN";

  const lowerCrowdKeywords = ["less_crowded", "peaceful", "quiet", "nature"];
  const prefersLowerCrowd = tastes?.some((t) =>
    lowerCrowdKeywords.includes(t.toLowerCase().replace(/[\s-]/g, "_")),
  );

  if (prefersLowerCrowd) {
    if (level === "LOW") return "LOWER_CROWD_MATCH";
    if (level === "HIGH" || level === "VERY_HIGH") return "HIGHER_CROWD";
    return "NEUTRAL";
  }

  switch (level) {
    case "LOW":
      return "LOWER_CROWD_MATCH";
    case "MODERATE":
      return "NEUTRAL";
    case "HIGH":
    case "VERY_HIGH":
      return "HIGHER_CROWD";
    default:
      return "UNKNOWN";
  }
}

/**
 * Deterministic Crowd Intelligence Engine
 * Aggregates place and destination observations into contextual patterns without statistical hallucination.
 */
export function calculateCrowdIntelligence(inputs: CrowdCalculationInputs): CrowdIntelligenceDto {
  const now = new Date();

  // 1. Filter active (unexpired) observations
  const activePlaceObs = (inputs.placeObservations || []).filter((obs) => {
    if (!obs.expiresAt) return true;
    return new Date(obs.expiresAt) > now;
  });

  const activeDestObs = (inputs.destinationObservations || []).filter((obs) => {
    if (!obs.expiresAt) return true;
    return new Date(obs.expiresAt) > now;
  });

  // 2. Build contextual patterns (Place observations take precedence)
  const patterns: CrowdPatternDto[] = [];

  for (const obs of activePlaceObs) {
    const timeDisplay =
      obs.timeStart && obs.timeEnd ? `${obs.timeStart}-${obs.timeEnd}` : obs.timeStart || null;

    patterns.push({
      dayType: obs.dayType,
      time: timeDisplay,
      season: obs.season,
      level: obs.level,
      source: obs.source,
      observation: obs.observation || null,
    });
  }

  // If no place observations, incorporate destination observations as background
  if (patterns.length === 0 && activeDestObs.length > 0) {
    for (const obs of activeDestObs) {
      const timeDisplay =
        obs.timeStart && obs.timeEnd ? `${obs.timeStart}-${obs.timeEnd}` : obs.timeStart || null;

      patterns.push({
        dayType: obs.dayType,
        time: timeDisplay,
        season: obs.season,
        level: obs.level,
        source: obs.source,
        observation: obs.observation
          ? `Destination signal: ${obs.observation}`
          : "Destination crowd trend",
      });
    }
  }

  // Derive from community CROWD_TIP submissions if still empty
  if (patterns.length === 0 && inputs.communitySubmissions) {
    const crowdSubs = inputs.communitySubmissions.filter(
      (s) => s.type === "CROWD_TIP" && s.status === "APPROVED",
    );

    for (const sub of crowdSubs) {
      const text = `${sub.title} ${sub.content}`.toLowerCase();
      let level: CrowdLevel = "MODERATE";
      if (
        text.includes("heavy") ||
        text.includes("congestion") ||
        text.includes("crowded") ||
        text.includes("lines")
      ) {
        level = text.includes("weekend") ? "HIGH" : "MODERATE";
      } else if (
        text.includes("quiet") ||
        text.includes("calm") ||
        text.includes("low crowd") ||
        text.includes("less crowded")
      ) {
        level = "LOW";
      }

      patterns.push({
        dayType: text.includes("weekend")
          ? "WEEKEND"
          : text.includes("weekday")
            ? "WEEKDAY"
            : "ANY",
        time: text.includes("morning") ? "05:00-08:00" : null,
        season: "ANY",
        level,
        source: "COMMUNITY",
        observation: sub.title,
      });
    }
  }

  // 3. Fallback if no observations exist: Do NOT fabricate measurements
  if (patterns.length === 0) {
    return {
      overall: "UNKNOWN",
      patterns: [],
      contextualSignals: [],
      explanation: "Crowd information unavailable for this location.",
      evidenceStrength: "EMERGING",
      confidence: 0,
      source: "SYSTEM",
      crowdFit: "UNKNOWN",
    };
  }

  // 4. Determine overall level based on query context if provided, or dominant place observation
  let overall: CrowdLevel = "UNKNOWN";
  let primarySource: ObservationSource = "COMMUNITY";

  if (inputs.dayType && inputs.dayType !== "ANY") {
    const matchingPattern = patterns.find((p) => p.dayType === inputs.dayType);
    if (matchingPattern) {
      overall = matchingPattern.level;
      primarySource = matchingPattern.source;
    }
  }

  if (overall === "UNKNOWN" && patterns.length > 0) {
    // Pick the most relevant place pattern (prefer specific time window or first pattern)
    const specificPattern = patterns.find((p) => Boolean(p.time)) || patterns[0];
    if (specificPattern) {
      overall = specificPattern.level;
      primarySource = specificPattern.source;
    }
  }

  // 5. Determine evidence strength and confidence
  const sampleCount = patterns.length;
  let evidenceStrength: EvidenceStrength = "EMERGING";
  let confidenceScore = 0.5;

  if (sampleCount >= 3) {
    evidenceStrength = "HIGH";
    confidenceScore = 0.85;
  } else if (sampleCount >= 1) {
    evidenceStrength = "MODERATE";
    confidenceScore = 0.72;
  }

  const crowdFit = evaluateCrowdFit(overall);
  const explanation = generateCrowdExplanation(patterns, inputs.dayType);
  const contextualSignals = patterns.map((p) => p.observation || `${p.dayType}: ${p.level}`);

  return {
    overall,
    patterns,
    contextualSignals,
    explanation,
    evidenceStrength,
    confidence: confidenceScore,
    source: primarySource,
    crowdFit,
  };
}

export const calculateCrowdContext = calculateCrowdIntelligence;
