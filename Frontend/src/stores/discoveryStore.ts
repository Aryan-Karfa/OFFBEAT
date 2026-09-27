import { create } from "zustand";
import type { Country, Region } from "../types/geography";

interface DiscoveryState {
  selectedCountry: Country | null;
  selectedRegion: Region | null;
  hoveredRegion: Region | null;
  viewMode: "map" | "list";
  searchQuery: string;

  setSelectedCountry: (country: Country | null) => void;
  setSelectedRegion: (region: Region | null) => void;
  setHoveredRegion: (region: Region | null) => void;
  setViewMode: (mode: "map" | "list") => void;
  setSearchQuery: (query: string) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
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
  viewMode: "map",
  searchQuery: "",

  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setHoveredRegion: (region) => set({ hoveredRegion: region }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
