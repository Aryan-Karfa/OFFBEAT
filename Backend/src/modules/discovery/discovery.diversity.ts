import type { ScoredCandidate } from "./discovery.types.js";

export class DiscoveryDiversity {
  /**
   * Applies a deterministic diversity pass over scored candidates.
   * Avoids clusters of 3+ consecutive items sharing the exact same primary category
   * or destination when comparably strong candidates (within 12 score points) are available.
   */
  public static diversify(
    scoredCandidates: ScoredCandidate[],
    maxConsecutiveSameCategory = 2,
    maxConsecutiveSameDestination = 2,
  ): ScoredCandidate[] {
    if (scoredCandidates.length <= 2) {
      return [...scoredCandidates];
    }

    const pool = [...scoredCandidates];
    const result: ScoredCandidate[] = [];

    // Helper to get primary category
    const getPrimaryCategory = (sc: ScoredCandidate): string =>
      (sc.candidate.categories[0] || "General").toLowerCase();

    const getDestination = (sc: ScoredCandidate): string =>
      (sc.candidate.destination || "").toLowerCase();

    while (pool.length > 0) {
      // Check last items in result
      const recentCategories = result
        .slice(-maxConsecutiveSameCategory)
        .map((item) => (item ? getPrimaryCategory(item) : ""));
      const recentDestinations = result
        .slice(-maxConsecutiveSameDestination)
        .map((item) => (item ? getDestination(item) : ""));

      // Find best candidate in pool
      let chosenIndex = 0;
      const topCandidate = pool[0];

      if (topCandidate && result.length >= maxConsecutiveSameCategory) {
        const topCat = getPrimaryCategory(topCandidate);
        const topDest = getDestination(topCandidate);

        const categoryOvercrowded =
          recentCategories.length >= maxConsecutiveSameCategory &&
          recentCategories.every((c) => c === topCat);

        const destinationOvercrowded =
          recentDestinations.length >= maxConsecutiveSameDestination &&
          recentDestinations.every((d) => d === topDest);

        if (categoryOvercrowded || destinationOvercrowded) {
          // Look for an alternative within 12 score points of top candidate
          const alternativeIndex = pool.findIndex((item, idx) => {
            if (idx === 0 || !item) return false;
            const scoreDiff = topCandidate.score - item.score;
            if (scoreDiff > 12) return false; // Don't compromise quality too much

            const itemCat = getPrimaryCategory(item);
            const itemDest = getDestination(item);

            const relievesCategory = categoryOvercrowded && itemCat !== topCat;
            const relievesDestination = destinationOvercrowded && itemDest !== topDest;

            // An acceptable alternative breaks the run of the overcrowded attribute
            return relievesCategory || relievesDestination;
          });

          if (alternativeIndex > 0) {
            chosenIndex = alternativeIndex;
          }
        }
      }

      // Move chosen candidate from pool to result
      const removed = pool.splice(chosenIndex, 1);
      if (removed[0]) {
        result.push(removed[0]);
      }
    }

    return result;
  }
}
