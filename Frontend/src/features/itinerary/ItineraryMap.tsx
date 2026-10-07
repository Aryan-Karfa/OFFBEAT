import React from "react";
import type { ItineraryStopDto } from "@offbeat/shared";
import { Card } from "../../components/ui/Card";
import { Compass } from "lucide-react";

interface ItineraryMapProps {
  stops: ItineraryStopDto[];
  selectedStopId?: string | null;
  onSelectStop?: (stopId: string) => void;
  destinationName?: string;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  destinationName = "Darjeeling",
}) => {
  // Filter out pure free time stops from map coordinates unless they have locations
  const placeStops = stops.filter((s) => !s.isFreeTime || s.location);

  if (placeStops.length === 0) {
    return null;
  }

  // Anchor around Darjeeling coordinates
  const anchorLat = placeStops[0]?.location?.lat || 27.012;
  const anchorLng = placeStops[0]?.location?.lng || 88.261;

  // Collect and project coordinates
  const points = placeStops.map((stop, idx) => {
    let lat = stop.location?.lat;
    let lng = stop.location?.lng;

    if (lat === undefined || lng === undefined) {
      // Linear distributed fallback along a realistic scenic corridor
      const angle = (idx / Math.max(placeStops.length, 1)) * Math.PI * 0.8 - Math.PI * 0.4;
      const radius = 0.05 + idx * 0.03;
      lat = anchorLat + radius * Math.sin(angle);
      lng = anchorLng + radius * Math.cos(angle);
    }

    return {
      stop,
      index: idx,
      lat,
      lng,
    };
  });

  const allLats = points.map((p) => p.lat);
  const allLngs = points.map((p) => p.lng);

  const minLat = Math.min(...allLats) - 0.03;
  const maxLat = Math.max(...allLats) + 0.03;
  const minLng = Math.min(...allLngs) - 0.03;
  const maxLng = Math.max(...allLngs) + 0.03;

  const latSpan = Math.max(maxLat - minLat, 0.06);
  const lngSpan = Math.max(maxLng - minLng, 0.06);

  const mapWidth = 600;
  const mapHeight = 320;
  const padding = 50;

  const projectToSvg = (lat: number, lng: number) => {
    const x = padding + ((lng - minLng) / lngSpan) * (mapWidth - 2 * padding);
    const y = mapHeight - (padding + ((lat - minLat) / latSpan) * (mapHeight - 2 * padding));
    return { x, y };
  };

  const projectedPoints = points.map((p) => ({
    ...p,
    svg: projectToSvg(p.lat, p.lng),
  }));

  return (
    <Card
      variant="elevated"
      padding="none"
      className="border-offbeat-border/80 bg-offbeat-surface overflow-hidden"
    >
      {/* Map Header */}
      <div className="p-4 border-b border-offbeat-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-offbeat-dark text-offbeat-accent">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-offbeat-primary">Geographic Journey Route</h3>
            <p className="text-[11px] text-offbeat-muted">
              Continuous sequence minimizing backtracking across {destinationName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-offbeat-accent ring-2 ring-offbeat-accent/30" />
            <span className="text-offbeat-secondary">01 → 0{placeStops.length} Corridor</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[20/9] bg-gradient-to-b from-offbeat-dark/95 to-offbeat-dark">
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-offbeat-border/20 via-transparent to-transparent opacity-60" />

        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full"
          style={{ overflow: "visible" }}
        >
          {/* Connecting Vectors between Consecutive Stops */}
          {projectedPoints.map((pt, i) => {
            if (i === projectedPoints.length - 1) return null;
            const next = projectedPoints[i + 1];
            if (!next) return null;

            const midX = (pt.svg.x + next.svg.x) / 2;
            const midY = (pt.svg.y + next.svg.y) / 2;

            return (
              <g key={`leg-${i}`}>
                {/* Glow underlay */}
                <line
                  x1={pt.svg.x}
                  y1={pt.svg.y}
                  x2={next.svg.x}
                  y2={next.svg.y}
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                />
                {/* Core directional route line */}
                <line
                  x1={pt.svg.x}
                  y1={pt.svg.y}
                  x2={next.svg.x}
                  y2={next.svg.y}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
                {/* Transit badge indicator */}
                {next.stop.travelFromPreviousMinutes && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-22"
                      y="-9"
                      width="44"
                      height="18"
                      rx="9"
                      fill="#0f172a"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {next.stop.travelFromPreviousMinutes}m
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Interactive Stop Pins */}
          {projectedPoints.map((pt) => {
            const isSelected = selectedStopId === (pt.stop.id || pt.stop.placeId);

            return (
              <g
                key={`pin-${pt.stop.id || pt.stop.placeId || pt.index}`}
                transform={`translate(${pt.svg.x}, ${pt.svg.y})`}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectStop && onSelectStop(pt.stop.id || pt.stop.placeId || "")}
              >
                {/* Pulse Ring when selected */}
                {isSelected && (
                  <circle
                    r="16"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeOpacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Outer Marker */}
                <circle
                  r="12"
                  fill={isSelected ? "#0284c7" : "#0f172a"}
                  stroke={isSelected ? "#38bdf8" : "#475569"}
                  strokeWidth="2"
                />

                {/* Sequence Label (01, 02, etc.) */}
                <text
                  x="0"
                  y="4"
                  fill={isSelected ? "#ffffff" : "#cbd5e1"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {String(pt.index + 1).padStart(2, "0")}
                </text>

                {/* Stop Title Label */}
                <text
                  x="0"
                  y="24"
                  fill={isSelected ? "#38bdf8" : "#94a3b8"}
                  fontSize="11"
                  fontWeight={isSelected ? "bold" : "normal"}
                  textAnchor="middle"
                  className="select-none drop-shadow-md"
                >
                  {pt.stop.name.length > 18 ? `${pt.stop.name.slice(0, 16)}…` : pt.stop.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};
