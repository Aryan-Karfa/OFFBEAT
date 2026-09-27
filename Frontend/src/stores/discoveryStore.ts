import { create } from "zustand";
import type { Country, Region, MapInteractionState } from "../types/geography";

interface DiscoveryState {
  selectedCountry: Country | null;
  selectedRegion: Region | null;
  hoveredRegion: Region | null;
  interactionState: MapInteractionState;
  viewMode: "map" | "list";
  searchQuery: string;

  setSelectedCountry: (country: Country | null) => void;
  setSelectedRegion: (region: Region | null) => void;
  setHoveredRegion: (region: Region | null) => void;
  setInteractionState: (state: MapInteractionState) => void;
  setViewMode: (mode: "map" | "list") => void;
  setSearchQuery: (query: string) => void;
  selectRegionSequence: (region: Region, isReducedMotion?: boolean) => void;
  returnToCountryContext: (isReducedMotion?: boolean) => void;
  cancelActiveSequences: () => void;
}

let sequenceTimeouts: ReturnType<typeof setTimeout>[] = [];

const clearTimeouts = () => {
  sequenceTimeouts.forEach((t) => clearTimeout(t));
  sequenceTimeouts = [];
};

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  selectedCountry: {
    id: "in",
    name: "India",
    code: "IND",
    tagline: "Subcontinent of Contrasts & Living Heritage",
    description:
      "From the high passes of Ladakh to the tropical backwaters of Kerala, discover 28 States and 8 Union Territories through local eyes.",
    regionsCount: 36,
    communityDiscoveriesCount: 1420,
    isAvailable: true,
  },
  selectedRegion: null,
  hoveredRegion: null,
  interactionState: "idle",
  viewMode: "map",
  searchQuery: "",

  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setHoveredRegion: (region) => {
    const currentState = get().interactionState;
    if (currentState === "idle" || currentState === "hover") {
      set({
        hoveredRegion: region,
        interactionState: region ? "hover" : "idle",
      });
    } else {
      set({ hoveredRegion: region });
    }
  },
  setInteractionState: (state) => set({ interactionState: state }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  cancelActiveSequences: () => {
    clearTimeouts();
  },

  selectRegionSequence: (region: Region, isReducedMotion = false) => {
    clearTimeouts();

    if (isReducedMotion) {
      set({
        selectedRegion: region,
        hoveredRegion: null,
        interactionState: "exploring",
      });
      return;
    }

    // Explicit state machine sequence:
    // 1. PRESSED (Immediate tactile response, 80ms)
    set({
      selectedRegion: region,
      hoveredRegion: null,
      interactionState: "pressed",
    });

    // 2. RISING (Region separates from map plane with 3D elevation, 300ms)
    const t1 = setTimeout(() => {
      set({ interactionState: "rising" });
    }, 80);

    // 3. FOCUSED (Camera begins smooth centering & zoom, 350ms)
    const t2 = setTimeout(() => {
      set({ interactionState: "focused" });
    }, 380);

    // 4. ACTIVE (Region reaches peak elevated state, 200ms)
    const t3 = setTimeout(() => {
      set({ interactionState: "active" });
    }, 730);

    // 5. EXPLORING (Contextual information & destination gateway reveals, 150ms)
    const t4 = setTimeout(() => {
      set({ interactionState: "exploring" });
    }, 930);

    sequenceTimeouts.push(t1, t2, t3, t4);
  },

  returnToCountryContext: (isReducedMotion = false) => {
    clearTimeouts();

    if (isReducedMotion) {
      set({
        selectedRegion: null,
        hoveredRegion: null,
        interactionState: "idle",
      });
      return;
    }

    // Reverse Sequence:
    // ACTIVE / EXPLORING -> BACK -> FOCUS RELEASE -> REGION DESCENDS -> MAP RESTORES -> IDLE
    set({ interactionState: "back" });

    const t = setTimeout(() => {
      set({
        selectedRegion: null,
        hoveredRegion: null,
        interactionState: "idle",
      });
    }, 450);

    sequenceTimeouts.push(t);
  },
}));
