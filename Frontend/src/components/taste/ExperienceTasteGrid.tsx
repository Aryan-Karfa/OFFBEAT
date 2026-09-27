import React from "react";
import type { ExperienceTaste } from "../../types/taste";
import { ExperienceTasteChip } from "./ExperienceTasteChip";

interface ExperienceTasteGridProps {
  experiences: ExperienceTaste[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  isReducedMotion?: boolean;
}

export const ExperienceTasteGrid: React.FC<ExperienceTasteGridProps> = ({
  experiences,
  selectedSlugs,
  onToggle,
  isReducedMotion = false,
}) => {
  if (experiences.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-offbeat-surface/60 border border-dashed border-offbeat-border text-center">
        <p className="text-sm text-offbeat-secondary">
          No experience nuances available for the selected travel tastes. Please choose at least one
          Travel Taste to unlock contextual experiences.
        </p>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Experience Taste nuances selection"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
    >
      {experiences.map((exp) => (
        <ExperienceTasteChip
          key={exp.id}
          experience={exp}
          isSelected={selectedSlugs.includes(exp.slug)}
          onToggle={onToggle}
          isReducedMotion={isReducedMotion}
        />
      ))}
    </div>
  );
};
