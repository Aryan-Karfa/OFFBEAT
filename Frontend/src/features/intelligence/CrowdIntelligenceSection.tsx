import React from "react";
import type { CrowdIntelligenceDto, CrowdLevel } from "@offbeat/shared";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Users, Info, TrendingDown, TrendingUp } from "lucide-react";

interface CrowdIntelligenceSectionProps {
  crowdIntelligence?: CrowdIntelligenceDto;
}

function getCrowdBadgeVariant(
  level: CrowdLevel,
): "verified" | "supported" | "flagged" | "new" | "tag" {
  switch (level) {
    case "LOW":
      return "verified";
    case "MODERATE":
      return "supported";
    case "HIGH":
    case "VERY_HIGH":
      return "flagged";
    case "UNKNOWN":
    default:
      return "tag";
  }
}

function getCrowdLevelLabel(level: CrowdLevel): string {
  switch (level) {
    case "LOW":
      return "Low Crowd";
    case "MODERATE":
      return "Moderate Crowd";
    case "HIGH":
      return "High Crowd";
    case "VERY_HIGH":
      return "Very High Crowd";
    case "UNKNOWN":
    default:
      return "Crowd Info Unavailable";
  }
}

export const CrowdIntelligenceSection: React.FC<CrowdIntelligenceSectionProps> = ({
  crowdIntelligence,
}) => {
  if (!crowdIntelligence) return null;

  const { overall, patterns, explanation, evidenceStrength, source } = crowdIntelligence;
  const isAvailable = overall !== "UNKNOWN";

  return (
    <Card variant="elevated" padding="md" className="border-offbeat-border/80 bg-offbeat-surface">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-offbeat-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-offbeat-primary">Crowd Conditions</h3>
            <p className="text-[11px] text-offbeat-muted">Contextual crowd levels by day & time</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant={getCrowdBadgeVariant(overall)} size="sm">
            {getCrowdLevelLabel(overall)}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Contextual Patterns */}
        {patterns.length > 0 ? (
          <div className="space-y-2">
            {patterns.map((pat, idx) => {
              const isLow = pat.level === "LOW";
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-offbeat-dark/60 border border-offbeat-border/50 flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-offbeat-primary">
                      {isLow ? (
                        <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <span>
                        {pat.dayType === "WEEKDAY"
                          ? "Weekday"
                          : pat.dayType === "WEEKEND"
                            ? "Weekend"
                            : "General"}
                        {pat.time ? ` (${pat.time})` : ""}
                      </span>
                    </div>
                    {pat.observation && (
                      <p className="text-[11px] text-offbeat-muted">{pat.observation}</p>
                    )}
                  </div>

                  <Badge variant={getCrowdBadgeVariant(pat.level)} size="sm">
                    {pat.level}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-offbeat-muted italic p-3 bg-offbeat-dark/30 rounded border border-offbeat-border/30">
            Crowd observations are not yet recorded for this specific place.
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <p className="text-xs text-offbeat-secondary leading-relaxed pt-2 border-t border-offbeat-border/40">
            {explanation}
          </p>
        )}

        {/* Source & Transparency Note */}
        <div className="flex items-center justify-between text-[11px] text-offbeat-muted pt-1">
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" /> Source: {source}
          </span>
          {evidenceStrength && isAvailable && (
            <span className="font-mono text-[10px] text-offbeat-accent uppercase">
              {evidenceStrength} EVIDENCE
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
