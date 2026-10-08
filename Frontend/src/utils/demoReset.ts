import { useTasteStore } from "../stores/tasteStore";
import { useDiscoveryResultsStore } from "../stores/discoveryResultsStore";
import { useAlternativesStore } from "../stores/alternativesStore";
import { useItineraryStore } from "../stores/itineraryStore";
import { useTakeHomeStore } from "../stores/takeHomeStore";
import { useMemoryStore } from "../stores/memoryStore";

/**
 * Deterministic Demo Reset Utility
 * Resets all traveler choices, clear ephemeral stores, purges user memory,
 * and restores OFFBEAT to a pristine, predictable golden demo starting state.
 */
export async function resetDemoSession(): Promise<void> {
  try {
    // 1. Reset frontend taste & preference selections
    useTasteStore.getState().clearAllPreferences();

    // 2. Clear discovery candidates & results
    useDiscoveryResultsStore.getState().reset();

    // 3. Clear alternative engine selections
    useAlternativesStore.getState().reset();

    // 4. Clear synthesized itinerary
    useItineraryStore.getState().reset();

    // 5. Clear take-home selections
    useTakeHomeStore.getState().reset();

    // 6. Purge backend traveler memory records for demo traveler
    try {
      await useMemoryStore.getState().clearAllMemories();
    } catch {
      // Graceful fallback if backend is offline
    }

    // 7. Purge local storage cache keys
    localStorage.removeItem("offbeat-taste-storage");
    localStorage.removeItem("offbeat-traveler-id");
    sessionStorage.clear();

    // 8. Redirect cleanly to starting landing experience
    window.location.href = "/";
  } catch (err) {
    console.warn("[Demo Reset] Error during demo reset:", err);
    window.location.href = "/";
  }
}
