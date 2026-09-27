import React from "react";
import type { TravelTaste } from "../../types/taste";
import { cn } from "../../utils/cn";
import { Check } from "lucide-react";

interface TravelTasteCardProps {
  taste: TravelTaste;
  isSelected: boolean;
  onToggle: (slug: string) => void;
  isReducedMotion?: boolean;
}

export const TravelTasteCard: React.FC<TravelTasteCardProps> = ({
  taste,
  isSelected,
  onToggle,
  isReducedMotion = false,
}) => {
  return (
    <div
      role="checkbox"
      tabIndex={0}
      aria-checked={isSelected}
      aria-label={`${taste.name}: ${taste.description}`}
      onClick={() => onToggle(taste.slug)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(taste.slug);
        }
      }}
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-xl border select-none cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
        isReducedMotion ? "" : "transition-all duration-200 active:scale-[0.98]",
        isSelected
          ? "bg-offbeat-elevated border-offbeat-accent shadow-glow"
          : "bg-offbeat-surface border-offbeat-border hover:bg-offbeat-elevated hover:border-offbeat-secondary/40 shadow-card",
      )}
    >
      {/* Top row: Icon & Selection indicator */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-3xl leading-none" role="img" aria-hidden="true">
          {taste.icon}
        </span>
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150 shrink-0",
            isSelected
              ? "bg-offbeat-accent border-offbeat-accent text-offbeat-dark"
              : "border-offbeat-border bg-offbeat-dark/60 text-transparent",
          )}
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </div>
      </div>

      {/* Middle: Title & Description */}
      <div>
        <h3
          className={cn(
            "font-sans text-base font-bold mb-1.5 transition-colors",
            isSelected ? "text-offbeat-accent" : "text-offbeat-primary",
          )}
        >
          {taste.name}
        </h3>
        <p className="text-xs text-offbeat-secondary leading-relaxed mb-3">{taste.description}</p>
      </div>

      {/* Bottom: Examples tag */}
      {taste.example && (
        <div className="pt-2.5 border-t border-offbeat-border/50 text-[11px] text-offbeat-muted italic truncate">
          {taste.example}
        </div>
      )}
    </div>
  );
};
