import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { AlternativeCandidate, AlternativeMode } from "@offbeat/shared";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  ShieldCheck,
  Compass,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { cn } from "../../utils/cn";

interface AlternativeCardProps {
  candidate: AlternativeCandidate;
  mode: AlternativeMode;
  isPrimary?: boolean;
  isAiReasoned?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const AlternativeCard: React.FC<AlternativeCardProps> = ({
  candidate,
  mode,
  isPrimary = false,
  isAiReasoned = false,
  onSelect,
  isSelected = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Time fit visual mapping
  const getTimeFitBadge = () => {
    switch (candidate.timeFit) {
      case "GOOD":
        return (
          <Badge variant="verified" size="sm">
            <Clock className="h-3 w-3 mr-1 inline" /> Optimal Time Window
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="supported" size="sm">
            <Clock className="h-3 w-3 mr-1 inline" /> Partial Time Fit
          </Badge>
        );
      case "CONFLICT":
        return (
          <Badge variant="flagged" size="sm">
            <Clock className="h-3 w-3 mr-1 inline" /> Time Conflict
          </Badge>
        );
      case "UNKNOWN":
      default:
        return (
          <Badge variant="tag" size="sm">
            <Clock className="h-3 w-3 mr-1 inline" /> Time: Flexible
          </Badge>
        );
    }
  };

  // Crowd fit visual mapping
  const getCrowdFitBadge = () => {
    switch (candidate.crowdFit) {
      case "GOOD":
        return (
          <Badge variant="verified" size="sm">
            <Users className="h-3 w-3 mr-1 inline" /> Low Crowd Density
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="supported" size="sm">
            <Users className="h-3 w-3 mr-1 inline" /> Moderate Crowd
          </Badge>
        );
      case "UNKNOWN":
      default:
        return (
          <Badge variant="tag" size="sm">
            <Users className="h-3 w-3 mr-1 inline" /> Crowd: Unknown
          </Badge>
        );
    }
  };

  // Confidence badge mapping (Phase 9 authority)
  const getConfidenceBadge = () => {
    if (!candidate.confidence) return null;
    const strength = candidate.confidence.evidenceStrength;
    const score = candidate.confidence.score;

    if (strength === "HIGH" || (score !== undefined && score >= 0.75)) {
      return (
        <Badge variant="verified" size="sm" title="High confidence verified place data">
          <ShieldCheck className="h-3 w-3 mr-1 inline" /> High Confidence
        </Badge>
      );
    }
    if (strength === "MODERATE" || (score !== undefined && score >= 0.5)) {
      return (
        <Badge variant="supported" size="sm">
          <ShieldCheck className="h-3 w-3 mr-1 inline" /> Moderate Confidence
        </Badge>
      );
    }
    return null;
  };

  // Source transparency badge
  const getSourceBadge = () => {
    switch (candidate.source) {
      case "COMBINED":
        return (
          <Badge variant="verified" dot size="sm">
            Verified + SerpApi
          </Badge>
        );
      case "INTERNAL":
        return (
          <Badge variant="accent" dot size="sm">
            Canonical Offbeat
          </Badge>
        );
      case "EXTERNAL":
        return (
          <Badge variant="supported" dot size="sm">
            Live Google Maps
          </Badge>
        );
    }
  };

  const targetUrl = `/place/${candidate.slug || candidate.placeId || candidate.externalId || ""}`;

  return (
    <Card
      variant="elevated"
      padding="none"
      className={cn(
        "overflow-hidden border transition-all duration-300 flex flex-col relative group",
        isSelected
          ? "border-offbeat-accent ring-1 ring-offbeat-accent/50 shadow-elevated"
          : isPrimary
            ? "border-offbeat-accent/60 bg-offbeat-surface shadow-md"
            : "border-offbeat-border/80 hover:border-offbeat-border bg-offbeat-surface/90",
      )}
      onClick={onSelect}
    >
      {/* Top Banner Ribbon for Primary Choice */}
      {isPrimary && (
        <div className="bg-gradient-to-r from-offbeat-accent/20 via-offbeat-accent/10 to-transparent px-4 py-1.5 border-b border-offbeat-accent/30 flex items-center justify-between text-xs font-semibold text-offbeat-accent">
          <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]">
            <Sparkles className="h-3.5 w-3.5" /> Top Recommendation
          </span>
          {isAiReasoned ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
              Gemini Reasoned
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-muted">
              OFFBEAT Reasoned
            </span>
          )}
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              {getSourceBadge()}
              {candidate.category && (
                <span className="text-xs font-medium text-offbeat-muted">
                  • {candidate.category}
                </span>
              )}
            </div>

            {getConfidenceBadge()}
          </div>

          {/* Place Title */}
          <div className="mb-2">
            <h3 className="text-xl font-bold text-offbeat-primary group-hover:text-offbeat-accent transition-colors">
              {candidate.name}
            </h3>
            {candidate.destination && (
              <div className="flex items-center gap-1 text-xs text-offbeat-muted mt-0.5">
                <MapPin className="h-3 w-3 text-offbeat-accent" />
                <span>{candidate.destination}</span>
              </div>
            )}
          </div>

          {/* Pairing Relationship Context if available */}
          {candidate.relationshipContext && (
            <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{candidate.relationshipContext}</span>
            </div>
          )}

          {/* Core Feature: WHY OFFBEAT CHOSE THIS */}
          <div className="my-3 p-3.5 rounded-xl bg-offbeat-dark/70 border border-offbeat-border/80 relative">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-offbeat-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Why OFFBEAT Chose This</span>
            </div>
            <p className="text-xs sm:text-sm text-offbeat-secondary leading-relaxed font-normal">
              {candidate.why}
            </p>
          </div>

          {/* Tradeoff Alert if present */}
          {candidate.tradeoff && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Trade-off:</strong> {candidate.tradeoff}
              </span>
            </div>
          )}

          {/* Category Tags */}
          {candidate.categories && candidate.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {candidate.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-offbeat-dark border border-offbeat-border/60 text-offbeat-muted"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Signals Footer & Explore CTA */}
        <div className="pt-3 border-t border-offbeat-border/60 mt-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {getTimeFitBadge()}
              {getCrowdFitBadge()}
              {candidate.community && candidate.community.verifiedCount > 0 && (
                <Badge variant="verified" size="sm">
                  <MessageSquare className="h-3 w-3 mr-1 inline" /> {candidate.community.verifiedCount} Community Signals
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-offbeat-muted">
              {candidate.location
                ? `LAT: ${candidate.location.lat.toFixed(2)}, LNG: ${candidate.location.lng.toFixed(2)}`
                : "Geocoded Destination"}
            </span>

            <Link to={targetUrl}>
              <Button
                variant={isPrimary ? "primary" : "outline"}
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                className="font-semibold text-xs px-4"
              >
                EXPLORE
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
