import React, { useEffect, useState } from "react";
import type { ItineraryStopDto, AlternativeCandidate, AlternativeMode } from "@offbeat/shared";
import { alternativesService } from "../../services/alternativesService";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { X, RefreshCw, Sparkles, Clock, Users, CheckCircle2, AlertTriangle } from "lucide-react";

interface SwapStopModalProps {
  stop: ItineraryStopDto;
  onClose: () => void;
  onSelectReplacement: (replacement: {
    id: string;
    name: string;
    destination?: string;
    category?: string;
    imageUrl?: string | null;
    why?: string;
  }) => void;
}

export const SwapStopModal: React.FC<SwapStopModalProps> = ({
  stop,
  onClose,
  onSelectReplacement,
}) => {
  const [mode, setMode] = useState<AlternativeMode>("REPLACEMENT");
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<AlternativeCandidate[]>([]);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAlts = async () => {
      if (!stop.placeId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await alternativesService.getAlternatives(stop.placeId, {
          mode,
          travelTaste: "mountains,photography",
          experienceTaste: "nature,scenic",
        });
        if (active) {
          setCandidates(response.alternatives);
          setReasoning(response.reasoning?.explanation || null);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to find alternatives");
          setLoading(false);
        }
      }
    };

    fetchAlts();
    return () => {
      active = false;
    };
  }, [stop.placeId, mode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <Card
        variant="elevated"
        padding="none"
        className="w-full max-w-2xl max-h-[85vh] flex flex-col border-offbeat-border bg-offbeat-surface shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-offbeat-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-offbeat-accent/10 text-offbeat-accent">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-offbeat-accent uppercase">
                  Phase 12 Alternative Swap
                </span>
              </div>
              <h3 className="text-base font-bold text-offbeat-primary">
                Swap &ldquo;{stop.name}&rdquo;
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-offbeat-muted hover:text-offbeat-primary hover:bg-offbeat-dark transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 py-3 border-b border-offbeat-border/60 bg-offbeat-dark/40 flex items-center gap-2 overflow-x-auto">
          {(["REPLACEMENT", "LOWER_CROWD", "TIMING_ALTERNATIVE", "NEARBY_DISCOVERY"] as const).map(
            (m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  mode === m
                    ? "bg-offbeat-accent/20 border-offbeat-accent text-offbeat-accent"
                    : "border-offbeat-border/60 text-offbeat-secondary hover:border-offbeat-border"
                }`}
              >
                {m.replace("_", " ")}
              </button>
            ),
          )}
        </div>

        {/* AI Reasoning Summary if available */}
        {reasoning && !loading && (
          <div className="px-5 py-3 bg-offbeat-accent/5 border-b border-offbeat-border/40 text-xs text-offbeat-secondary flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-offbeat-accent shrink-0 mt-0.5" />
            <span>{reasoning}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && (
            <div className="py-12 text-center text-offbeat-muted space-y-3">
              <div className="h-6 w-6 border-2 border-offbeat-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Finding approved replacements via Phase 12 Alternatives...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-8 text-center text-red-400 text-xs bg-red-950/20 p-4 rounded-xl border border-red-500/20">
              <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-red-400" />
              {error}
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="py-12 text-center text-offbeat-muted text-xs">
              No suitable alternative found for this mode. Try another mode above.
            </div>
          )}

          {!loading &&
            !error &&
            candidates.map((cand) => (
              <div
                key={cand.placeId || cand.externalId}
                className="p-4 rounded-xl bg-offbeat-dark border border-offbeat-border hover:border-offbeat-accent/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono font-bold text-offbeat-accent uppercase">
                      {cand.category || "Attraction"}
                    </span>
                    {cand.timeFit === "GOOD" && (
                      <Badge variant="verified" size="sm">
                        <Clock className="h-3 w-3 mr-1 inline" /> Time Fit
                      </Badge>
                    )}
                    {cand.crowdFit === "GOOD" && (
                      <Badge
                        variant="tag"
                        size="sm"
                        className="bg-sky-500/10 text-sky-300 border-sky-500/20"
                      >
                        <Users className="h-3 w-3 mr-1 inline" /> Low Crowd
                      </Badge>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-offbeat-primary group-hover:text-offbeat-accent transition-colors">
                    {cand.name}
                  </h4>

                  <p className="text-xs text-offbeat-secondary mt-1 leading-relaxed">{cand.why}</p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    onSelectReplacement({
                      id: cand.placeId || cand.externalId || "",
                      name: cand.name,
                      destination: cand.destination,
                      category: cand.category,
                      imageUrl: cand.imageUrl,
                      why: cand.why,
                    })
                  }
                  className="shrink-0 text-xs font-bold"
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  Select Replacement
                </Button>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
