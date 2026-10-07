import { fetchApi } from "./apiClient";
import type { AlternativeRecommendationResponse, FindAlternativesQueryDto } from "@offbeat/shared";

export const alternativesService = {
  /**
   * Retrieves intelligent alternatives for a given place based on mode and traveler preferences.
   */
  async getAlternatives(
    placeId: string,
    query?: FindAlternativesQueryDto,
  ): Promise<AlternativeRecommendationResponse> {
    const params = new URLSearchParams();
    if (query?.mode) params.append("mode", query.mode);
    if (query?.country) params.append("country", query.country);
    if (query?.region) params.append("region", query.region);
    if (query?.destination) params.append("destination", query.destination);

    if (query?.travelTaste) {
      const tastes = Array.isArray(query.travelTaste)
        ? query.travelTaste.join(",")
        : query.travelTaste;
      if (tastes) params.append("travelTaste", tastes);
    }

    if (query?.experienceTaste) {
      const experiences = Array.isArray(query.experienceTaste)
        ? query.experienceTaste.join(",")
        : query.experienceTaste;
      if (experiences) params.append("experienceTaste", experiences);
    }

    if (query?.dayNight) params.append("dayNight", query.dayNight);
    if (query?.preferredTime) params.append("preferredTime", query.preferredTime);
    if (query?.intent) params.append("intent", query.intent);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await fetchApi<AlternativeRecommendationResponse>(
      `places/${placeId}/alternatives${queryString}`,
    );
  },
};
