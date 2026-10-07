import { fetchApi } from "./apiClient";
import type { CreateItineraryRequestDto, ItineraryResponseDto } from "@offbeat/shared";

export const itineraryService = {
  /**
   * Generates an intelligent, geographically optimized itinerary.
   */
  async createItinerary(request: CreateItineraryRequestDto): Promise<ItineraryResponseDto> {
    return await fetchApi<ItineraryResponseDto>("itineraries", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Retrieves an itinerary by ID.
   */
  async getItinerary(itineraryId: string): Promise<ItineraryResponseDto> {
    return await fetchApi<ItineraryResponseDto>(`itineraries/${itineraryId}`);
  },
};
