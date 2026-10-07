import type { TakeHomeItemDto, TakeHomeQueryDto, ScoredTakeHomeItem } from "./take-home.types.js";

export class TakeHomeScorer {
  /**
   * Deterministically scores and ranks Take Home candidates.
   */
  public static scoreCandidates(
    candidates: TakeHomeItemDto[],
    query: TakeHomeQueryDto,
    targetDestinationId?: string,
  ): ScoredTakeHomeItem[] {
    const scoredList = candidates.map((item) =>
      TakeHomeScorer.scoreItem(item, query, targetDestinationId),
    );

    // Filter by verifiedOnly if requested
    let filtered = scoredList;
    if (query.verifiedOnly) {
      filtered = filtered.filter((item) => {
        const isHighConfidence = item.confidence?.evidenceStrength === "HIGH";
        const isVerifiedCommunity =
          item.community?.status === "COMMUNITY_VERIFIED" ||
          item.community?.status === "EXPERT_VERIFIED" ||
          item.community?.status === "OFFICIAL_CURATED";
        return isHighConfidence || isVerifiedCommunity;
      });
    }

    // Sort descending by rawScore
    return filtered.sort((a, b) => b.rawScore - a.rawScore);
  }

  public static scoreItem(
    item: TakeHomeItemDto,
    query: TakeHomeQueryDto,
    targetDestinationId?: string,
  ): ScoredTakeHomeItem {
    // 1. Local Relevance (weight: 0.30)
    let localRelevanceScore: number;
    switch (item.localRelevance) {
      case "SIGNATURE":
        localRelevanceScore = 1.0;
        break;
      case "STRONGLY_ASSOCIATED":
        localRelevanceScore = 0.85;
        break;
      case "LOCAL":
        localRelevanceScore = 0.7;
        break;
      case "REGIONAL":
        localRelevanceScore = 0.55;
        break;
      case "UNKNOWN":
      default:
        localRelevanceScore = 0.35;
        break;
    }

    // 2. Community signals (weight: 0.20)
    let communityScore = 0.3; // baseline if no community signal
    if (item.community) {
      switch (item.community.status) {
        case "OFFICIAL_CURATED":
        case "EXPERT_VERIFIED":
          communityScore = 0.95;
          break;
        case "COMMUNITY_VERIFIED":
          communityScore = 0.9;
          break;
        case "COMMUNITY_SUPPORTED":
          communityScore = 0.75;
          break;
        case "SUBMITTED":
        default:
          communityScore = 0.5;
          break;
      }
      const supportBonus = Math.min((item.community.supportCount || 0) * 0.04, 0.15);
      communityScore = Math.min(1.0, communityScore + supportBonus);
    }

    // 3. Confidence signal (weight: 0.15)
    const confidenceScore = item.confidence?.score ?? 0.7;

    // 4. Destination relation (weight: 0.15)
    let destinationRelationScore: number;
    if (targetDestinationId) {
      if (item.destinationId === targetDestinationId) {
        destinationRelationScore = 1.0;
      } else {
        destinationRelationScore = 0.6;
      }
    } else {
      destinationRelationScore = 0.8;
    }

    // 5. Taste / Context Match (weight: 0.10)
    let tasteMatchScore = 0.8;
    const requestedTravelTastes = query.travelTaste || [];
    const requestedExpTastes = query.experienceTaste || [];
    const allRequestedTastes = [...requestedTravelTastes, ...requestedExpTastes].map((t) =>
      t.toLowerCase(),
    );

    if (allRequestedTastes.length > 0) {
      let matched = 0;

      // Category affinity rules
      if (
        (allRequestedTastes.includes("food") || allRequestedTastes.includes("culinary")) &&
        (item.category === "FOOD" ||
          item.category === "TEA_COFFEE" ||
          item.category === "SPICES" ||
          item.category === "SWEETS")
      ) {
        matched += 2;
      }
      if (
        (allRequestedTastes.includes("culture") ||
          allRequestedTastes.includes("heritage") ||
          allRequestedTastes.includes("art")) &&
        (item.category === "HANDICRAFT" ||
          item.category === "TEXTILE" ||
          item.category === "ART" ||
          item.category === "CULTURAL_GOOD")
      ) {
        matched += 2;
      }
      if (
        (allRequestedTastes.includes("nature") || allRequestedTastes.includes("tea")) &&
        (item.category === "TEA_COFFEE" || item.category === "LOCAL_PRODUCT")
      ) {
        matched += 2;
      }
      if (allRequestedTastes.includes("shopping") || allRequestedTastes.includes("local-life")) {
        matched += 1;
      }

      if (matched > 0) {
        tasteMatchScore = Math.min(1.0, 0.5 + matched * 0.2);
      } else {
        tasteMatchScore = 0.4;
      }
    }

    // Phase 15: Memory Personalization Integration
    if (query.travelerPersonalization?.memoryEnabled) {
      const preferredCategories = query.travelerPersonalization.takeHomePreference || [];
      if (preferredCategories.includes(item.category)) {
        tasteMatchScore = Math.min(1.0, tasteMatchScore + 0.15);
      }
    }

    // 6. Source completeness (weight: 0.10)
    let sourceCompletenessScore = 0.3;
    const sourceCount = item.placesToFind?.length || 0;
    if (sourceCount >= 2) {
      sourceCompletenessScore = 1.0;
    } else if (sourceCount === 1) {
      sourceCompletenessScore = 0.75;
    }

    // Gift fit bonus
    let giftFitScore = 0.5;
    if (query.giftFor) {
      if (item.goodFor.includes(query.giftFor)) {
        giftFitScore = 1.0;
      } else {
        giftFitScore = 0.3;
      }
    }

    // Category match filter/boost
    let categoryMultiplier = 1.0;
    if (query.category) {
      if (item.category === query.category) {
        categoryMultiplier = 1.1;
      } else {
        categoryMultiplier = 0.3;
      }
    }

    // Weighted sum
    const baseWeighted =
      localRelevanceScore * 0.3 +
      communityScore * 0.2 +
      confidenceScore * 0.15 +
      destinationRelationScore * 0.15 +
      tasteMatchScore * 0.1 +
      sourceCompletenessScore * 0.1;

    // Small bonus for gift fit when giftFor is requested
    const giftBonus = query.giftFor && giftFitScore === 1.0 ? 0.05 : 0;
    const rawScore = Math.min(1.0, Math.max(0.0, (baseWeighted + giftBonus) * categoryMultiplier));

    return {
      ...item,
      rawScore: Math.round(rawScore * 100) / 100,
      scoreBreakdown: {
        localRelevanceScore: Math.round(localRelevanceScore * 100) / 100,
        tasteMatchScore: Math.round(tasteMatchScore * 100) / 100,
        communityScore: Math.round(communityScore * 100) / 100,
        confidenceScore: Math.round(confidenceScore * 100) / 100,
        giftFitScore: Math.round(giftFitScore * 100) / 100,
      },
    };
  }
}
