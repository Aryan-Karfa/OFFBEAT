import { fetchApi } from "./apiClient";
import type { DiscoveryRequestDto, DiscoveryResponseDataDto } from "@offbeat/shared";

/**
 * Service to interact with the backend Discovery Engine.
 */
export const discoveryService = {
  /**
   * Executes contextual discovery with user taste and geographic parameters.
   */
  async discover(request: DiscoveryRequestDto): Promise<DiscoveryResponseDataDto> {
    return await fetchApi<DiscoveryResponseDataDto>("discover", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};
