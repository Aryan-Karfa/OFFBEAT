import React from "react";
import type { ExperienceTaste } from "../../types/taste";
import { cn } from "../../utils/cn";
import { Check } from "lucide-react";

interface ExperienceTasteChipProps {
  experience: ExperienceTaste;
  isSelected: boolean;
  onToggle: (slug: string) => void;
  isReducedMotion?: boolean;
}

export const ExperienceTasteChip: React.FC<ExperienceTasteChipProps> = ({
  experience,
  isSelected,
  onToggle,
  isReducedMotion = false,
}) => {
  return (
    <div
      role="checkbox"
      tabIndex={0}
      aria-checked={isSelected}
      aria-label={`${experience.name}: ${experience.description || ""}`}
      onClick={() => onToggle(experience.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(experience.slug);
        }
      }}
      className={cn(
        "group relative flex items-start gap-3 p-3.5 rounded-xl border select-none cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
        isReducedMotion ? "" : "active:scale-[0.98]",
        isSelected
          ? "bg-offbeat-elevated border-offbeat-accent shadow-card"
          : "bg-offbeat-surface border-offbeat-border hover:bg-offbeat-elevated hover:border-offbeat-secondary/40",
      )}
    >
      <span className="text-2xl shrink-0 mt-0.5" role="img" aria-hidden="true">
        {experience.icon || "✨"}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-sans text-sm font-bold truncate transition-colors",
              isSelected ? "text-offbeat-accent" : "text-offbeat-primary",
            )}
          >
            {experience.name}
          </span>
          <div
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0",
              isSelected
                ? "bg-offbeat-accent border-offbeat-accent text-offbeat-dark"
                : "border-offbeat-border bg-offbeat-dark/60 text-transparent",
            )}
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
        </div>

        {experience.description && (
          <p className="text-xs text-offbeat-muted mt-1 leading-snug line-clamp-2">
            {experience.description}
          </p>
        )}
      </div>
    </div>
  );
};
