import type { PlaceWithDetails } from "../places/places.types.js";
import type {
  RawCandidatePlace,
  ScoredAlternativeCandidate,
  CandidateGenerationQuery,
} from "./alternatives.types.js";
import type {
  TimeFit,
  CrowdFit,
  CrowdLevel,
  EvidenceStrength,
} from "@offbeat/shared";

function calculateCategorySimilarity(categoriesA: string[], categoriesB: string[]): number {
  if (!categoriesA.length || !categoriesB.length) return 0.2;
  const setA = new Set(categoriesA.map((c) => c.toLowerCase()));
  const setB = new Set(categoriesB.map((c) => c.toLowerCase()));

  let intersection = 0;
  for (const c of setA) {
    if (setB.has(c)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

function calculateTasteMatch(categories: string[], tastes: string[]): number {
  if (!tastes.length) return 0.5;
  const catSet = new Set(categories.map((c) => c.toLowerCase()));
  let matches = 0;
  for (const t of tastes) {
    const lower = t.toLowerCase();
    if (catSet.has(lower) || Array.from(catSet).some((c) => c.includes(lower) || lower.includes(c))) {
      matches++;
    }
  }
  return matches / tastes.length;
}

function calculateGeographicProximity(
  candidate: RawCandidatePlace,
  originalPlace: PlaceWithDetails,
): number {
  // If in the exact same destination
  if (
    candidate.destination &&
    originalPlace.destination &&
    candidate.destination.toLowerCase() === originalPlace.destination.name.toLowerCase()
  ) {
    return 1.0;
  }

  // If in the same region
  if (
    candidate.regionId &&
    originalPlace.destination?.regionId &&
    candidate.regionId === originalPlace.destination.regionId
  ) {
    return 0.7;
  }

  // If coordinates exist, approximate distance
  if (candidate.location && originalPlace.latitude && originalPlace.longitude) {
    const latDiff = Math.abs(candidate.location.lat - originalPlace.latitude);
    const lngDiff = Math.abs(candidate.location.lng - originalPlace.longitude);
    const approxDist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    if (approxDist < 0.2) return 0.9;
    if (approxDist < 0.5) return 0.75;
    if (approxDist < 1.0) return 0.5;
  }

  return 0.3;
}

export class AlternativesScorer {
  scoreCandidate(
    candidate: RawCandidatePlace,
    originalPlace: PlaceWithDetails,
    query: CandidateGenerationQuery,
    signals?: {
      timeFit?: TimeFit;
      crowdFit?: CrowdFit;
      crowdLevel?: CrowdLevel;
      bestTime?: { start?: string; end?: string; reason?: string };
      confidence?: { score?: number; evidenceStrength?: EvidenceStrength; status?: string };
      community?: { submissionCount: number; helpfulCount: number; verifiedCount: number };
    },
  ): ScoredAlternativeCandidate {
    const originalCategories = originalPlace.categories.map((c) => c.category.name);
    const candidateCategories = candidate.categories;

    // 1. Core Feature Metrics (0.0 to 1.0)
    const categorySim = calculateCategorySimilarity(originalCategories, candidateCategories);
    const travelTasteMatch = calculateTasteMatch(candidateCategories, query.travelTaste);
    const experienceTasteMatch = calculateTasteMatch(candidateCategories, query.experienceTaste);
    const tasteMatch = (travelTasteMatch * 0.6 + experienceTasteMatch * 0.4);
    const geoProximity = calculateGeographicProximity(candidate, originalPlace);

    // 2. Intelligence Signals
    let timeFitScore = 0.5;
    if (signals?.timeFit === "GOOD") timeFitScore = 1.0;
    else if (signals?.timeFit === "PARTIAL") timeFitScore = 0.7;
    else if (signals?.timeFit === "CONFLICT") timeFitScore = 0.1;

    let crowdFitScore = 0.5;
    if (signals?.crowdLevel === "LOW" || signals?.crowdFit === "LOWER_CROWD_MATCH") crowdFitScore = 1.0;
    else if (signals?.crowdLevel === "MODERATE" || signals?.crowdFit === "NEUTRAL") crowdFitScore = 0.7;
    else if (signals?.crowdLevel === "HIGH" || signals?.crowdLevel === "VERY_HIGH" || signals?.crowdFit === "HIGHER_CROWD") crowdFitScore = 0.2;


    const commSubmissions = signals?.community?.submissionCount || 0;
    const commVerified = signals?.community?.verifiedCount || 0;
    const communityScore = Math.min(1.0, (commSubmissions * 0.1) + (commVerified * 0.25));

    const confidenceScore = signals?.confidence?.score !== undefined ? signals.confidence.score : 0.6;

    // 3. Mode-specific Weighting (Deterministic)
    let score = 0;
    switch (query.mode) {
      case "REPLACEMENT":
        // Prioritize true substitute: category, taste, geography, confidence
        score =
          categorySim * 0.35 +
          tasteMatch * 0.25 +
          geoProximity * 0.20 +
          confidenceScore * 0.10 +
          timeFitScore * 0.10;
        break;

      case "ENHANCEMENT":
        // Prioritize nearby stop that pairs with the original journey
        score =
          geoProximity * 0.35 +
          tasteMatch * 0.25 +
          timeFitScore * 0.15 +
          communityScore * 0.15 +
          confidenceScore * 0.10;
        break;

      case "COMPLEMENTARY":
        // Balance original with a distinct type of experience in same destination
        const complementaryDiversity = 1 - (categorySim * 0.5); // Diversity bonus
        score =
          geoProximity * 0.35 +
          complementaryDiversity * 0.25 +
          tasteMatch * 0.20 +
          confidenceScore * 0.10 +
          communityScore * 0.10;
        break;

      case "NEARBY_DISCOVERY":
        // Hidden gem in close proximity
        score =
          geoProximity * 0.40 +
          communityScore * 0.25 +
          tasteMatch * 0.20 +
          confidenceScore * 0.15;
        break;

      case "TIMING_ALTERNATIVE":
        // Better scheduling/time fit
        score =
          timeFitScore * 0.45 +
          geoProximity * 0.25 +
          tasteMatch * 0.15 +
          categorySim * 0.15;
        break;

      case "LOWER_CROWD":
        // Lower crowd profile without fabricating
        score =
          crowdFitScore * 0.45 +
          geoProximity * 0.25 +
          tasteMatch * 0.15 +
          confidenceScore * 0.15;
        break;
    }

    // 4. Generate Truthful Why Explanation
    const why = this.generateWhyExplanation(
      candidate,
      originalPlace,
      query,
      signals,
      {
        categorySim,
        tasteMatch,
        geoProximity,
      },
    );

    // Tradeoff explanation
    let tradeoff: string | undefined;
    if (signals?.timeFit === "PARTIAL") {
      tradeoff = "Visiting outside the optimal timing window may limit visibility or access.";
    } else if (geoProximity < 0.6) {
      tradeoff = "Located further from your central route; allow additional transit time.";
    } else if (signals?.crowdLevel === "HIGH" || signals?.crowdLevel === "VERY_HIGH") {
      tradeoff = "Popular destination with elevated visitor density during peak hours.";
    }

    // Relationship Context for Pairing Modes
    let relationshipContext: string | undefined;
    if (query.mode === "ENHANCEMENT") {
      relationshipContext = `Pairs naturally with ${originalPlace.name} in ${originalPlace.destination?.name || "your journey"}`;
    } else if (query.mode === "COMPLEMENTARY") {
      relationshipContext = `Complements ${originalPlace.name} with distinct ${candidate.categories[0] || "cultural"} depth`;
    }

    return {
      placeId: candidate.id,
      externalId: candidate.externalId,
      name: candidate.name,
      slug: candidate.slug,
      destination: candidate.destination,
      category: candidate.categories[0],
      categories: candidate.categories,
      source: candidate.source,
      why,
      timeFit: signals?.timeFit || "UNKNOWN",
      crowdFit:
        signals?.crowdFit === "LOWER_CROWD_MATCH"
          ? "GOOD"
          : signals?.crowdFit === "NEUTRAL"
            ? "PARTIAL"
            : "UNKNOWN",
      confidence: signals?.confidence,
      community: signals?.community,
      location: candidate.location,
      imageUrl: candidate.imageUrl,
      description: candidate.description,
      rating: candidate.rating,
      userRatingsTotal: candidate.userRatingsTotal,
      score: Math.round(score * 100),
      rawScore: score,
      tradeoff,
      relationshipContext,
      bestTime: signals?.bestTime,
      crowd: signals?.crowdLevel
        ? { level: signals.crowdLevel }
        : undefined,
      scoringBreakdown: {
        categorySimilarity: categorySim,
        tasteMatch,
        geographicProximity: geoProximity,
        timeFitScore,
        crowdFitScore,
        communityScore,
        confidenceScore,
      },
    };
  }

  private generateWhyExplanation(
    candidate: RawCandidatePlace,
    originalPlace: PlaceWithDetails,
    query: CandidateGenerationQuery,
    signals?: {
      timeFit?: TimeFit;
      crowdLevel?: CrowdLevel;
      bestTime?: { start?: string; end?: string; reason?: string };
      community?: { submissionCount: number; verifiedCount: number };
    },
    metrics?: {
      categorySim: number;
      tasteMatch: number;
      geoProximity: number;
    },
  ): string {
    const cat = candidate.categories[0] || "viewpoint";
    const dest = candidate.destination || originalPlace.destination?.name || "the area";

    switch (query.mode) {
      case "ENHANCEMENT":
        return `Pairs naturally with ${originalPlace.name} in ${dest}, adding ${cat.toLowerCase()} perspective to enrich your mountain and heritage journey.`;

      case "COMPLEMENTARY":
        return `Complements ${originalPlace.name} by offering a distinct ${cat.toLowerCase()} atmosphere within ${dest}.`;

      case "NEARBY_DISCOVERY":
        if (signals?.community?.verifiedCount) {
          return `A community-verified hidden gem located close to ${originalPlace.name} with ${signals.community.verifiedCount} verified observations.`;
        }
        return `A lesser-known discovery located close to ${originalPlace.name}, aligned with your preferences for ${query.travelTaste.join(" and ") || "exploration"}.`;

      case "LOWER_CROWD":
        if (signals?.crowdLevel === "LOW") {
          return `Community and pattern data indicate low visitor density, providing a quieter atmosphere than ${originalPlace.name}.`;
        }
        return `Identified as a less congested alternative in ${dest}; crowd density is currently ${signals?.crowdLevel || "UNKNOWN"}.`;

      case "TIMING_ALTERNATIVE":
        if (signals?.bestTime?.start && signals?.bestTime?.end) {
          return `Features an optimal visiting window (${signals.bestTime.start} - ${signals.bestTime.end}) that better accommodates your schedule.`;
        }
        return `Offers flexible operating hours compatible with your ${query.dayNight.toLowerCase()} itinerary in ${dest}.`;

      case "REPLACEMENT":
      default:
        if (metrics && metrics.tasteMatch > 0.6) {
          return `A direct substitute for ${originalPlace.name} with similar ${cat.toLowerCase()} appeal, matching your ${query.travelTaste.join(" and ") || "scenic"} preferences.`;
        }
        return `A comparable ${cat.toLowerCase()} experience in ${dest} offering similar scenic and heritage qualities.`;
    }
  }
}

export const alternativesScorer = new AlternativesScorer();
