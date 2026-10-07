import { create } from "zustand";
import type {
  CreateItineraryRequestDto,
  ItineraryResponseDto,
  ItineraryStopDto,
  ItineraryPace,
} from "@offbeat/shared";
import { itineraryService } from "../services/itineraryService";

export interface ItineraryState {
  request: CreateItineraryRequestDto;
  itinerary: ItineraryResponseDto | null;
  loading: boolean;
  error: string | null;
  fallback: boolean;
  selectedDay: number;
  selectedStopId: string | null;
  swappingStop: ItineraryStopDto | null;

  // Actions
  setRequest: (updates: Partial<CreateItineraryRequestDto>) => void;
  setPace: (pace: ItineraryPace) => void;
  setDurationDays: (days: number) => void;
  generateItinerary: (customReq?: Partial<CreateItineraryRequestDto>) => Promise<void>;
  loadItinerary: (id: string) => Promise<void>;
  selectDay: (day: number) => void;
  selectStop: (stopId: string | null) => void;
  setSwappingStop: (stop: ItineraryStopDto | null) => void;
  swapStopWithAlternative: (
    originalPlaceId: string,
    replacement: {
      id: string;
      name: string;
      destination?: string;
      category?: string;
      imageUrl?: string | null;
      why?: string;
    },
  ) => Promise<void>;
  reset: () => void;
}

const defaultRequest: CreateItineraryRequestDto = {
  country: "India",
  regionId: "region_west_bengal",
  destinationId: "dest_darjeeling",
  travelTaste: ["mountains", "photography"],
  experienceTaste: ["sunrise", "nature"],
  dayNight: "DAY",
  preferredStartTime: "06:00",
  preferredEndTime: "20:00",
  durationDays: 1,
  pace: "BALANCED",
  intent: "EXPLORE",
  mustVisitPlaceIds: ["place_tiger_hill"],
  selectedAlternativePlaceIds: [],
  avoidPlaceIds: [],
};

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  request: defaultRequest,
  itinerary: null,
  loading: false,
  error: null,
  fallback: false,
  selectedDay: 1,
  selectedStopId: null,
  swappingStop: null,

  setRequest: (updates) => {
    set((state) => ({
      request: {
        ...state.request,
        ...updates,
      },
    }));
  },

  setPace: (pace) => {
    set((state) => ({
      request: {
        ...state.request,
        pace,
      },
    }));
  },

  setDurationDays: (durationDays) => {
    set((state) => ({
      request: {
        ...state.request,
        durationDays,
      },
    }));
  },

  generateItinerary: async (customReq) => {
    const finalRequest: CreateItineraryRequestDto = {
      ...get().request,
      ...customReq,
    };

    set({ loading: true, error: null });

    try {
      const response = await itineraryService.createItinerary(finalRequest);
      set({
        itinerary: response,
        fallback: response.fallback,
        loading: false,
        selectedDay: 1,
        selectedStopId: response.days[0]?.stops[0]?.id || null,
        request: finalRequest,
      });
    } catch (err: unknown) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to generate itinerary",
      });
    }
  },

  loadItinerary: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await itineraryService.getItinerary(id);
      set({
        itinerary: response,
        fallback: response.fallback,
        loading: false,
        selectedDay: 1,
        selectedStopId: response.days[0]?.stops[0]?.id || null,
      });
    } catch (err: unknown) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load itinerary",
      });
    }
  },

  selectDay: (day) => {
    set({ selectedDay: day });
  },

  selectStop: (stopId) => {
    set({ selectedStopId: stopId });
  },

  setSwappingStop: (stop) => {
    set({ swappingStop: stop });
  },

  swapStopWithAlternative: async (originalPlaceId, replacement) => {
    const current = get().itinerary;
    if (!current) return;

    // 1. Optimistically swap in the UI
    const updatedDays = current.days.map((day) => ({
      ...day,
      stops: day.stops.map((stop) => {
        if (stop.placeId === originalPlaceId) {
          return {
            ...stop,
            placeId: replacement.id,
            name: replacement.name,
            destination: replacement.destination || stop.destination,
            category: replacement.category || stop.category,
            imageUrl: replacement.imageUrl || stop.imageUrl,
            why: replacement.why || `Swapped replacement experience: ${replacement.name}`,
          };
        }
        return stop;
      }),
    }));

    set({
      itinerary: {
        ...current,
        days: updatedDays,
      },
      swappingStop: null,
    });

    // 2. Also register in the request state so future regenerations preserve this swap
    const currentAvoid = new Set(get().request.avoidPlaceIds || []);
    currentAvoid.add(originalPlaceId);

    const currentAlts = new Set(get().request.selectedAlternativePlaceIds || []);
    currentAlts.add(replacement.id);

    set((state) => ({
      request: {
        ...state.request,
        avoidPlaceIds: Array.from(currentAvoid),
        selectedAlternativePlaceIds: Array.from(currentAlts),
      },
    }));
  },

  reset: () => {
    set({
      itinerary: null,
      loading: false,
      error: null,
      fallback: false,
      selectedDay: 1,
      selectedStopId: null,
      swappingStop: null,
    });
  },
}));
