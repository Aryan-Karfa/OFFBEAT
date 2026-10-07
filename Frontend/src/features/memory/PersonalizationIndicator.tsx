import React, { useState } from "react";
import type { TravelerPersonalizationProfileDto } from "@offbeat/shared";
import { Sparkles, Info, X, ShieldCheck } from "lucide-react";

interface PersonalizationIndicatorProps {
  personalization: TravelerPersonalizationProfileDto | null;
  className?: string;
}

export const PersonalizationIndicator: React.FC<PersonalizationIndicatorProps> = ({
  personalization,
  className = "",
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (
    !personalization ||
    !personalization.memoryEnabled ||
    personalization.totalMemoriesCount === 0
  ) {
    return null;
  }

  const explicitSignals = personalization.topExplicitSignals || [];
  const inferredSignals = personalization.topInferredSignals || [];

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm group"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span>Personalized for you</span>
        <Info className="w-3 h-3 text-amber-400/70 ml-0.5" />
      </button>

      {/* Explanatory Modal / Popover */}
      {showDetails && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-offbeat-surface border border-offbeat-border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3 border-b border-offbeat-border/50 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">How This Was Personalized</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="p-1 rounded-lg text-offbeat-muted hover:text-white hover:bg-offbeat-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-offbeat-secondary mb-3 leading-relaxed">
            OFFBEAT tuned these discovery suggestions based on your verified preferences and recent
            journey interactions:
          </p>

          {explicitSignals.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
                You explicitly chose:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {explicitSignals.map((sig) => (
                  <span
                    key={sig}
                    className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          )}

          {inferredSignals.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-1">
                Inferred travel style:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {inferredSignals.map((sig) => (
                  <span
                    key={sig}
                    className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  >
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-2.5 border-t border-offbeat-border/50 flex items-center justify-between text-[11px] text-offbeat-muted">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Transparent & in your control
            </span>
            <a href="/memory" className="text-amber-400 hover:text-amber-300 font-medium underline">
              Manage Memory
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
