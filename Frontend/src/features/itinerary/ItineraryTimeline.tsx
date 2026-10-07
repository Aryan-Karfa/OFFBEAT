import React from "react";
import type { ItineraryDayDto, ItineraryStopDto } from "@offbeat/shared";
import { ItineraryStopCard } from "./ItineraryStopCard";
import { Clock, Navigation, CheckCircle2 } from "lucide-react";

interface ItineraryTimelineProps {
  day: ItineraryDayDto;
  selectedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  onSwapStop?: (stop: ItineraryStopDto) => void;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  day,
  selectedStopId,
  onSelectStop,
  onSwapStop,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Day Overview Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-secondary">
        <div className="flex items-center gap-2">
          <span className="font-bold text-offbeat-primary uppercase tracking-wide">
            {day.title}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {day.totalVisitMinutes !== undefined && day.totalVisitMinutes > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-offbeat-accent" />
              <span>{Math.round((day.totalVisitMinutes / 60) * 10) / 10}h exploration</span>
            </div>
          )}
          {day.totalTravelMinutes !== undefined && day.totalTravelMinutes > 0 && (
            <div className="flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-offbeat-muted" />
              <span>~{day.totalTravelMinutes}m transit</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>{day.stops.filter((s) => !s.isFreeTime).length} destinations</span>
          </div>
        </div>
      </div>

      {/* Sequential Stops */}
      <div className="relative py-2">
        {day.stops.map((stop, idx) => (
          <ItineraryStopCard
            key={stop.id || stop.placeId || idx}
            stop={stop}
            index={idx}
            isSelected={selectedStopId === (stop.id || stop.placeId)}
            onSelect={() => onSelectStop && onSelectStop(stop.id || stop.placeId || "")}
            onSwap={onSwapStop}
          />
        ))}
      </div>
    </div>
  );
};
