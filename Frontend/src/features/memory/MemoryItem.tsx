import React from "react";
import type { TravelerMemoryDto } from "@offbeat/shared";
import { Trash2, ShieldCheck, Sparkles, Clock, Compass } from "lucide-react";

interface MemoryItemProps {
  memory: TravelerMemoryDto;
  onRemove: (id: string) => void;
}

export const MemoryItem: React.FC<MemoryItemProps> = ({ memory, onRemove }) => {
  const isExplicit = memory.source === "EXPLICIT";

  // Confidence badge color
  const getConfidenceBadge = () => {
    switch (memory.confidence) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            HIGH CONFIDENCE
          </span>
        );
      case "MODERATE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3" />
            MODERATE
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3 h-3" />
            EMERGING
          </span>
        );
    }
  };

  // Type icon
  const getTypeIcon = () => {
    switch (memory.type) {
      case "TASTE":
      case "EXPERIENCE":
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case "PACE":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "ALTERNATIVE_PREFERENCE":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Compass className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-offbeat-surface border border-offbeat-border hover:border-offbeat-border-hover transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-offbeat-surface-hover">{getTypeIcon()}</div>
            <div>
              <h4 className="text-sm font-semibold text-white capitalize">
                {memory.value || memory.key}
              </h4>
              <span className="text-[11px] text-offbeat-muted font-mono uppercase tracking-wider">
                {memory.type.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getConfidenceBadge()}
            <button
              type="button"
              onClick={() => onRemove(memory.id)}
              className="p-1.5 rounded-lg text-offbeat-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100"
              title="Remove this memory"
              aria-label={`Remove memory ${memory.value || memory.key}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Explainability Text */}
        <p className="text-xs text-offbeat-secondary mt-2 mb-3 leading-relaxed">
          {memory.explanation ||
            (isExplicit
              ? "You directly selected this in your travel taste setup."
              : `Inferred from your interactions across ${memory.evidenceCount} journey choices.`)}
        </p>
      </div>

      {/* Meta Footer */}
      <div className="pt-2.5 border-t border-offbeat-border/40 flex items-center justify-between text-[11px] text-offbeat-muted font-mono">
        <span className="flex items-center gap-1">
          Source:{" "}
          <strong className="text-offbeat-secondary uppercase">
            {isExplicit ? "You told OFFBEAT" : "OFFBEAT noticed"}
          </strong>
        </span>
        <span>
          Weight: <span className="text-amber-400">{Math.round(memory.weight * 100)}%</span>
        </span>
      </div>
    </div>
  );
};
