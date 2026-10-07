import { create } from "zustand";
import type {
  TravelerMemoryDto,
  TravelerPersonalizationProfileDto,
  CreateMemoryEventDto,
} from "@offbeat/shared";
import { memoryService } from "../services/memoryService";

interface MemoryState {
  memories: TravelerMemoryDto[];
  personalization: TravelerPersonalizationProfileDto | null;
  memoryEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  fetchMemories: () => Promise<void>;
  fetchPersonalization: () => Promise<void>;
  recordEvent: (event: CreateMemoryEventDto) => Promise<void>;
  removeMemory: (memoryId: string) => Promise<void>;
  clearAllMemories: () => Promise<void>;
  toggleMemoryEnabled: (enabled: boolean) => Promise<void>;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  personalization: null,
  memoryEnabled: true,
  loading: false,
  error: null,

  fetchMemories: async () => {
    set({ loading: true, error: null });
    try {
      const [memories, settings] = await Promise.all([
        memoryService.getMemories(),
        memoryService.getSettings(),
      ]);
      set({
        memories,
        memoryEnabled: settings.memoryEnabled,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load traveler memories",
        loading: false,
      });
    }
  },

  fetchPersonalization: async () => {
    try {
      const personalization = await memoryService.getPersonalization();
      set({ personalization, memoryEnabled: personalization.memoryEnabled });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load personalization profile",
      });
    }
  },

  recordEvent: async (event: CreateMemoryEventDto) => {
    if (!get().memoryEnabled) return;
    try {
      await memoryService.recordEvent(event);
      // Invalidate and refresh in background
      await get().fetchMemories();
      await get().fetchPersonalization();
    } catch {
      // Non-blocking interaction recording
    }
  },

  removeMemory: async (memoryId: string) => {
    try {
      const success = await memoryService.deleteMemoryItem(memoryId);
      if (success) {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== memoryId),
        }));
        await get().fetchPersonalization();
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to remove memory item",
      });
    }
  },

  clearAllMemories: async () => {
    set({ loading: true });
    try {
      await memoryService.clearAllMemories();
      set({
        memories: [],
        personalization: null,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to clear memories",
        loading: false,
      });
    }
  },

  toggleMemoryEnabled: async (enabled: boolean) => {
    set({ loading: true });
    try {
      const updated = await memoryService.updateSettings(enabled);
      set({ memoryEnabled: updated.memoryEnabled, loading: false });
      if (!enabled) {
        set({ memories: [], personalization: null });
      } else {
        await get().fetchMemories();
        await get().fetchPersonalization();
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to toggle memory setting",
        loading: false,
      });
    }
  },
}));
