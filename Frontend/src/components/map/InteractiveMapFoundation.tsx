import React, { useState } from "react";
import type { Region } from "../../types/geography";
import { INDIA_REGIONS } from "../../features/geography/data";
import { Compass, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface InteractiveMapFoundationProps {
  selectedRegion: Region | null;
  onSelectRegion: (region: Region) => void;
  onHoverRegion?: (region: Region | null) => void;
}

// Normalized coordinate projections for the SVG canvas (viewBox 0 0 800 850)
// Longitude range: 68E to 97E -> X: 60 to 740
// Latitude range: 8N to 37N -> Y: 780 to 60 (inverted Y)
const projectCoords = (lat: number, lng: number): { x: number; y: number } => {
  const minLng = 68.0;
  const maxLng = 96.0;
  const minLat = 8.0;
  const maxLat = 36.5;

  const x = 70 + ((lng - minLng) / (maxLng - minLng)) * 620;
  const y = 780 - ((lat - minLat) / (maxLat - minLat)) * 720;
  return { x: Math.round(x), y: Math.round(y) };
};

export const InteractiveMapFoundation: React.FC<InteractiveMapFoundationProps> = ({
  selectedRegion,
  onSelectRegion,
  onHoverRegion,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const handleRegionHover = (region: Region | null) => {
    setActiveHoverId(region ? region.id : null);
    onHoverRegion?.(region);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.8, prev + delta), 1.8));
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] md:h-[680px] rounded-2xl bg-offbeat-surface/90 border border-offbeat-border overflow-hidden select-none shadow-elevated">
      {/* Background Cartographic Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #F5F2EA 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Cartographic Compass Rose */}
      <div className="absolute top-5 right-5 z-10 flex flex-col items-center gap-1 p-2.5 rounded-xl bg-offbeat-dark/80 backdrop-blur-md border border-offbeat-border/70 pointer-events-none">
        <Compass className="h-6 w-6 text-offbeat-accent animate-[spin_60s_linear_infinite]" />
        <span className="text-[10px] font-mono tracking-widest text-offbeat-muted uppercase">
          N · 22°N 79°E
        </span>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-1.5 p-1 rounded-lg bg-offbeat-dark/85 backdrop-blur-md border border-offbeat-border/80">
        <button
          type="button"
          aria-label="Zoom in map"
          onClick={() => handleZoom(0.2)}
          className="p-2 rounded-md text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out map"
          onClick={() => handleZoom(-0.2)}
          className="p-2 rounded-md text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reset map view"
          onClick={handleReset}
          className="p-2 rounded-md text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Legend / Status Pill */}
      <div className="absolute top-5 left-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-offbeat-dark/80 backdrop-blur-md border border-offbeat-border text-xs text-offbeat-secondary">
        <span className="h-2 w-2 rounded-full bg-offbeat-accent animate-ping" />
        <span className="font-medium text-offbeat-primary">India Geographic Surface</span>
        <span className="text-offbeat-muted">· Phase 1 Foundation</span>
      </div>

      {/* Main Vector Surface */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          viewBox="0 0 800 850"
          className="w-full h-full max-h-[820px] object-contain overflow-visible"
          role="img"
          aria-label="Interactive Map of India Regions"
        >
          <defs>
            {/* Ambient gradients */}
            <radialGradient id="subcontinentGlow" cx="48%" cy="52%" r="48%">
              <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.08" />
              <stop offset="70%" stopColor="#15191B" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0B0D0E" stopOpacity="0" />
            </radialGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subcontinent outline silhouette path */}
          <path
            d="M 330 65 L 390 85 L 430 135 L 440 185 L 530 205 L 590 220 L 640 215 L 720 220 L 730 250 L 660 300 L 600 320 L 535 320 L 520 375 L 530 460 L 480 540 L 440 660 L 400 750 L 375 745 L 340 640 L 310 520 L 250 430 L 205 385 L 200 310 L 245 270 L 270 205 L 310 135 Z"
            fill="url(#subcontinentGlow)"
            stroke="#262C30"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="transition-all duration-300"
          />

          {/* Coastlines & Latitude / Longitude lines */}
          <g className="opacity-20 text-offbeat-muted font-mono text-[9px]">
            <line
              x1="120"
              y1="200"
              x2="700"
              y2="200"
              stroke="#262C30"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            <text x="710" y="204" fill="#757D82">
              28° N
            </text>

            <line
              x1="120"
              y1="420"
              x2="700"
              y2="420"
              stroke="#262C30"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            <text x="710" y="424" fill="#757D82">
              20° N
            </text>

            <line
              x1="120"
              y1="640"
              x2="700"
              y2="640"
              stroke="#262C30"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            <text x="710" y="644" fill="#757D82">
              12° N
            </text>

            <line
              x1="280"
              y1="100"
              x2="280"
              y2="760"
              stroke="#262C30"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            <text x="270" y="775" fill="#757D82">
              74° E
            </text>

            <line
              x1="500"
              y1="100"
              x2="500"
              y2="760"
              stroke="#262C30"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            <text x="490" y="775" fill="#757D82">
              84° E
            </text>
          </g>

          {/* Region Nodes & Connectors */}
          {INDIA_REGIONS.map((region) => {
            const { x, y } = projectCoords(region.coordinates.lat, region.coordinates.lng);
            const isSelected = selectedRegion?.id === region.id;
            const isHovered = activeHoverId === region.id;

            return (
              <g
                key={region.id}
                className="cursor-pointer group focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`Region: ${region.name}, ${region.zone} India, ${region.discoveryCount} discoveries`}
                onClick={() => onSelectRegion(region)}
                onMouseEnter={() => handleRegionHover(region)}
                onMouseLeave={() => handleRegionHover(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectRegion(region);
                  }
                }}
              >
                {/* Outer radar pulse when selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="28"
                    fill="none"
                    stroke="#E5A93C"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-ping"
                  />
                )}

                {/* Subtle aura on hover */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="22"
                    fill="#E5A93C"
                    fillOpacity={isSelected ? 0.22 : 0.12}
                    filter="url(#glowFilter)"
                  />
                )}

                {/* Main Node Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "9" : isHovered ? "8" : "6"}
                  fill={isSelected ? "#E5A93C" : isHovered ? "#F5F2EA" : "#202528"}
                  stroke={isSelected ? "#0B0D0E" : isHovered ? "#E5A93C" : "#A9AFB1"}
                  strokeWidth={isSelected ? "3" : "2"}
                  className="transition-all duration-200"
                />

                {/* Region Label Tag */}
                <g transform={`translate(${x + 12}, ${y - 4})`} className="pointer-events-none">
                  <rect
                    x="-4"
                    y="-12"
                    width={region.name.length * 7.5 + 24}
                    height="20"
                    rx="4"
                    fill={isSelected ? "#15191B" : "#0B0D0E"}
                    fillOpacity="0.9"
                    stroke={isSelected ? "#E5A93C" : isHovered ? "#3B4348" : "#262C30"}
                    strokeWidth="1"
                    className="transition-all duration-200"
                  />
                  <text
                    x="4"
                    y="2"
                    fill={isSelected ? "#E5A93C" : isHovered ? "#F5F2EA" : "#A9AFB1"}
                    fontSize="11"
                    fontWeight={isSelected ? "700" : "500"}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="transition-colors duration-150"
                  >
                    {region.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
