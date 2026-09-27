import React from "react";
import type { Region, MapInteractionState } from "../../types/geography";
import { cn } from "../../utils/cn";

interface MapRegionProps {
  region: Region;
  projectedCoord: { x: number; y: number };
  isSelected: boolean;
  isHovered: boolean;
  isOtherSelected: boolean;
  interactionState: MapInteractionState;
  onSelect: (region: Region) => void;
  onHover: (region: Region | null) => void;
  isReducedMotion: boolean;
}

export const MapRegion: React.FC<MapRegionProps> = ({
  region,
  projectedCoord,
  isSelected,
  isHovered,
  isOtherSelected,
  interactionState,
  onSelect,
  onHover,
  isReducedMotion,
}) => {
  const { x, y } = projectedCoord;

  // Determine active visual phase based on explicit interaction state
  const isRising = isSelected && interactionState === "rising";
  const isPeak =
    isSelected &&
    (interactionState === "focused" ||
      interactionState === "active" ||
      interactionState === "exploring");
  const isPressed = isSelected && interactionState === "pressed";
  const isDescending = isSelected && interactionState === "back";

  // Elevation transformation: subtle elevation lift without disruptive scale distortion
  let transformStyle = "";
  let elevationShadowClass = "";

  if (!isReducedMotion) {
    if (isPeak) {
      transformStyle = "translate(0, -8px)";
      elevationShadowClass =
        "drop-shadow-[0_16px_20px_rgba(0,0,0,0.92)] drop-shadow-[0_0_14px_rgba(229,169,60,0.45)]";
    } else if (isRising) {
      transformStyle = "translate(0, -5px)";
      elevationShadowClass =
        "drop-shadow-[0_10px_14px_rgba(0,0,0,0.8)] drop-shadow-[0_0_8px_rgba(229,169,60,0.3)]";
    } else if (isPressed) {
      transformStyle = "translate(0, 1px)";
    } else if (isDescending) {
      transformStyle = "translate(0, 0px)";
    } else if (isHovered && !isOtherSelected) {
      transformStyle = "translate(0, -2px)";
      elevationShadowClass = "drop-shadow-[0_6px_10px_rgba(0,0,0,0.7)]";
    }
  }

  // Zone accent palette for regional identity
  const zoneHoverColors = {
    East: "group-hover:fill-[#1A2227]",
    North: "group-hover:fill-[#1C2329]",
    South: "group-hover:fill-[#192428]",
    West: "group-hover:fill-[#222321]",
    Northeast: "group-hover:fill-[#1A2522]",
    Central: "group-hover:fill-[#202225]",
  };

  const isSmall = Boolean(region.isSmallTerritory);

  return (
    <g
      id={`region-${region.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${region.name}, ${region.type === "UNION_TERRITORY" ? "Union Territory" : "State"} in ${region.zone} India. ${region.discoveryCount} community discoveries.`}
      aria-pressed={isSelected}
      aria-expanded={
        isSelected && (interactionState === "active" || interactionState === "exploring")
      }
      onClick={() => onSelect(region)}
      onMouseEnter={() => onHover(region)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(region)}
      onBlur={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(region);
        }
      }}
      className={cn(
        "cursor-pointer group select-none outline-none transition-all duration-300",
        isOtherSelected &&
          "opacity-30 blur-[0.2px] pointer-events-none transition-opacity duration-500",
        isSelected && "z-40 pointer-events-auto",
      )}
    >
      {/* 3D Physical Extrusion Layer (renders underneath when rising to create slab depth) */}
      {(isRising || isPeak) && region.svgPath && !isReducedMotion && (
        <path
          d={region.svgPath}
          transform="translate(0, 5)"
          fill="#060708"
          stroke="#101314"
          strokeWidth="1.5"
          className="opacity-95 transition-transform duration-400 ease-out"
          style={{ transform: transformStyle }}
        />
      )}

      {/* Main Accurate Geographic Polygon */}
      {region.svgPath && (
        <path
          d={region.svgPath}
          fill={isSelected ? "#202528" : isHovered ? "#1B2023" : "#15191B"}
          stroke={isSelected ? "#E5A93C" : isHovered ? "#E5A93C" : "#262C30"}
          strokeWidth={isSelected ? "2.2" : isHovered ? "1.6" : "0.9"}
          strokeLinejoin="round"
          strokeLinecap="round"
          className={cn(
            "transition-all duration-300 ease-out",
            zoneHoverColors[region.zone],
            elevationShadowClass,
          )}
          style={{ transform: transformStyle }}
        />
      )}

      {/* Small Territory Indicator Ring (Prevents tiny territories like Delhi, Chandigarh, Puducherry from disappearing) */}
      {isSmall && (
        <g
          style={{ transform: transformStyle }}
          className="transition-transform duration-300 pointer-events-none"
        >
          {/* Subtle pulsating halo for small territory discoverability */}
          <circle
            cx={x}
            cy={y}
            r={isSelected ? "14" : isHovered ? "12" : "9"}
            fill="#E5A93C"
            fillOpacity={isSelected ? 0.35 : isHovered ? 0.25 : 0.12}
            stroke="#E5A93C"
            strokeWidth={isSelected ? "1.5" : "1"}
            strokeDasharray={isSelected ? "none" : "2 2"}
            className={!isReducedMotion && isSelected ? "animate-pulse" : ""}
          />
          <circle
            cx={x}
            cy={y}
            r={isSelected ? "5" : isHovered ? "4" : "3"}
            fill={isSelected ? "#E5A93C" : isHovered ? "#F5F2EA" : "#E5A93C"}
          />
        </g>
      )}

      {/* Interactive Hover / Selected Pinpoint & Editorial Badge */}
      {(isHovered || isSelected) && (
        <g
          style={{ transform: transformStyle }}
          className="transition-transform duration-300 pointer-events-none"
        >
          {/* Tactical Beacon Dot */}
          <circle
            cx={x}
            cy={y}
            r={isSelected ? "6" : "4.5"}
            fill={isSelected ? "#E5A93C" : "#F5F2EA"}
            stroke="#0B0D0E"
            strokeWidth="1.5"
            className="shadow-sm"
          />

          {/* Clean Floating Badge Card */}
          <g
            transform={`translate(${x > 620 ? x - region.name.length * 7.5 - 34 : x + 10}, ${
              y < 60 ? y + 20 : y - 10
            })`}
          >
            <rect
              x="0"
              y="-14"
              width={region.name.length * 7.2 + 28}
              height="26"
              rx="6"
              fill="#0B0D0E"
              fillOpacity="0.95"
              stroke={isSelected ? "#E5A93C" : "#3B4247"}
              strokeWidth={isSelected ? "1.5" : "1"}
              className="drop-shadow-lg"
            />
            <text
              x="8"
              y="3"
              fill={isSelected ? "#E5A93C" : "#F5F2EA"}
              fontSize="11"
              fontWeight={isSelected ? "700" : "600"}
              fontFamily="'Plus Jakarta Sans', sans-serif"
              letterSpacing="0.02em"
            >
              {region.name}
            </text>
          </g>
        </g>
      )}
    </g>
  );
};
