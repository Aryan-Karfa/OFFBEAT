import { create } from "zustand";
import type {
  AlternativeMode,
  PlaceReference,
  AlternativeCandidate,
  AlternativeReasoning,
  FindAlternativesQueryDto,
} from "@offbeat/shared";
import { alternativesService } from "../services/alternativesService";

interface AlternativesState {
  originalPlace: PlaceReference | null;
  selectedMode: AlternativeMode;
  context: FindAlternativesQueryDto;
  loading: boolean;
  results: AlternativeCandidate[];
  reasoning: AlternativeReasoning | null;
  selectedAlternative: AlternativeCandidate | null;
  error: string | null;
  fallback: boolean;
  targetPlaceId: string | null;

  // Actions
  setMode: (mode: AlternativeMode) => void;
  setContext: (context: Partial<FindAlternativesQueryDto>) => void;
  selectAlternative: (candidate: AlternativeCandidate | null) => void;
  fetchAlternatives: (placeId: string, customQuery?: Partial<FindAlternativesQueryDto>) => Promise<void>;
  reset: () => void;
}

export const useAlternativesStore = create<AlternativesState>((set, get) => ({
  originalPlace: null,
  selectedMode: "REPLACEMENT",
  context: {},
  loading: false,
  results: [],
  reasoning: null,
  selectedAlternative: null,
  error: null,
  fallback: false,
  targetPlaceId: null,

  setMode: (mode: AlternativeMode) => {
    const prevMode = get().selectedMode;
    if (prevMode === mode) return;

    set({ selectedMode: mode });
    const { targetPlaceId, context } = get();
    if (targetPlaceId) {
      get().fetchAlternatives(targetPlaceId, { ...context, mode });
    }
  },

  setContext: (newContext: Partial<FindAlternativesQueryDto>) => {
    set((state) => ({
      context: { ...state.context, ...newContext },
    }));
  },

  selectAlternative: (candidate: AlternativeCandidate | null) => {
    set({ selectedAlternative: candidate });
  },

  fetchAlternatives: async (placeId: string, customQuery?: Partial<FindAlternativesQueryDto>) => {
    const currentMode = customQuery?.mode || get().selectedMode;
    const mergedQuery: FindAlternativesQueryDto = {
      ...get().context,
      ...customQuery,
      mode: currentMode,
    };

    set({
      loading: true,
      error: null,
      targetPlaceId: placeId,
      selectedMode: currentMode,
    });

    try {
      const response = await alternativesService.getAlternatives(placeId, mergedQuery);
      set({
        originalPlace: response.originalPlace,
        selectedMode: response.mode,
        results: response.alternatives,
        reasoning: response.reasoning || null,
        fallback: Boolean(response.fallback),
        selectedAlternative: response.alternatives.length > 0 ? response.alternatives[0] : null,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load alternatives.",
      });
    }
  },

  reset: () => {
    set({
      originalPlace: null,
      selectedMode: "REPLACEMENT",
      context: {},
      loading: false,
      results: [],
      reasoning: null,
      selectedAlternative: null,
      error: null,
      fallback: false,
      targetPlaceId: null,
    });
  },
}));
