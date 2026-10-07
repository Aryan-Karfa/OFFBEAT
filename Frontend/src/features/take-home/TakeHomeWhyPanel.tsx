import React from "react";
import type { TakeHomeReasoningDto } from "@offbeat/shared";
import { Sparkles, CheckCircle2, ShieldCheck, Heart } from "lucide-react";

interface TakeHomeWhyPanelProps {
  reasoning: TakeHomeReasoningDto | null;
  destinationName: string;
}

export const TakeHomeWhyPanel: React.FC<TakeHomeWhyPanelProps> = ({
  reasoning,
  destinationName,
}) => {
  return (
    <div className="mb-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-offbeat-surface to-offbeat-surface border border-amber-500/30 p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Why OFFBEAT Recommends This
          </span>
        </div>

        <p className="text-base md:text-lg text-white font-medium mb-6 leading-relaxed">
          {reasoning?.explanation ||
            `Curated selections for ${destinationName} rooted in authentic craftsmanship and regional food heritage, avoiding mass-produced commercial souvenirs.`}
        </p>

        {/* Triple Signal Breakdown Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-offbeat-border/60">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-offbeat-surface/60 border border-offbeat-border/40">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white mb-0.5">Destination-Linked</div>
              <div className="text-xs text-offbeat-muted">
                Locally associated with {destinationName}'s heritage and culture.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-offbeat-surface/60 border border-offbeat-border/40">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white mb-0.5">Verified Sourcing</div>
              <div className="text-xs text-offbeat-muted">
                Backed by real tea gardens, weaver guilds, and local workshops.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-offbeat-surface/60 border border-offbeat-border/40">
            <Heart className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white mb-0.5">Community-Endorsed</div>
              <div className="text-xs text-offbeat-muted">
                Corroborated by independent traveler experiences.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
