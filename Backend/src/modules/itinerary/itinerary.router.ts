import { serpApiService, type SerpApiService } from "../../integrations/serpapi/serpapi.service.js";
import type { CandidatePlaceWithSignals } from "./itinerary.types.js";
import type { GeoLocation } from "@offbeat/shared";

export interface RoutedStopTransition {
  candidate: CandidatePlaceWithSignals;
  travelFromPreviousMinutes: number;
  travelDistanceMeters: number;
}

export class ItineraryRouter {
  constructor(private serpApi: SerpApiService = serpApiService) {}

  /**
   * Calculates Haversine distance in meters between two coordinates.
   */
  public calculateDistanceMeters(a?: GeoLocation, b?: GeoLocation): number {
    if (!a || !b) return 5000; // Default reasonable 5km urban buffer if coordinates missing

    const R = 6371e3;
    const phi1 = (a.lat * Math.PI) / 180;
    const phi2 = (b.lat * Math.PI) / 180;
    const deltaPhi = ((b.lat - a.lat) * Math.PI) / 180;
    const deltaLambda = ((b.lng - a.lng) * Math.PI) / 180;

    const val =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(val), Math.sqrt(1 - val));
    return Math.round(R * c);
  }

  /**
   * Sequentially orders candidate places to minimize backtracking and ensure diversity.
   */
  public async orderGeographically(
    candidates: CandidatePlaceWithSignals[],
    maxStops: number = 4,
    options?: { requestId?: string },
  ): Promise<RoutedStopTransition[]> {
    if (candidates.length === 0) return [];
    if (candidates.length === 1 && candidates[0]) {
      return [
        {
          candidate: candidates[0],
          travelFromPreviousMinutes: 0,
          travelDistanceMeters: 0,
        },
      ];
    }

    const unvisited = [...candidates];
    const ordered: RoutedStopTransition[] = [];

    // 1. Identify Anchor Stop
    // Priority: sunrise/early morning stop, then must-visit, then highest scored
    let anchorIdx = unvisited.findIndex(
      (c) =>
        c.recommendedTime?.start &&
        (c.recommendedTime.start.startsWith("04") ||
          c.recommendedTime.start.startsWith("05") ||
          c.recommendedTime.start.startsWith("06")),
    );

    if (anchorIdx === -1) {
      anchorIdx = unvisited.findIndex((c) => c.isMustVisit);
    }
    if (anchorIdx === -1) {
      anchorIdx = 0;
    }

    const [anchor] = unvisited.splice(anchorIdx, 1);
    if (!anchor) return [];

    ordered.push({
      candidate: anchor,
      travelFromPreviousMinutes: 0,
      travelDistanceMeters: 0,
    });

    // 2. Greedy Nearest Feasible Neighbor with Diversity Bonus
    while (unvisited.length > 0 && ordered.length < maxStops) {
      const prevStop = ordered[ordered.length - 1];
      if (!prevStop) break;

      let bestIdx = -1;
      let bestCost = Number.POSITIVE_INFINITY;

      for (let i = 0; i < unvisited.length; i++) {
        const next = unvisited[i];
        if (!next) continue;

        const distMeters = this.calculateDistanceMeters(prevStop.candidate.location, next.location);

        // Category diversity bonus: avoid consecutive identical categories
        const isSameCategory =
          prevStop.candidate.categories[0] &&
          next.categories[0] &&
          prevStop.candidate.categories[0].toLowerCase() === next.categories[0].toLowerCase();
        const diversityPenalty = isSameCategory ? 3000 : 0;

        // Must-visit priority discount
        const mustVisitDiscount = next.isMustVisit ? -8000 : next.isAlternative ? -4000 : 0;

        const effectiveCost = distMeters + diversityPenalty + mustVisitDiscount;

        if (effectiveCost < bestCost) {
          bestCost = effectiveCost;
          bestIdx = i;
        }
      }

      if (bestIdx >= 0) {
        const [chosen] = unvisited.splice(bestIdx, 1);
        if (!chosen) break;

        // Compute real directions via SerpApiService (with fallback to Haversine)
        let travelMinutes = 15;
        let distanceMeters = this.calculateDistanceMeters(
          prevStop.candidate.location,
          chosen.location,
        );

        if (prevStop.candidate.location && chosen.location) {
          try {
            const directions = await this.serpApi.getDirections(
              prevStop.candidate.location,
              chosen.location,
              { requestId: options?.requestId },
            );
            travelMinutes = directions.durationMinutes;
            distanceMeters = directions.distanceMeters;
          } catch {
            // fallback calculation: ~30km/h
            travelMinutes = Math.max(5, Math.round((distanceMeters / 1000 / 30) * 60));
          }
        }

        ordered.push({
          candidate: chosen,
          travelFromPreviousMinutes: travelMinutes,
          travelDistanceMeters: distanceMeters,
        });
      } else {
        break;
      }
    }

    return ordered;
  }
}

export const itineraryRouter = new ItineraryRouter();
