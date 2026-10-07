import React from "react";
import type { AlternativeMode } from "@offbeat/shared";
import { cn } from "../../utils/cn";
import {
  Shuffle,
  PlusCircle,
  Compass,
  Users,
  Clock,
  Layers,
} from "lucide-react";

export interface ModeOption {
  mode: AlternativeMode;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ALTERNATIVE_MODES: ModeOption[] = [
  {
    mode: "REPLACEMENT",
    label: "Something Similar",
    tagline: "True substitute matching similar mountain/cultural vibes",
    icon: Shuffle,
  },
  {
    mode: "ENHANCEMENT",
    label: "Make It Better",
    tagline: "Add a nearby stop that elevates the original experience",
    icon: PlusCircle,
  },
  {
    mode: "NEARBY_DISCOVERY",
    label: "Nearby Hidden Gem",
    tagline: "Lesser-known local treasures in close geographic proximity",
    icon: Compass,
  },
  {
    mode: "LOWER_CROWD",
    label: "Less Crowded",
    tagline: "Quieter, low-density alternative without tourist surges",
    icon: Users,
  },
  {
    mode: "TIMING_ALTERNATIVE",
    label: "Better Time",
    tagline: "Optimal daylight, sunrise, or golden hour window",
    icon: Clock,
  },
  {
    mode: "COMPLEMENTARY",
    label: "Something Complementary",
    tagline: "Distinct cultural or heritage counterpart for journey balance",
    icon: Layers,
  },
];

interface AlternativeModeSelectorProps {
  selectedMode: AlternativeMode;
  onSelectMode: (mode: AlternativeMode) => void;
  disabled?: boolean;
}

export const AlternativeModeSelector: React.FC<AlternativeModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  disabled = false,
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-offbeat-accent block">
            Alternative Strategy
          </span>
          <h2 className="text-lg font-bold text-offbeat-primary">
            What kind of alternative are you looking for?
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ALTERNATIVE_MODES.map((option) => {
          const isSelected = selectedMode === option.mode;
          const Icon = option.icon;

          return (
            <button
              key={option.mode}
              type="button"
              id={`mode-btn-${option.mode.toLowerCase()}`}
              disabled={disabled}
              onClick={() => onSelectMode(option.mode)}
              className={cn(
                "flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 relative group",
                isSelected
                  ? "bg-offbeat-accent/15 border-offbeat-accent shadow-[0_0_15px_rgba(202,138,4,0.15)] ring-1 ring-offbeat-accent/40"
                  : "bg-offbeat-surface/80 border-offbeat-border hover:border-offbeat-border/80 hover:bg-offbeat-surface text-offbeat-muted hover:text-offbeat-primary",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isSelected
                      ? "bg-offbeat-accent text-offbeat-dark"
                      : "bg-offbeat-dark text-offbeat-muted group-hover:text-offbeat-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-offbeat-accent animate-pulse" />
                )}
              </div>

              <span
                className={cn(
                  "text-xs font-bold leading-tight mb-1",
                  isSelected ? "text-offbeat-primary" : "text-offbeat-secondary group-hover:text-offbeat-primary",
                )}
              >
                {option.label}
              </span>

              <span className="text-[11px] text-offbeat-muted leading-snug line-clamp-2">
                {option.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
