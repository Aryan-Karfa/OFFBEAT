import React from "react";
import { Link } from "react-router-dom";
import type { ItineraryStopDto } from "@offbeat/shared";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Clock, MapPin, Utensils, ArrowRight, RefreshCw, Users, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";

interface ItineraryStopCardProps {
  stop: ItineraryStopDto;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onSwap?: (stop: ItineraryStopDto) => void;
}

export const ItineraryStopCard: React.FC<ItineraryStopCardProps> = ({
  stop,
  index,
  isSelected = false,
  onSelect,
  onSwap,
}) => {
  // Free time card variant
  if (stop.isFreeTime) {
    return (
      <div className="relative pl-8 sm:pl-10 my-4">
        {/* Timeline Line & Node */}
        <div className="absolute left-3.5 sm:left-4.5 -top-3 bottom-0 w-0.5 bg-offbeat-border/60" />
        <div className="absolute left-2 sm:left-3 top-5 h-4 w-4 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>

        <Card
          variant="flat"
          padding="md"
          className="bg-emerald-950/15 border-dashed border-emerald-500/30 hover:border-emerald-500/50 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {stop.arrivalTime} – {stop.departureTime}
                  </span>
                  <Badge
                    variant="tag"
                    size="sm"
                    className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  >
                    {stop.durationMinutes} min free time
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-offbeat-primary mt-0.5">{stop.name}</h4>
              </div>
            </div>
            <p className="text-xs text-offbeat-secondary max-w-md italic">{stop.why}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Standard Place Stop Card
  const timeFitBadge = () => {
    switch (stop.timeFit) {
      case "GOOD":
        return (
          <Badge variant="verified" size="sm">
            <Clock className="h-3 w-3 mr-1 inline" /> Optimal Time
          </Badge>
        );
      case "CONFLICT":
        return (
          <Badge variant="flagged" size="sm">
            <AlertTriangle className="h-3 w-3 mr-1 inline text-red-400" /> Time Conflict
          </Badge>
        );
      case "PARTIAL":
        return (
          <Badge variant="supported" size="sm">
            <Clock className="h-3 w-3 mr-1 inline" /> Partial Window
          </Badge>
        );
      default:
        return null;
    }
  };

  const crowdFitBadge = () => {
    switch (stop.crowdFit) {
      case "GOOD":
        return (
          <Badge variant="tag" size="sm" className="bg-sky-500/10 text-sky-300 border-sky-500/20">
            <Users className="h-3 w-3 mr-1 inline" /> Calm Window
          </Badge>
        );
      default:
        return null;
    }
  };

  const placeLink = stop.placeId ? `/place/${stop.slug || stop.placeId}` : `/country/india/map`;

  return (
    <div className="relative pl-8 sm:pl-10 my-4 group">
      {/* Timeline Line */}
      <div className="absolute left-3.5 sm:left-4.5 -top-4 bottom-0 w-0.5 bg-offbeat-border" />

      {/* Stop Sequence Number Pin */}
      <div
        className={cn(
          "absolute left-1.5 sm:left-2.5 top-5 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-all z-10",
          isSelected
            ? "bg-offbeat-accent border-offbeat-accent text-offbeat-dark shadow-md shadow-offbeat-accent/20"
            : "bg-offbeat-dark border-offbeat-border text-offbeat-secondary group-hover:border-offbeat-accent group-hover:text-offbeat-accent",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      <Card
        variant="elevated"
        padding="md"
        onClick={onSelect}
        className={cn(
          "cursor-pointer transition-all duration-200 border",
          isSelected
            ? "border-offbeat-accent/80 bg-offbeat-surface shadow-lg shadow-offbeat-accent/5 ring-1 ring-offbeat-accent/40"
            : "border-offbeat-border/80 bg-offbeat-surface/80 hover:border-offbeat-border hover:bg-offbeat-surface",
        )}
      >
        {/* Transit notice from previous stop */}
        {stop.travelFromPreviousMinutes !== undefined && stop.travelFromPreviousMinutes > 0 && (
          <div className="mb-3 -mt-1 flex items-center gap-2 text-[11px] text-offbeat-muted font-mono">
            <div className="h-1.5 w-1.5 rounded-full bg-offbeat-muted/60" />
            <span>
              Transit: ~{stop.travelFromPreviousMinutes} min
              {stop.travelDistanceMeters
                ? ` (${(stop.travelDistanceMeters / 1000).toFixed(1)} km)`
                : ""}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-offbeat-accent">
                {stop.arrivalTime} – {stop.departureTime}
              </span>
              <span className="text-xs text-offbeat-muted">•</span>
              <span className="text-xs text-offbeat-muted font-medium">
                {stop.durationMinutes} min stay
              </span>
              {timeFitBadge()}
              {crowdFitBadge()}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-offbeat-primary tracking-tight group-hover:text-offbeat-accent transition-colors">
              {stop.name}
            </h3>

            <div className="flex items-center gap-2 text-xs text-offbeat-muted mt-0.5 mb-2">
              <MapPin className="h-3 w-3 shrink-0 text-offbeat-accent" />
              <span>{stop.destination || "West Bengal"}</span>
              <span>•</span>
              <span className="capitalize">{stop.category || "Attraction"}</span>
            </div>

            <p className="text-xs sm:text-sm text-offbeat-secondary leading-relaxed bg-offbeat-dark/40 p-2.5 rounded-lg border border-offbeat-border/40">
              {stop.why}
            </p>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-offbeat-border/40">
            <Link to={placeLink} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                rightIcon={<ArrowRight className="h-3 w-3" />}
              >
                Explore
              </Button>
            </Link>

            {stop.placeId && onSwap && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSwap(stop);
                }}
                className="w-full text-xs text-offbeat-muted hover:text-offbeat-accent"
                leftIcon={<RefreshCw className="h-3 w-3" />}
              >
                Swap
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
