import type {
  DiscoveryCandidate,
  DiscoveryContextDto,
  ScoreBreakdown,
  ScoredCandidate,
  ScorerWeights,
} from "./discovery.types.js";
import {
  DEFAULT_SCORER_WEIGHTS,
  TRAVEL_TASTE_ALIASES,
  EXPERIENCE_TASTE_ALIASES,
  DAY_AFFINITY_TOKENS,
  NIGHT_AFFINITY_TOKENS,
} from "./discovery.config.js";

export class DiscoveryScorer {
  private weights: ScorerWeights;

  constructor(customWeights?: Partial<ScorerWeights>) {
    this.weights = {
      ...DEFAULT_SCORER_WEIGHTS,
      ...customWeights,
    };
  }

  /**
   * Evaluates a candidate against traveler discovery context using deterministic multi-signal ranking.
   */
  public scoreCandidate(
    candidate: DiscoveryCandidate,
    context: DiscoveryContextDto,
  ): ScoredCandidate {
    const candidateTokens = this.extractCandidateTokens(candidate);

    // 1. Travel Taste Matching (30%)
    const { score: travelScore, matchedTastes } = this.calculateTravelTasteScore(
      candidateTokens,
      context.travelTaste,
    );

    // 2. Experience Taste Matching (30%)
    const { score: expScore, matchedExperiences } = this.calculateExperienceTasteScore(
      candidateTokens,
      context.experienceTaste,
    );

    // 3. Category Relevance (15%)
    const catScore = this.calculateCategoryRelevance(candidate);

    // 4. Geographic Relevance (10%)
    const { score: geoScore, isExactRegion } = this.calculateGeographicScore(candidate, context);

    // 5. Day / Night Compatibility (5%)
    const { score: dayNightScore, dayNightMatch } = this.calculateDayNightScore(
      candidateTokens,
      context.dayNight,
    );

    // 6. Rating Signal (5%)
    const ratingScore = this.calculateRatingScore(candidate.rating);

    // 7. Data Completeness (5%)
    const completenessScore = this.calculateCompletenessScore(candidate);

    // Calculate weighted total score (0 to 100)
    const rawTotal =
      travelScore * this.weights.travelTaste +
      expScore * this.weights.experienceTaste +
      catScore * this.weights.categoryRelevance +
      geoScore * this.weights.geographicRelevance +
      dayNightScore * this.weights.dayNightCompatibility +
      ratingScore * this.weights.ratingSignal +
      completenessScore * this.weights.dataCompleteness;

    const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal * 100)));

    // 8. Bounded Personalization Adjustment (Phase 15 Memory)
    let personalizationBonus = 0;
    const personalizedReasons: string[] = [];
    if (context.personalization && context.personalization.memoryEnabled) {
      const affinities = context.personalization.categoryAffinities || [];
      for (const aff of affinities) {
        const affKey = aff.category.toLowerCase();
        if (candidateTokens.some((tok) => tok.includes(affKey) || affKey.includes(tok))) {
          personalizationBonus += Math.min(Math.round(aff.weight * 5), 5);
          personalizedReasons.push(`Matches your remembered preference for ${aff.category}`);
          break;
        }
      }

      // Check explicit remembered travel tastes if not conflicting with current session
      const rememberedTastes = context.personalization.travelTaste || [];
      for (const rt of rememberedTastes) {
        if (!context.travelTaste.includes(rt) && candidateTokens.includes(rt.toLowerCase())) {
          personalizationBonus += 3;
          personalizedReasons.push(`Reflects your saved travel style (${rt})`);
          break;
        }
      }

      personalizationBonus = Math.min(8, personalizationBonus);
    }

    const finalTotalScore = Math.max(0, Math.min(100, totalScore + personalizationBonus));

    const breakdown: ScoreBreakdown = {
      travelTasteScore: Math.round(travelScore * 100),
      experienceTasteScore: Math.round(expScore * 100),
      categoryScore: Math.round(catScore * 100),
      geographicScore: Math.round(geoScore * 100),
      dayNightScore: Math.round(dayNightScore * 100),
      ratingScore: Math.round(ratingScore * 100),
      completenessScore: Math.round(completenessScore * 100),
      personalizationScore: personalizationBonus,
      totalScore: finalTotalScore,
    };

    // Generate explainable product-level reasons ("why this matches")
    const why = this.generateExplanations({
      candidate,
      context,
      matchedTastes,
      matchedExperiences,
      isExactRegion,
      dayNightMatch,
      rating: candidate.rating,
    });

    if (personalizedReasons.length > 0) {
      why.push(...personalizedReasons);
    }

    return {
      candidate,
      score: finalTotalScore,
      why,
      breakdown,
    };
  }

  /**
   * Extracts search tokens from name, categories, and description.
   */
  private extractCandidateTokens(candidate: DiscoveryCandidate): string[] {
    const tokens = new Set<string>();

    const addText = (text?: string | null) => {
      if (!text) return;
      const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
      normalized.split(/\s+/).forEach((w) => {
        if (w.length > 2) tokens.add(w);
      });
    };

    addText(candidate.name);
    addText(candidate.description);
    candidate.categories.forEach((cat) => {
      tokens.add(cat.toLowerCase().trim());
      addText(cat);
    });

    return Array.from(tokens);
  }

  private calculateTravelTasteScore(
    candidateTokens: string[],
    selectedTastes: string[],
  ): { score: number; matchedTastes: string[] } {
    if (!selectedTastes || selectedTastes.length === 0) {
      return { score: 0.6, matchedTastes: [] }; // Neutral baseline when user has no taste filter
    }

    const matched: string[] = [];

    for (const taste of selectedTastes) {
      const aliases = TRAVEL_TASTE_ALIASES[taste] || [taste];
      const hasMatch = aliases.some((alias) =>
        candidateTokens.some((tok) => tok === alias || tok.includes(alias) || alias.includes(tok)),
      );
      if (hasMatch) {
        matched.push(taste);
      }
    }

    // Ratio of matches
    const ratio = matched.length / selectedTastes.length;
    return {
      score: Math.min(1.0, ratio * 1.1),
      matchedTastes: matched,
    };
  }

  private calculateExperienceTasteScore(
    candidateTokens: string[],
    selectedExperiences: string[],
  ): { score: number; matchedExperiences: string[] } {
    if (!selectedExperiences || selectedExperiences.length === 0) {
      return { score: 0.6, matchedExperiences: [] };
    }

    const matched: string[] = [];

    for (const exp of selectedExperiences) {
      const aliases = EXPERIENCE_TASTE_ALIASES[exp] || [exp];
      const hasMatch = aliases.some((alias) =>
        candidateTokens.some((tok) => tok === alias || tok.includes(alias) || alias.includes(tok)),
      );
      if (hasMatch) {
        matched.push(exp);
      }
    }

    const ratio = matched.length / selectedExperiences.length;
    return {
      score: Math.min(1.0, ratio * 1.15),
      matchedExperiences: matched,
    };
  }

  private calculateCategoryRelevance(candidate: DiscoveryCandidate): number {
    if (!candidate.categories || candidate.categories.length === 0) {
      return 0.4;
    }
    // Boost places with substantive category taxonomy
    const count = candidate.categories.length;
    return count >= 3 ? 1.0 : count === 2 ? 0.85 : 0.7;
  }

  private calculateGeographicScore(
    candidate: DiscoveryCandidate,
    context: DiscoveryContextDto,
  ): { score: number; isExactRegion: boolean } {
    const candidateRegion = (candidate.region || "").toLowerCase();
    const targetRegionName = (context.region || "").toLowerCase();
    const targetRegionId = (context.regionId || "").toLowerCase();

    const isMatch =
      candidateRegion.includes(targetRegionName) ||
      targetRegionName.includes(candidateRegion) ||
      candidateRegion.includes(targetRegionId);

    const isDestinationMatch =
      context.destination &&
      candidate.destination.toLowerCase().includes(context.destination.toLowerCase());

    if (isDestinationMatch) {
      return { score: 1.0, isExactRegion: true };
    }
    if (isMatch) {
      return { score: 0.9, isExactRegion: true };
    }

    return { score: 0.5, isExactRegion: false };
  }

  private calculateDayNightScore(
    candidateTokens: string[],
    dayNight: "DAY" | "NIGHT" | "ANY",
  ): { score: number; dayNightMatch: boolean } {
    if (dayNight === "ANY") {
      return { score: 1.0, dayNightMatch: true };
    }

    if (dayNight === "DAY") {
      const hasDay = DAY_AFFINITY_TOKENS.some((t) => candidateTokens.includes(t));
      return { score: hasDay ? 1.0 : 0.6, dayNightMatch: hasDay };
    }

    if (dayNight === "NIGHT") {
      const hasNight = NIGHT_AFFINITY_TOKENS.some((t) => candidateTokens.includes(t));
      return { score: hasNight ? 1.0 : 0.5, dayNightMatch: hasNight };
    }

    return { score: 0.7, dayNightMatch: false };
  }

  private calculateRatingScore(rating?: number | null): number {
    if (!rating || typeof rating !== "number" || isNaN(rating)) {
      return 0.5; // neutral when no rating
    }
    // Normalize 3.0–5.0 range to 0.2–1.0
    if (rating >= 4.8) return 1.0;
    if (rating >= 4.5) return 0.9;
    if (rating >= 4.0) return 0.75;
    if (rating >= 3.5) return 0.6;
    return 0.4;
  }

  private calculateCompletenessScore(candidate: DiscoveryCandidate): number {
    let points = 0;
    if (candidate.location?.lat && candidate.location?.lng) points += 0.3;
    if (candidate.description && candidate.description.length > 20) points += 0.25;
    if (candidate.imageUrl) points += 0.2;
    if (candidate.address) points += 0.15;
    if (candidate.openingHours && candidate.openingHours.length > 0) points += 0.1;
    return Math.min(1.0, points);
  }

  /**
   * Generates deterministic, human-readable explanations.
   */
  private generateExplanations(args: {
    candidate: DiscoveryCandidate;
    context: DiscoveryContextDto;
    matchedTastes: string[];
    matchedExperiences: string[];
    isExactRegion: boolean;
    dayNightMatch: boolean;
    rating?: number | null;
  }): string[] {
    const reasons: string[] = [];

    // Format utility
    const formatSlug = (slug: string) =>
      slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // 1. Travel taste explanations
    if (args.matchedTastes.length >= 2) {
      const tasteLabels = args.matchedTastes.slice(0, 2).map(formatSlug).join(" and ");
      reasons.push(`Strong match for your ${tasteLabels} preferences`);
    } else if (args.matchedTastes.length === 1 && args.matchedTastes[0]) {
      reasons.push(`Matches your ${formatSlug(args.matchedTastes[0])} preference`);
    }

    // 2. Experience taste explanations
    if (args.matchedExperiences.length >= 2) {
      const expLabels = args.matchedExperiences.slice(0, 2).map(formatSlug).join(" + ");
      reasons.push(`Ideal fit for ${expLabels} experiences`);
    } else if (args.matchedExperiences.length === 1 && args.matchedExperiences[0]) {
      reasons.push(`Great for a ${formatSlug(args.matchedExperiences[0])} experience`);
    }

    // 3. Geographic context explanation
    if (args.isExactRegion) {
      const dest = args.candidate.destination ? `${args.candidate.destination}, ` : "";
      reasons.push(`Located in ${dest}${args.context.region}`);
    }

    // 4. Day / Night explanation
    if (args.dayNightMatch) {
      if (args.context.dayNight === "DAY") {
        reasons.push("Recommended for daylight exploration");
      } else if (args.context.dayNight === "NIGHT") {
        reasons.push("Atmospheric for twilight & nocturnal visits");
      }
    }

    // 5. Rating explanation (supporting only)
    if (reasons.length < 3 && args.rating && args.rating >= 4.4) {
      reasons.push(`Highly rated by visitors (${args.rating.toFixed(1)} ★)`);
    }

    // Fallback if no specific signals matched
    if (reasons.length === 0) {
      reasons.push(`Curated discovery in ${args.context.region}`);
      if (args.candidate.categories.length > 0) {
        reasons.push(`Features ${args.candidate.categories.slice(0, 2).join(", ")}`);
      }
    }

    // Cap at 3 concise bullet points for clean UI presentation
    return reasons.slice(0, 3);
  }
}

export const discoveryScorer = new DiscoveryScorer();
