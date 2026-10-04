import React from "react";
import type { TimeIntelligenceDto } from "@offbeat/shared";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Clock, Sun, Sparkles, CheckCircle2 } from "lucide-react";

interface TimeIntelligenceSectionProps {
  timeIntelligence?: TimeIntelligenceDto;
}

export const TimeIntelligenceSection: React.FC<TimeIntelligenceSectionProps> = ({
  timeIntelligence,
}) => {
  if (!timeIntelligence) return null;

  const { operatingHours, recommendedTimes, explanation } = timeIntelligence;
  const hasOperating = operatingHours.schedule && operatingHours.schedule.length > 0;
  const hasRecommendations = recommendedTimes.length > 0;

  return (
    <Card variant="elevated" padding="md" className="border-offbeat-border/80 bg-offbeat-surface">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-offbeat-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-offbeat-primary">When to Go</h3>
            <p className="text-[11px] text-offbeat-muted">
              Operating facts & community recommendations
            </p>
          </div>
        </div>

        {timeIntelligence.timeFit && timeIntelligence.timeFit !== "UNKNOWN" && (
          <Badge
            variant={
              timeIntelligence.timeFit === "GOOD"
                ? "verified"
                : timeIntelligence.timeFit === "PARTIAL"
                  ? "supported"
                  : "flagged"
            }
            size="sm"
          >
            {timeIntelligence.timeFit === "GOOD"
              ? "Good Time Fit"
              : timeIntelligence.timeFit === "PARTIAL"
                ? "Partial Time Fit"
                : "Time Conflict"}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Operating Hours (Fact) */}
        {hasOperating ? (
          <div className="p-3 rounded-lg bg-offbeat-dark/60 border border-offbeat-border/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-offbeat-secondary flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Operating Hours (Official)
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {operatingHours.source}
              </span>
            </div>
            <div className="space-y-1">
              {operatingHours.schedule?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-offbeat-primary">
                  <span className="text-offbeat-muted">{item.day || "General"}:</span>
                  <span className="font-mono">
                    {item.is24Hours
                      ? "Open 24 hours"
                      : item.closed
                        ? "Closed"
                        : `${item.open || ""} – ${item.close || ""}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-offbeat-muted italic p-2 bg-offbeat-dark/30 rounded border border-offbeat-border/30">
            Operating hours not publicly specified.
          </div>
        )}

        {/* Recommended Times (Community Recommendation) */}
        {hasRecommendations && (
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                Best Experience Window
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                Community
              </span>
            </div>

            <div className="space-y-2">
              {recommendedTimes.map((rec, i) => (
                <div key={i} className="flex items-start justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-offbeat-primary text-sm font-mono block">
                      {rec.start} – {rec.end}
                    </span>
                    {rec.reason && (
                      <span className="text-offbeat-muted text-[11px] block mt-0.5">
                        {rec.reason}
                      </span>
                    )}
                  </div>
                  {rec.evidenceStrength && (
                    <Badge variant="accent" size="sm">
                      {rec.evidenceStrength} EVIDENCE
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation Summary */}
        {explanation && (
          <p className="text-xs text-offbeat-secondary leading-relaxed pt-2 border-t border-offbeat-border/40 flex items-start gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-offbeat-accent shrink-0 mt-0.5" />
            <span>{explanation}</span>
          </p>
        )}
      </div>
    </Card>
  );
};
