import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TimeContext } from "../types/taste";
import { pruneIncompatibleExperiences } from "../features/taste/tasteUtils";

interface TasteState {
  activeCountryId: string;
  activeRegionId: string | null;
  selectedTravelTastes: string[];
  selectedExperienceTastes: string[];
  timeContext: TimeContext | null;

  // Actions
  setActiveRegion: (countryId: string, regionId: string) => void;
  toggleTravelTaste: (tasteSlug: string) => void;
  setTravelTastes: (tastes: string[]) => void;
  toggleExperienceTaste: (experienceSlug: string) => void;
  setExperienceTastes: (experiences: string[]) => void;
  setTimeContext: (time: TimeContext | null) => void;
  resetTastes: () => void;
  clearDependentExperiences: () => void;
  clearAllPreferences: () => void;
}

export const useTasteStore = create<TasteState>()(
  persist(
    (set, get) => ({
      activeCountryId: "in",
      activeRegionId: "IN-WB", // Default to West Bengal as benchmark
      selectedTravelTastes: [],
      selectedExperienceTastes: [],
      timeContext: null,

      setActiveRegion: (countryId: string, regionId: string) => {
        set({
          activeCountryId: countryId,
          activeRegionId: regionId,
        });
      },

      toggleTravelTaste: (tasteSlug: string) => {
        const { selectedTravelTastes, selectedExperienceTastes } = get();
        const exists = selectedTravelTastes.includes(tasteSlug);
        const nextTravelTastes = exists
          ? selectedTravelTastes.filter((t) => t !== tasteSlug)
          : [...selectedTravelTastes, tasteSlug];

        // Critical Phase 3 rule: prune experience tastes that are no longer compatible
        const nextExperienceTastes = pruneIncompatibleExperiences(
          nextTravelTastes,
          selectedExperienceTastes,
        );

        set({
          selectedTravelTastes: nextTravelTastes,
          selectedExperienceTastes: nextExperienceTastes,
        });
      },

      setTravelTastes: (tastes: string[]) => {
        const { selectedExperienceTastes } = get();
        const nextExperienceTastes = pruneIncompatibleExperiences(tastes, selectedExperienceTastes);
        set({
          selectedTravelTastes: tastes,
          selectedExperienceTastes: nextExperienceTastes,
        });
      },

      toggleExperienceTaste: (experienceSlug: string) => {
        const { selectedExperienceTastes } = get();
        const exists = selectedExperienceTastes.includes(experienceSlug);
        const next = exists
          ? selectedExperienceTastes.filter((e) => e !== experienceSlug)
          : [...selectedExperienceTastes, experienceSlug];
        set({ selectedExperienceTastes: next });
      },

      setExperienceTastes: (experiences: string[]) => {
        set({ selectedExperienceTastes: experiences });
      },

      setTimeContext: (time: TimeContext | null) => {
        set({ timeContext: time });
      },

      clearDependentExperiences: () => {
        const { selectedTravelTastes, selectedExperienceTastes } = get();
        const next = pruneIncompatibleExperiences(selectedTravelTastes, selectedExperienceTastes);
        set({ selectedExperienceTastes: next });
      },

      resetTastes: () => {
        set({
          selectedTravelTastes: [],
          selectedExperienceTastes: [],
          timeContext: null,
        });
      },

      clearAllPreferences: () => {
        set({
          activeCountryId: "in",
          activeRegionId: null,
          selectedTravelTastes: [],
          selectedExperienceTastes: [],
          timeContext: null,
        });
      },
    }),
    {
      name: "offbeat_traveler_taste",
      storage: createJSONStorage(() => localStorage),
      // Only persist genuine traveler preferences (not UI animation states)
      partialize: (state) => ({
        activeCountryId: state.activeCountryId,
        activeRegionId: state.activeRegionId,
        selectedTravelTastes: state.selectedTravelTastes,
        selectedExperienceTastes: state.selectedExperienceTastes,
        timeContext: state.timeContext,
      }),
    },
  ),
);
