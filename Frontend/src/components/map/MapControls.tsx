import React from "react";
import { Compass, ZoomIn, ZoomOut, RotateCcw, ArrowLeft } from "lucide-react";
import type { MapInteractionState, Region } from "../../types/geography";

interface MapControlsProps {
  interactionState: MapInteractionState;
  selectedRegion: Region | null;
  hoveredRegion: Region | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onBackToCountry: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  interactionState,
  selectedRegion,
  hoveredRegion,
  onZoomIn,
  onZoomOut,
  onReset,
  onBackToCountry,
}) => {
  const getStatusLabel = () => {
    switch (interactionState) {
      case "pressed":
        return `Selecting ${selectedRegion?.name || "region"}...`;
      case "rising":
        return `${selectedRegion?.name || "Region"} elevating from map...`;
      case "focused":
        return `Camera focusing on ${selectedRegion?.name || "region"}...`;
      case "active":
      case "exploring":
        return `${selectedRegion?.name || "Region"} Active`;
      case "back":
        return "Returning to Country view...";
      case "hover":
        return hoveredRegion ? `Inspect: ${hoveredRegion.name}` : "Interactive Map Surface";
      case "idle":
      default:
        return "Interactive Map Surface";
    }
  };

  const isFocusedOrActive =
    interactionState === "rising" ||
    interactionState === "focused" ||
    interactionState === "active" ||
    interactionState === "exploring";

  return (
    <>
      {/* Top Left: Geographic State Machine Status Pill */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-offbeat-dark/90 backdrop-blur-md border border-offbeat-border text-xs shadow-md">
          <span
            className={`h-2 w-2 rounded-full ${
              isFocusedOrActive
                ? "bg-offbeat-accent animate-ping"
                : interactionState === "hover"
                  ? "bg-confidence-supported"
                  : "bg-offbeat-muted"
            }`}
          />
          <span className="font-medium text-offbeat-primary">{getStatusLabel()}</span>
          <span className="text-[10px] font-mono text-offbeat-muted uppercase">
            [{interactionState}]
          </span>
        </div>

        {/* Back Button pill when a region is selected */}
        {selectedRegion && (
          <button
            type="button"
            onClick={onBackToCountry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-offbeat-surface/95 border border-offbeat-accent/50 text-xs text-offbeat-accent hover:bg-offbeat-elevated hover:border-offbeat-accent transition-all font-semibold shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent"
            aria-label="Return to full country map"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Country View</span>
          </button>
        )}
      </div>

      {/* Top Right: Cartographic Compass Rose */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex flex-col items-center gap-1 p-2.5 rounded-xl bg-offbeat-dark/85 backdrop-blur-md border border-offbeat-border/80 pointer-events-none shadow-md">
        <Compass
          className={`h-5 w-5 text-offbeat-accent ${
            isFocusedOrActive ? "rotate-45" : "animate-[spin_70s_linear_infinite]"
          } transition-transform duration-700`}
        />
        <span className="text-[9px] font-mono tracking-widest text-offbeat-muted uppercase">
          {selectedRegion
            ? `${selectedRegion.coordinates.lat.toFixed(1)}°N ${selectedRegion.coordinates.lng.toFixed(1)}°E`
            : "22°N 79°E"}
        </span>
      </div>

      {/* Bottom Right: Zoom and View Adjustment Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 p-1 rounded-xl bg-offbeat-dark/90 backdrop-blur-md border border-offbeat-border/80 shadow-md">
        <button
          type="button"
          aria-label="Zoom in on map"
          onClick={onZoomIn}
          className="p-2 rounded-lg text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out on map"
          onClick={onZoomOut}
          className="p-2 rounded-lg text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Reset map view"
          onClick={onReset}
          className="p-2 rounded-lg text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </>
  );
};
