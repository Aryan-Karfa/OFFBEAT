import React, { useEffect, useState, useRef, useId } from "react";
import type { Region, MapInteractionState } from "../../types/geography";
import { INDIA_REGIONS } from "../../features/geography/data";
import {
  MAP_VIEWBOX,
  calculateRegionCamera,
  getRegionCoordinates,
} from "../../features/geography/projection";
import { MapRegion } from "./MapRegion";
import { MapControls } from "./MapControls";

interface InteractiveMapFoundationProps {
  selectedRegion: Region | null;
  hoveredRegion: Region | null;
  interactionState: MapInteractionState;
  onSelectRegion: (region: Region) => void;
  onHoverRegion: (region: Region | null) => void;
  onBackToCountry: () => void;
}

export const InteractiveMapFoundation: React.FC<InteractiveMapFoundationProps> = ({
  selectedRegion,
  hoveredRegion,
  interactionState,
  onSelectRegion,
  onHoverRegion,
  onBackToCountry,
}) => {
  const [manualZoom, setManualZoom] = useState<number>(1);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = useId();

  // Detect user prefers-reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Global keyboard listener for Escape key (to return to country view)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedRegion) {
        e.preventDefault();
        onBackToCountry();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRegion, onBackToCountry]);

  // Dynamic Camera calculation based on the actual geometry bounding box
  const isCameraFocused =
    selectedRegion &&
    (interactionState === "focused" ||
      interactionState === "active" ||
      interactionState === "exploring");

  const camera =
    isCameraFocused && selectedRegion
      ? calculateRegionCamera(selectedRegion, manualZoom)
      : {
          translateX: 0,
          translateY: 0,
          scale: manualZoom,
          transform: `scale(${manualZoom})`,
        };

  // Reset zoom on unmount or selection cancel
  const handleResetZoom = () => {
    setManualZoom(1);
    if (selectedRegion) {
      onBackToCountry();
    }
  };

  const handleZoomIn = () => {
    setManualZoom((prev) => Math.min(prev + 0.3, 2.5));
  };

  const handleZoomOut = () => {
    setManualZoom((prev) => Math.max(prev - 0.3, 0.7));
  };

  // Ensure selectedRegion renders on top of neighboring regions
  const sortedRegions = [...INDIA_REGIONS].sort((a, b) => {
    if (a.id === selectedRegion?.id) return 1;
    if (b.id === selectedRegion?.id) return -1;
    if (a.id === hoveredRegion?.id) return 1;
    if (b.id === hoveredRegion?.id) return -1;
    return 0;
  });

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive Map of India with 28 States and 8 Union Territories"
      className="relative w-full aspect-[800/920] max-h-[820px] rounded-2xl bg-offbeat-dark border border-offbeat-border/80 overflow-hidden shadow-elevated flex items-center justify-center p-2 sm:p-4 select-none"
    >
      {/* Subtle cartographic grid background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#262C30_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Cartographic Title & Scale Metadata Pill */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-offbeat-surface/90 border border-offbeat-border text-[11px] font-mono text-offbeat-accent tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-offbeat-accent animate-pulse" />
          <span>SURVEY OF INDIA REFERENCE · 36 ADMINISTRATIVE UNITS</span>
        </div>
        <span className="text-[10px] font-mono text-offbeat-muted/70 pl-1">
          Lambert Conformal Conic · 12°N - 32°N Standard Parallels
        </span>
      </div>

      {/* Floating Tactical Zoom Controls */}
      <MapControls
        interactionState={interactionState}
        selectedRegion={selectedRegion}
        hoveredRegion={hoveredRegion}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
        onBackToCountry={onBackToCountry}
      />

      {/* Main SVG Vector Surface */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={MAP_VIEWBOX.viewBox}
          className="w-full h-full max-h-[920px] object-contain overflow-visible"
          role="img"
          aria-label="Accurate Vector Cartography of India"
        >
          <defs>
            <radialGradient id={`glow-${gradientId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.10" />
              <stop offset="60%" stopColor="#15191B" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#0B0D0E" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Camera Pan & Zoom Transform Layer */}
          <g
            style={{
              transform: isReducedMotion ? `scale(${manualZoom})` : camera.transform,
              transformOrigin: isCameraFocused ? "0 0" : "400px 460px",
            }}
            className={
              isReducedMotion
                ? ""
                : "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            }
          >
            {/* Subtle Cartographic Coordinate Parallels and Meridians */}
            <g
              className={
                selectedRegion
                  ? "opacity-10 transition-opacity duration-500"
                  : "opacity-30 transition-opacity duration-300"
              }
            >
              <line
                x1="80"
                y1="190"
                x2="720"
                y2="190"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="725" y="194" fill="#757D82" fontSize="9" fontFamily="monospace">
                28°N
              </text>

              <line
                x1="60"
                y1="430"
                x2="720"
                y2="430"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="725" y="434" fill="#757D82" fontSize="9" fontFamily="monospace">
                20°N
              </text>

              <line
                x1="120"
                y1="670"
                x2="680"
                y2="670"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="685" y="674" fill="#757D82" fontSize="9" fontFamily="monospace">
                12°N
              </text>

              <line
                x1="260"
                y1="80"
                x2="260"
                y2="820"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="250" y="835" fill="#757D82" fontSize="9" fontFamily="monospace">
                74°E
              </text>

              <line
                x1="520"
                y1="80"
                x2="520"
                y2="820"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="510" y="835" fill="#757D82" fontSize="9" fontFamily="monospace">
                84°E
              </text>
            </g>

            {/* Individual Accurate Geographic Regions */}
            {sortedRegions.map((region) => {
              const coords = getRegionCoordinates(region);
              const isSelected = selectedRegion?.id === region.id;
              const isHovered = hoveredRegion?.id === region.id;
              const isOtherSelected = !!selectedRegion && !isSelected;

              return (
                <MapRegion
                  key={region.id}
                  region={region}
                  projectedCoord={coords}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isOtherSelected={isOtherSelected}
                  interactionState={interactionState}
                  onSelect={onSelectRegion}
                  onHover={onHoverRegion}
                  isReducedMotion={isReducedMotion}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Keyboard Accessibility Hint Banner */}
      <div className="absolute bottom-3 left-3 sm:left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-offbeat-muted/80 bg-offbeat-surface/80 px-2.5 py-1 rounded-md border border-offbeat-border/50 backdrop-blur-sm">
        <kbd className="px-1 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-primary text-[10px]">
          Tab
        </kbd>
        <span>to browse</span>
        <kbd className="px-1 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-primary text-[10px]">
          Enter
        </kbd>
        <span>to elevate</span>
        <kbd className="px-1 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-primary text-[10px]">
          Esc
        </kbd>
        <span>to restore</span>
      </div>
    </div>
  );
};
