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

  // Elevation transformation styles
  let transformStyle = "";
  let elevationShadowClass = "";

  if (!isReducedMotion) {
    if (isPeak) {
      transformStyle = "translate(0, -16px) scale(1.08)";
      elevationShadowClass =
        "drop-shadow-[0_24px_28px_rgba(0,0,0,0.95)] drop-shadow-[0_0_20px_rgba(229,169,60,0.55)]";
    } else if (isRising) {
      transformStyle = "translate(0, -10px) scale(1.04)";
      elevationShadowClass =
        "drop-shadow-[0_16px_20px_rgba(0,0,0,0.8)] drop-shadow-[0_0_12px_rgba(229,169,60,0.35)]";
    } else if (isPressed) {
      transformStyle = "translate(0, 2px) scale(0.98)";
    } else if (isDescending) {
      transformStyle = "translate(0, 0px) scale(1)";
    } else if (isHovered && !isOtherSelected) {
      transformStyle = "translate(0, -3px) scale(1.02)";
      elevationShadowClass = "drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]";
    }
  }

  // Zone accent palette for regional identity
  const zoneColors = {
    East: "group-hover:fill-[#1F262B]",
    North: "group-hover:fill-[#1E252A]",
    South: "group-hover:fill-[#1D272A]",
    West: "group-hover:fill-[#252422]",
    Northeast: "group-hover:fill-[#1F2724]",
    Central: "group-hover:fill-[#242426]",
  };

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
        "cursor-pointer group select-none transition-all duration-300 outline-none",
        isOtherSelected &&
          "opacity-25 blur-[0.3px] pointer-events-none transition-opacity duration-500",
        isSelected && "z-30 pointer-events-auto",
      )}
    >
      {/* 3D Physical Extrusion Layer (renders underneath when rising to create slab depth) */}
      {(isRising || isPeak) && region.svgPath && !isReducedMotion && (
        <path
          d={region.svgPath}
          transform="translate(0, 8)"
          fill="#060708"
          stroke="#101314"
          strokeWidth="2"
          className="opacity-90 transition-transform duration-500 ease-out"
          style={{
            transform: transformStyle,
            transformOrigin: `${x}px ${y}px`,
          }}
        />
      )}

      {/* Main Vector Terrain Polygon */}
      {region.svgPath ? (
        <path
          d={region.svgPath}
          fill={isSelected ? "#202528" : isHovered ? "#1B2023" : "#15191B"}
          stroke={isSelected ? "#E5A93C" : isHovered ? "#E5A93C" : "#262C30"}
          strokeWidth={isSelected ? "2.5" : isHovered ? "1.8" : "1.2"}
          strokeLinejoin="round"
          strokeLinecap="round"
          className={cn(
            "transition-all duration-400 ease-out",
            zoneColors[region.zone],
            elevationShadowClass,
          )}
          style={{
            transform: transformStyle,
            transformOrigin: `${x}px ${y}px`,
          }}
        />
      ) : null}

      {/* Regional Anchor Beacon & Physical Elevation Center Marker */}
      <g
        style={{
          transform: transformStyle,
          transformOrigin: `${x}px ${y}px`,
        }}
        className="transition-transform duration-400 ease-out"
      >
        {/* Pulsing geographic anchor ring when active */}
        {isSelected && !isReducedMotion && (
          <circle
            cx={x}
            cy={y}
            r="26"
            fill="none"
            stroke="#E5A93C"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            className="animate-ping"
          />
        )}

        {/* Halo Glow */}
        {(isHovered || isSelected) && (
          <circle
            cx={x}
            cy={y}
            r="18"
            fill="#E5A93C"
            fillOpacity={isSelected ? 0.35 : 0.15}
            className="transition-all duration-300"
          />
        )}

        {/* Tactile Pinpoint Center */}
        <circle
          cx={x}
          cy={y}
          r={isSelected ? "8" : isHovered ? "6" : "4.5"}
          fill={isSelected ? "#E5A93C" : isHovered ? "#F5F2EA" : "#202528"}
          stroke={isSelected ? "#0B0D0E" : isHovered ? "#E5A93C" : "#A9AFB1"}
          strokeWidth={isSelected ? "2.5" : "1.5"}
          className="transition-all duration-200"
        />

        {/* Region Badge Label */}
        <g transform={`translate(${x + 10}, ${y - 8})`} className="pointer-events-none">
          <rect
            x="-4"
            y="-12"
            width={region.name.length * 7.4 + 26}
            height="22"
            rx="5"
            fill={isSelected ? "#0B0D0E" : isHovered ? "#15191B" : "#0B0D0E"}
            fillOpacity={isSelected ? 0.95 : 0.88}
            stroke={isSelected ? "#E5A93C" : isHovered ? "#E5A93C" : "#262C30"}
            strokeWidth={isSelected ? "1.5" : "1"}
            className="transition-all duration-200"
          />
          <text
            x="4"
            y="3"
            fill={isSelected ? "#E5A93C" : isHovered ? "#F5F2EA" : "#A9AFB1"}
            fontSize="10.5"
            fontWeight={isSelected ? "700" : isHovered ? "600" : "500"}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            letterSpacing="0.02em"
            className="transition-colors duration-200"
          >
            {region.name}
          </text>
        </g>
      </g>
    </g>
  );
};
