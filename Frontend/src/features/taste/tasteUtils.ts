import type {
  TravelTaste,
  ExperienceTaste,
  DiscoveryContext,
  TimeContext,
} from "../../types/taste";
import { TRAVEL_TASTES } from "./travelTasteData";
import { EXPERIENCE_TASTES } from "./experienceTasteData";

/**
 * Returns all Experience Tastes compatible with ANY of the currently selected Travel Tastes.
 * Results are deduplicated.
 */
export function getAvailableExperienceTastes(
  selectedTravelTasteSlugs: string[],
): ExperienceTaste[] {
  if (!selectedTravelTasteSlugs || selectedTravelTasteSlugs.length === 0) {
    return [];
  }

  const travelSet = new Set(selectedTravelTasteSlugs);
  const seenSlugs = new Set<string>();
  const available: ExperienceTaste[] = [];

  for (const exp of EXPERIENCE_TASTES) {
    const isCompatible = exp.compatibleTravelTastes.some((t) => travelSet.has(t));
    if (isCompatible && !seenSlugs.has(exp.slug)) {
      seenSlugs.add(exp.slug);
      available.push(exp);
    }
  }

  return available;
}

/**
 * Validates and prunes selected experience tastes against active travel tastes.
 * If a travel taste was deselected, any experience taste that no longer has
 * ANY compatible travel taste among the remaining selections is removed.
 */
export function pruneIncompatibleExperiences(
  selectedTravelTasteSlugs: string[],
  currentExperienceTasteSlugs: string[],
): string[] {
  if (!selectedTravelTasteSlugs || selectedTravelTasteSlugs.length === 0) {
    return [];
  }

  const travelSet = new Set(selectedTravelTasteSlugs);

  return currentExperienceTasteSlugs.filter((expSlug) => {
    const exp = EXPERIENCE_TASTES.find((item) => item.slug === expSlug);
    if (!exp) return false;
    return exp.compatibleTravelTastes.some((t) => travelSet.has(t));
  });
}

export function getTravelTasteBySlug(slug: string): TravelTaste | undefined {
  return TRAVEL_TASTES.find((t) => t.slug === slug);
}

export function getExperienceTasteBySlug(slug: string): ExperienceTaste | undefined {
  return EXPERIENCE_TASTES.find((e) => e.slug === slug);
}

/**
 * Builds a normalized DiscoveryContext object representing traveler intent.
 */
export function buildDiscoveryContext(
  countryName: string,
  regionName: string,
  travelTasteSlugs: string[],
  experienceTasteSlugs: string[],
  timeContext: TimeContext | null,
): DiscoveryContext {
  return {
    country: countryName,
    region: regionName,
    travelTaste: [...travelTasteSlugs],
    experienceTaste: [...experienceTasteSlugs],
    timeContext,
  };
}
