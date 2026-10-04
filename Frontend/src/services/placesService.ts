import { fetchApi } from "./apiClient";
import type { PlaceDetailDto } from "@offbeat/shared";

export const placesService = {
  /**
   * Retrieves place detail including canonical attributes, community signals, time, and crowd intelligence.
   */
  async getPlaceById(identifier: string): Promise<PlaceDetailDto> {
    return await fetchApi<PlaceDetailDto>(`places/${identifier}`);
  },

  /**
   * Retrieves focused Time Intelligence for a place.
   */
  async getPlaceTimes(placeId: string): Promise<import("@offbeat/shared").TimeIntelligenceDto> {
    return await fetchApi<import("@offbeat/shared").TimeIntelligenceDto>(`places/${placeId}/times`);
  },

  /**
   * Retrieves focused Crowd Intelligence for a place.
   */
  async getPlaceCrowd(placeId: string): Promise<import("@offbeat/shared").CrowdIntelligenceDto> {
    return await fetchApi<import("@offbeat/shared").CrowdIntelligenceDto>(
      `places/${placeId}/crowd`,
    );
  },
};
