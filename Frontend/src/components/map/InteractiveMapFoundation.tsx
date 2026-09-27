import React, { useEffect, useState, useRef, useId } from "react";
import type { Region, MapInteractionState } from "../../types/geography";
import { INDIA_REGIONS } from "../../features/geography/data";
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

// Normalized coordinate projection for SVG canvas (viewBox 0 0 800 850)
export const projectCoords = (lat: number, lng: number): { x: number; y: number } => {
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

  // Camera calculation:
  // When a region is focused/active/exploring, smoothly pan and zoom to its center
  const isCameraFocused =
    selectedRegion &&
    (interactionState === "focused" ||
      interactionState === "active" ||
      interactionState === "exploring");

  let cameraTransform = `scale(${manualZoom})`;

  if (isCameraFocused && selectedRegion) {
    const coords = projectCoords(selectedRegion.coordinates.lat, selectedRegion.coordinates.lng);

    // Dynamic zoom factor depending on country scale vs regional focus
    const focusZoom = 2.1 * manualZoom;

    if (isReducedMotion) {
      // Immediate transform for reduced motion
      cameraTransform = `translate(${400 - coords.x}px, ${425 - coords.y}px) scale(${focusZoom})`;
    } else {
      cameraTransform = `translate(${400 - coords.x}px, ${425 - coords.y}px) scale(${focusZoom})`;
    }
  }

  const handleZoomIn = () => setManualZoom((z) => Math.min(z + 0.25, 2.2));
  const handleZoomOut = () => setManualZoom((z) => Math.max(z - 0.25, 0.75));
  const handleReset = () => {
    setManualZoom(1);
    if (selectedRegion) {
      onBackToCountry();
    }
  };

  // Announce state transitions for accessibility screen readers
  const getAnnouncement = () => {
    if (!selectedRegion) return "Whole India country map displayed.";
    if (interactionState === "rising") return `${selectedRegion.name} rising from map plane.`;
    if (interactionState === "focused") return `Camera focused on ${selectedRegion.name}.`;
    if (interactionState === "active" || interactionState === "exploring")
      return `${selectedRegion.name} is active. Press Escape to return.`;
    if (interactionState === "back") return "Returning to India country map.";
    return "";
  };

  // Sort regions so the selected region is rendered last (DOM z-index order)
  const sortedRegions = [...INDIA_REGIONS].sort((a, b) => {
    if (a.id === selectedRegion?.id) return 1;
    if (b.id === selectedRegion?.id) return -1;
    return 0;
  });

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive Geographic Discovery Map of India"
      className="relative w-full h-[520px] sm:h-[620px] md:h-[700px] rounded-2xl bg-offbeat-surface/95 border border-offbeat-border overflow-hidden select-none shadow-elevated focus-visible:outline-none"
    >
      {/* Live Region for Screen Readers */}
      <div aria-live="polite" className="sr-only">
        {getAnnouncement()}
      </div>

      {/* Cartographic Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #F5F2EA 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Map Controls & Status Overlay */}
      <MapControls
        interactionState={interactionState}
        selectedRegion={selectedRegion}
        hoveredRegion={hoveredRegion}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onBackToCountry={onBackToCountry}
      />

      {/* Main SVG Vector Surface with Smooth Hardware-Accelerated Camera */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 850"
          className="w-full h-full max-h-[850px] object-contain overflow-visible"
          role="img"
          aria-label="Interactive Vector Geography of India"
        >
          <defs>
            <radialGradient id={`glow-${gradientId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E5A93C" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#15191B" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0B0D0E" stopOpacity="0" />
            </radialGradient>

            <filter id={`softGlow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Camera Focus Wrapper Group */}
          <g
            style={{
              transform: cameraTransform,
              transformOrigin:
                isCameraFocused && selectedRegion
                  ? `${projectCoords(selectedRegion.coordinates.lat, selectedRegion.coordinates.lng).x}px ${
                      projectCoords(selectedRegion.coordinates.lat, selectedRegion.coordinates.lng)
                        .y
                    }px`
                  : "400px 425px",
            }}
            className={
              isReducedMotion
                ? ""
                : "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            }
          >
            {/* Subcontinent Ambient Base Silhouette */}
            <path
              d="M 330 65 L 390 85 L 430 135 L 440 185 L 530 205 L 590 220 L 640 215 L 720 220 L 730 250 L 660 300 L 600 320 L 535 320 L 520 375 L 530 460 L 480 540 L 440 660 L 400 750 L 375 745 L 340 640 L 310 520 L 250 430 L 205 385 L 200 310 L 245 270 L 270 205 L 310 135 Z"
              fill={`url(#glow-${gradientId})`}
              stroke="#202528"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className={
                selectedRegion
                  ? "opacity-20 transition-opacity duration-500"
                  : "opacity-100 transition-opacity duration-300"
              }
            />

            {/* Subtle Latitude & Longitude Coordinate Lines */}
            <g
              className={
                selectedRegion
                  ? "opacity-10 transition-opacity duration-500"
                  : "opacity-25 transition-opacity duration-300"
              }
            >
              <line
                x1="100"
                y1="200"
                x2="720"
                y2="200"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="725" y="204" fill="#757D82" fontSize="9" fontFamily="monospace">
                28°N
              </text>

              <line
                x1="100"
                y1="420"
                x2="720"
                y2="420"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="725" y="424" fill="#757D82" fontSize="9" fontFamily="monospace">
                20°N
              </text>

              <line
                x1="100"
                y1="640"
                x2="720"
                y2="640"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="725" y="644" fill="#757D82" fontSize="9" fontFamily="monospace">
                12°N
              </text>

              <line
                x1="260"
                y1="100"
                x2="260"
                y2="760"
                stroke="#262C30"
                strokeWidth="0.8"
                strokeDasharray="3 3"
              />
              <text x="250" y="775" fill="#757D82" fontSize="9" fontFamily="monospace">
                74°E
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
              <text x="490" y="775" fill="#757D82" fontSize="9" fontFamily="monospace">
                84°E
              </text>
            </g>

            {/* Individual Regions with 3D Elevation and State Transitions */}
            {sortedRegions.map((region) => {
              const coords = projectCoords(region.coordinates.lat, region.coordinates.lng);
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
    </div>
  );
};
