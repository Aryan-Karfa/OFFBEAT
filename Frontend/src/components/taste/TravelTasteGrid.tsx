import React from "react";
import type { TravelTaste } from "../../types/taste";
import { TravelTasteCard } from "./TravelTasteCard";

interface TravelTasteGridProps {
  tastes: TravelTaste[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  isReducedMotion?: boolean;
}

export const TravelTasteGrid: React.FC<TravelTasteGridProps> = ({
  tastes,
  selectedSlugs,
  onToggle,
  isReducedMotion = false,
}) => {
  return (
    <div
      role="group"
      aria-label="Travel Taste category selection"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {tastes.map((taste) => (
        <TravelTasteCard
          key={taste.id}
          taste={taste}
          isSelected={selectedSlugs.includes(taste.slug)}
          onToggle={onToggle}
          isReducedMotion={isReducedMotion}
        />
      ))}
    </div>
  );
};
