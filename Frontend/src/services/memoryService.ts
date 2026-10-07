import { fetchApi } from "./apiClient";
import type {
  TravelerMemoryDto,
  CreateMemoryEventDto,
  MemoryEventDto,
  TravelerPersonalizationProfileDto,
  MemorySettingDto,
  UpdateMemoryItemDto,
} from "@offbeat/shared";

export const memoryService = {
  /**
   * Retrieves all memories for the traveler with confidence and explanations.
   */
  async getMemories(): Promise<TravelerMemoryDto[]> {
    return fetchApi<TravelerMemoryDto[]>("/me/memory");
  },

  /**
   * Retrieves the current normalized personalization profile.
   */
  async getPersonalization(): Promise<TravelerPersonalizationProfileDto> {
    return fetchApi<TravelerPersonalizationProfileDto>("/me/personalization");
  },

  /**
   * Emits a lightweight interaction event to update memory.
   */
  async recordEvent(
    event: CreateMemoryEventDto,
  ): Promise<{ memory: TravelerMemoryDto | null; event: MemoryEventDto }> {
    return fetchApi<{ memory: TravelerMemoryDto | null; event: MemoryEventDto }>(
      "/me/memory/events",
      {
        method: "POST",
        body: JSON.stringify(event),
      },
    );
  },

  /**
   * Updates a specific memory item.
   */
  async updateMemoryItem(
    memoryId: string,
    updates: UpdateMemoryItemDto,
  ): Promise<TravelerMemoryDto> {
    return fetchApi<TravelerMemoryDto>(`/me/memory/${memoryId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Deletes an individual memory item.
   */
  async deleteMemoryItem(memoryId: string): Promise<boolean> {
    const res = await fetchApi<{ deleted: boolean; memoryId: string }>(`/me/memory/${memoryId}`, {
      method: "DELETE",
    });
    return res.deleted;
  },

  /**
   * Clears all traveler memories with confirmation.
   */
  async clearAllMemories(): Promise<boolean> {
    const res = await fetchApi<{ cleared: boolean; count: number }>("/me/memory", {
      method: "DELETE",
    });
    return res.cleared;
  },

  /**
   * Fetches memory preferences and settings.
   */
  async getSettings(): Promise<MemorySettingDto> {
    return fetchApi<MemorySettingDto>("/me/memory/settings");
  },

  /**
   * Toggles memory persistence on or off.
   */
  async updateSettings(memoryEnabled: boolean): Promise<MemorySettingDto> {
    return fetchApi<MemorySettingDto>("/me/memory/settings", {
      method: "PATCH",
      body: JSON.stringify({ memoryEnabled }),
    });
  },
};
