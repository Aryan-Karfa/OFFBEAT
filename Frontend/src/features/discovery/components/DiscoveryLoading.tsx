import React, { useEffect, useState } from "react";
import { Compass, Sparkles, MapPin, Search } from "lucide-react";

interface DiscoveryLoadingProps {
  regionName?: string;
  travelTastes?: string[];
  experienceTastes?: string[];
}

const STEPS = [
  {
    title: "Understanding your traveler intent",
    detail: "Decoding selected travel and experience nuances...",
    icon: Sparkles,
  },
  {
    title: "Scanning regional geography",
    detail: "Retrieving canonical destinations and coordinates...",
    icon: MapPin,
  },
  {
    title: "Retrieving live place intelligence",
    detail: "Gathering external and internal candidate viewpoints...",
    icon: Search,
  },
  {
    title: "Evaluating deterministic matching",
    detail: "Scoring places against your taste & day/night preferences...",
    icon: Compass,
  },
];

export const DiscoveryLoading: React.FC<DiscoveryLoadingProps> = ({ regionName = "Region" }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const current = STEPS[activeStep] || STEPS[0]!;
  const IconComponent = current.icon;

  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
      {/* Central Pulsing Radar Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-offbeat-accent/20 animate-ping duration-1000" />
        <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-offbeat-surface to-offbeat-dark border border-offbeat-accent/50 flex items-center justify-center text-offbeat-accent shadow-glow">
          <IconComponent className="h-10 w-10 animate-pulse text-offbeat-accent" />
        </div>
      </div>

      {/* Main Status Headline */}
      <div className="max-w-md space-y-2 mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-offbeat-accent block">
          OFFBEAT Discovery Engine Active
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-offbeat-primary uppercase tracking-wide">
          Discovering {regionName}
        </h2>
        <p className="text-sm text-offbeat-secondary">{current.detail}</p>
      </div>

      {/* Progress Stages Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div
              key={step.title}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-1.5 ${
                isCurrent
                  ? "bg-offbeat-accent/15 border-offbeat-accent text-offbeat-accent shadow-sm"
                  : isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-offbeat-surface border-offbeat-border text-offbeat-muted opacity-50"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span>{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
