import { fetchApi } from "./apiClient";
import type { TakeHomeResponseDto, TakeHomeQueryDto } from "@offbeat/shared";

export const takeHomeService = {
  /**
   * Retrieves Take Home recommendations for a destination.
   */
  async getTakeHomeByDestination(
    destinationId: string,
    query?: TakeHomeQueryDto,
  ): Promise<TakeHomeResponseDto> {
    const params = new URLSearchParams();
    if (query?.category) params.append("category", query.category);
    if (query?.travelTaste && query.travelTaste.length > 0) {
      params.append("travelTaste", query.travelTaste.join(","));
    }
    if (query?.experienceTaste && query.experienceTaste.length > 0) {
      params.append("experienceTaste", query.experienceTaste.join(","));
    }
    if (query?.giftFor) params.append("giftFor", query.giftFor);
    if (query?.budget) params.append("budget", query.budget);
    if (query?.verifiedOnly) params.append("verifiedOnly", "true");

    const qs = params.toString() ? `?${params.toString()}` : "";
    return await fetchApi<TakeHomeResponseDto>(
      `take-home/${encodeURIComponent(destinationId)}${qs}`,
    );
  },

  /**
   * Retrieves contextual Take Home recommendations for a place entry point.
   */
  async getTakeHomeByPlace(
    placeId: string,
    query?: TakeHomeQueryDto,
  ): Promise<TakeHomeResponseDto> {
    const params = new URLSearchParams();
    if (query?.category) params.append("category", query.category);
    if (query?.travelTaste && query.travelTaste.length > 0) {
      params.append("travelTaste", query.travelTaste.join(","));
    }
    if (query?.experienceTaste && query.experienceTaste.length > 0) {
      params.append("experienceTaste", query.experienceTaste.join(","));
    }
    if (query?.giftFor) params.append("giftFor", query.giftFor);
    if (query?.budget) params.append("budget", query.budget);
    if (query?.verifiedOnly) params.append("verifiedOnly", "true");

    const qs = params.toString() ? `?${params.toString()}` : "";
    return await fetchApi<TakeHomeResponseDto>(
      `places/${encodeURIComponent(placeId)}/take-home${qs}`,
    );
  },
};
