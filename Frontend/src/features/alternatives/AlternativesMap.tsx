import React from "react";
import type { PlaceReference, AlternativeCandidate, AlternativeMode } from "@offbeat/shared";
import { Card } from "../../components/ui/Card";
import { MapPin, Navigation, Compass, Layers, PlusCircle, Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";

interface AlternativesMapProps {
  originalPlace: PlaceReference;
  alternatives: AlternativeCandidate[];
  mode: AlternativeMode;
  selectedCandidateId?: string;
  onSelectCandidate?: (candidate: AlternativeCandidate) => void;
}

export const AlternativesMap: React.FC<AlternativesMapProps> = ({
  originalPlace,
  alternatives,
  mode,
  selectedCandidateId,
  onSelectCandidate,
}) => {
  // Normalize spatial bounds around the original place
  const origLat = originalPlace.location?.lat || 27.012;
  const origLng = originalPlace.location?.lng || 88.261;

  // Filter candidates that have valid coordinates, or project them locally
  const pointsWithCoords = alternatives.map((cand, idx) => {
    let lat = cand.location?.lat;
    let lng = cand.location?.lng;

    // Localized spatial scatter fallback if coordinates are missing
    if (lat === undefined || lng === undefined) {
      const angle = (idx / Math.max(alternatives.length, 1)) * 2 * Math.PI;
      const radius = 0.08 + idx * 0.04;
      lat = origLat + radius * Math.cos(angle);
      lng = origLng + radius * Math.sin(angle);
    }

    return {
      candidate: cand,
      lat,
      lng,
      dLat: lat - origLat,
      dLng: lng - origLng,
    };
  });

  // Calculate bounding box
  const allLats = [origLat, ...pointsWithCoords.map((p) => p.lat)];
  const allLngs = [origLng, ...pointsWithCoords.map((p) => p.lng)];

  const minLat = Math.min(...allLats) - 0.04;
  const maxLat = Math.max(...allLats) + 0.04;
  const minLng = Math.min(...allLngs) - 0.04;
  const maxLng = Math.max(...allLngs) + 0.04;

  const latSpan = Math.max(maxLat - minLat, 0.08);
  const lngSpan = Math.max(maxLng - minLng, 0.08);

  // SVG coordinate projection (500x300 viewBox)
  const mapWidth = 600;
  const mapHeight = 320;
  const padding = 50;

  const projectToSvg = (lat: number, lng: number) => {
    const x = padding + ((lng - minLng) / lngSpan) * (mapWidth - 2 * padding);
    // Invert Y for latitude
    const y = mapHeight - (padding + ((lat - minLat) / latSpan) * (mapHeight - 2 * padding));
    return { x, y };
  };

  const origSvg = projectToSvg(origLat, origLng);

  const getVectorStrokeColor = () => {
    switch (mode) {
      case "ENHANCEMENT":
        return "#10b981"; // Emerald
      case "COMPLEMENTARY":
        return "#3b82f6"; // Blue
      case "NEARBY_DISCOVERY":
        return "#f59e0b"; // Amber
      default:
        return "#eab308"; // Gold
    }
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      className="border-offbeat-border/80 bg-offbeat-surface overflow-hidden mb-8"
    >
      <div className="p-4 border-b border-offbeat-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-offbeat-dark text-offbeat-accent">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-offbeat-primary">
              Geographic Relationship & Discovery Vectors
            </h3>
            <p className="text-[11px] text-offbeat-muted">
              Spatial proximity and corridor connections relative to {originalPlace.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
            <span className="text-offbeat-secondary">Original Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getVectorStrokeColor() }}
            />
            <span className="text-offbeat-secondary">Alternatives</span>
          </div>
        </div>
      </div>

      <div className="relative w-full bg-gradient-to-b from-offbeat-dark/90 to-offbeat-surface/90 overflow-hidden">
        {/* Decorative Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-64 sm:h-72 select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="vectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
              <stop offset="100%" stopColor={getVectorStrokeColor()} stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Vectors from Original to Alternatives */}
          {pointsWithCoords.map((pt, i) => {
            const svgPos = projectToSvg(pt.lat, pt.lng);
            const isSelected =
              selectedCandidateId === pt.candidate.placeId ||
              selectedCandidateId === pt.candidate.externalId;

            return (
              <g key={`vector-${i}`}>
                <line
                  x1={origSvg.x}
                  y1={origSvg.y}
                  x2={svgPos.x}
                  y2={svgPos.y}
                  stroke={getVectorStrokeColor()}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray="4,4"
                  strokeOpacity={isSelected ? 0.9 : 0.4}
                />
              </g>
            );
          })}

          {/* Original Place Anchor Marker */}
          <g transform={`translate(${origSvg.x}, ${origSvg.y})`}>
            {/* Pulsing ring */}
            <circle
              r="14"
              fill="none"
              stroke="#eab308"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              className="animate-ping"
            />
            <circle r="8" fill="#eab308" filter="url(#glow)" />
            <circle r="4" fill="#0f172a" />
            {/* Label */}
            <text
              x="0"
              y="-16"
              textAnchor="middle"
              className="fill-amber-400 font-bold text-[11px] font-mono select-none"
            >
              {originalPlace.name}
            </text>
          </g>

          {/* Alternative Candidates Markers */}
          {pointsWithCoords.map((pt, i) => {
            const svgPos = projectToSvg(pt.lat, pt.lng);
            const isSelected =
              selectedCandidateId === pt.candidate.placeId ||
              selectedCandidateId === pt.candidate.externalId;
            const cand = pt.candidate;

            return (
              <g
                key={`point-${i}`}
                transform={`translate(${svgPos.x}, ${svgPos.y})`}
                className="cursor-pointer transition-transform duration-200 hover:scale-110"
                onClick={() => onSelectCandidate && onSelectCandidate(cand)}
              >
                {isSelected && (
                  <circle
                    r="12"
                    fill="none"
                    stroke={getVectorStrokeColor()}
                    strokeWidth="2"
                    strokeOpacity="0.8"
                  />
                )}
                <circle
                  r="6"
                  fill={isSelected ? getVectorStrokeColor() : "#64748b"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="16"
                  textAnchor="middle"
                  className={cn(
                    "text-[10px] font-medium select-none",
                    isSelected
                      ? "fill-offbeat-primary font-bold"
                      : "fill-offbeat-muted hover:fill-offbeat-primary",
                  )}
                >
                  {cand.name.length > 18 ? `${cand.name.slice(0, 16)}…` : cand.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};
