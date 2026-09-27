import React from "react";
import type { TimeContext } from "../../types/taste";
import { cn } from "../../utils/cn";
import { Sun, Moon } from "lucide-react";

interface TimeContextSelectorProps {
  value: TimeContext | null;
  onChange: (time: TimeContext) => void;
  isReducedMotion?: boolean;
}

export const TimeContextSelector: React.FC<TimeContextSelectorProps> = ({
  value,
  onChange,
  isReducedMotion = false,
}) => {
  const options: {
    id: TimeContext;
    label: string;
    sublabel: string;
    icon: typeof Sun;
    iconColor: string;
  }[] = [
    {
      id: "day",
      label: "DAY",
      sublabel: "Morning ridge light, daytime markets, scenic trails & sunshine",
      icon: Sun,
      iconColor: "text-amber-400",
    },
    {
      id: "night",
      label: "NIGHT",
      sublabel: "Nocturnal bazaars, sunset dusks, stargazing & evening fires",
      icon: Moon,
      iconColor: "text-indigo-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-1">
          Temporal Rhythm
        </span>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-offbeat-primary uppercase tracking-wide">
          When Are You Exploring?
        </h3>
        <p className="text-xs text-offbeat-secondary mt-1">
          Contextual timing preference for dawn vistas or atmospheric nocturnal discoveries.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Select when you are exploring"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {options.map((option) => {
          const isSelected = value === option.id;
          const Icon = option.icon;

          return (
            <div
              key={option.id}
              role="radio"
              tabIndex={0}
              aria-checked={isSelected}
              onClick={() => onChange(option.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.id);
                }
              }}
              className={cn(
                "flex items-center gap-4 p-5 rounded-xl border select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
                isReducedMotion ? "" : "transition-all duration-200 active:scale-[0.99]",
                isSelected
                  ? "bg-offbeat-elevated border-offbeat-accent shadow-glow"
                  : "bg-offbeat-surface border-offbeat-border hover:bg-offbeat-elevated hover:border-offbeat-secondary/40",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border shrink-0 transition-colors",
                  isSelected
                    ? "bg-offbeat-dark border-offbeat-accent shadow-md"
                    : "bg-offbeat-dark/60 border-offbeat-border",
                )}
              >
                <Icon className={cn("h-6 w-6", option.iconColor)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={cn(
                      "font-display text-base font-bold tracking-wider uppercase transition-colors",
                      isSelected ? "text-offbeat-accent" : "text-offbeat-primary",
                    )}
                  >
                    {option.label}
                  </span>
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full border transition-all",
                      isSelected
                        ? "bg-offbeat-accent border-offbeat-accent"
                        : "border-offbeat-border bg-transparent",
                    )}
                  />
                </div>
                <p className="text-xs text-offbeat-muted leading-relaxed">{option.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
