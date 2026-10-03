import { fetchApi } from "./apiClient";
import type { PlaceDetailDto } from "@offbeat/shared";

export const placesService = {
  /**
   * Retrieves place detail including canonical attributes and community signals.
   */
  async getPlaceById(identifier: string): Promise<PlaceDetailDto> {
    return await fetchApi<PlaceDetailDto>(`places/${identifier}`);
  },
};
