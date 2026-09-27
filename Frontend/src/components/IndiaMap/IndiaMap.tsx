import React, { useState } from "react";
import India from "@svg-maps/india";

export interface StateLocation {
  id: string;
  name: string;
  path: string;
}

export interface IndiaMapProps {
  selectedStateId?: string | null;
  onSelectState?: (state: StateLocation) => void;
  className?: string;
}

// Regional highlights and exploration vibes for states
const STATE_INSIGHTS: Record<
  string,
  { zone: string; vibe: string; highlight: string; terrain: string }
> = {
  jk: { zone: "Northern Himalayas", vibe: "High-Altitude Isolation", highlight: "Zanskar Valley & Hemis Monasteries", terrain: "Rugged Alpine & Glaciers" },
  la: { zone: "Northern Himalayas", vibe: "Cold Desert Mysticism", highlight: "Nubra Valley & Pangong Tso Backroads", terrain: "High Plateau" },
  hp: { zone: "Western Himalayas", vibe: "Hidden Alpine Valleys", highlight: "Spiti Valley & Tirthan Trout Streams", terrain: "Coniferous Forests & Gorges" },
  pb: { zone: "Northern Plains", vibe: "Heritage Agriculture", highlight: "Rural Farmsteads & Harike Wetland", terrain: "Fertile Alluvial Plains" },
  ut: { zone: "Central Himalayas", vibe: "Sacred High Trails", highlight: "Valley of Flowers & Chopta Meadows", terrain: "Glacial Peaks & Forest Corridors" },
  hr: { zone: "Northern Plains", vibe: "Ancient Mound Settlements", highlight: "Rakhigarhi Archaeological Sites", terrain: "Plains & Sand Dunes" },
  dl: { zone: "Capital Territory", vibe: "Layered Heritage & Baolis", highlight: "Agrasen ki Baoli & Nizamuddin Alleys", terrain: "Urban Historical Ridge" },
  rj: { zone: "Western Arid", vibe: "Desert Fortresses & Stepwells", highlight: "Bundi Hidden Frescoes & Thar Caravans", terrain: "Arid Desert & Aravalli Ranges" },
  up: { zone: "Northern Heartland", vibe: "Ancient River Heritage", highlight: "Chunar Sandstone Citadel & Dudhwa Reserve", terrain: "Gangetic Plain" },
  br: { zone: "Eastern Plains", vibe: "Monastic Antiquity", highlight: "Nalanda Ancient Ruins & Barabar Caves", terrain: "River Basin" },
  sk: { zone: "Eastern Himalayas", vibe: "Sacred Mountain Passes", highlight: "Yuksom Trailheads & Gurudongmar", terrain: "Alpine Ridges & Rhododendron Forests" },
  ar: { zone: "Far North-East", vibe: "Untamed Rainforests & Monasteries", highlight: "Tawang High Pass & Ziro Pine Valleys", terrain: "Eastern Himalayan Cloud Forests" },
  nl: { zone: "North-East Hills", vibe: "Tribal Ridge Settlements", highlight: "Dzukou Valley & Khonoma Green Village", terrain: "Dense Mountain Ranges" },
  mn: { zone: "North-East Hills", vibe: "Floating Wetland Sanctuaries", highlight: "Loktak Lake & Phumdi Ecosystems", terrain: "Oval Valley & Lush Hills" },
  mz: { zone: "Southern North-East", vibe: "Bamboo Misty Ridges", highlight: "Blue Mountain (Phawngpui) & Reiek Cliff", terrain: "Rolling Evergreen Valleys" },
  tr: { zone: "North-East Border", vibe: "Rock-Cut Bas-Reliefs", highlight: "Unakoti Stone Sculptures & Neermahal", terrain: "Low Hills & Valleys" },
  ml: { zone: "North-East Plateau", vibe: "Living Root Architecture", highlight: "Mawlynnong Living Bridges & Wei Sawdong Falls", terrain: "Rainforest Plateau & Deep Canyons" },
  as: { zone: "Brahmaputra Basin", vibe: "River Island Sanctuaries", highlight: "Majuli Cultural Island & Kaziranga Grasslands", terrain: "Riverine Valley & Tea Terraces" },
  wb: { zone: "Eastern Delta & Hills", vibe: "Mangrove Labyrinths to Tea Valleys", highlight: "Sundarbans Estuary & Kurseong Backroads", terrain: "Delta to Himalayan Slopes" },
  jh: { zone: "Chota Nagpur Plateau", vibe: "Ancient Waterfalls & Sacred Groves", highlight: "Netarhat Sunsets & Betla Canopy", terrain: "Plateau & Deciduous Forests" },
  or: { zone: "Eastern Coast", vibe: "Maritime Ruins & Artisan Villages", highlight: "Chilika Coastal Backwaters & Raghurajpur", terrain: "Eastern Ghats & Marine Lagoons" },
  ct: { zone: "Central Tribal Heartland", vibe: "Wilderness Cascades & Limestone Caverns", highlight: "Chitrakote Horseshoe Falls & Bastar Forests", terrain: "Dense Forests & Plateau" },
  mp: { zone: "Central Highlands", vibe: "Ravine Sanctuaries & Rock Shelters", highlight: "Bhimbetka Prehistoric Caves & Orchha Palaces", terrain: "Vindhya & Satpura Hills" },
  gj: { zone: "Western Coast & Salt Flats", vibe: "White Desert & Marine Architecture", highlight: "Little Rann Wild Ass Reserve & Mandvi Docks", terrain: "Salt Marsh & Coastal Plains" },
  mh: { zone: "Western Ghats & Deccan", vibe: "Cliffside Forts & Basalt Caverns", highlight: "Harishchandragad Escarpments & Malvan Reefs", terrain: "Volcanic Basalt Plateau & Ghats" },
  tg: { zone: "Deccan Plateau", vibe: "Ancient Granite Boulders", highlight: "Bhongir Monolithic Fort & Warangal Gateways", terrain: "Rocky Deccan Semi-Arid" },
  ap: { zone: "Coromandel Coast", vibe: "Canyon Caves & Coastal Estuaries", highlight: "Gandikota Grand Canyon & Belum Caves", terrain: "Eastern Ghats & Coastal Belt" },
  ka: { zone: "South-Western Plateau", vibe: "Coffee Rainforests & Ruined Capitals", highlight: "Chikmagalur Cloud Passes & Hampi Boulders", terrain: "Ghats Shola Forests & Deccan" },
  ga: { zone: "Konkan Coast", vibe: "Estuary Backwaters & Spice Plantations", highlight: "Divar River Island & Netravali Rainforest Pools", terrain: "Konkan Coastal Rainforest" },
  kl: { zone: "Malabar Coast", vibe: "Silent Mountain Ridges & Lagoon Trails", highlight: "Silent Valley Rainforest & Valiyaparamba", terrain: "Western Ghats & Backwaters" },
  tn: { zone: "Southern Peninsula", vibe: "Dravidian Monoliths & Nilgiri Heights", highlight: "Chettinad Heritage Mansions & Valparai Slopes", terrain: "Coastal Plains & Cloud Forests" },
  an: { zone: "Bay of Bengal Archipelago", vibe: "Volcanic Coral Sanctuaries", highlight: "Barren Island Outer Atolls & Neil Sea Caves", terrain: "Tropical Rainforest Islands" },
  ld: { zone: "Arabian Sea Atolls", vibe: "Turquoise Coral Lagoons", highlight: "Kadmat Lagoon Waters & Minicoy Lighthouse", terrain: "Coral Atolls" },
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  selectedStateId = null,
  onSelectState,
  className = "",
}) => {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const locations: StateLocation[] = India.locations || [];

  // Find active location
  const activeLocation = locations.find(
    (loc) => loc.id === (selectedStateId || hoveredStateId)
  );

  const activeInsight = activeLocation
    ? STATE_INSIGHTS[activeLocation.id.toLowerCase()] || {
        zone: "India Territory",
        vibe: "Unique Regional Culture",
        highlight: "Heritage trails & local experiences",
        terrain: "Diverse Topography",
      }
    : null;

  const handleMouseEnter = (loc: StateLocation, e: React.MouseEvent) => {
    setHoveredStateId(loc.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY - 15 });
  };

  const handleMouseLeave = () => {
    setHoveredStateId(null);
    setTooltipPos(null);
  };

  const handleClick = (loc: StateLocation) => {
    if (onSelectState) {
      onSelectState(loc);
    }
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Map Interactive Canvas */}
      <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center p-2 sm:p-6">
        {/* Subtle radial ambient glow behind map */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff5a36]/5 via-orange-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

        <svg
          viewBox={India.viewBox || "0 0 612 696"}
          className="w-full h-auto max-h-[580px] drop-shadow-2xl overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Interactive Map of India"
        >
          {/* Subtle drop shadow filter for lifted states */}
          <defs>
            <filter id="hoverShadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#ff5a36" floodOpacity="0.4" />
            </filter>
            <filter id="launchShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="16" stdDeviation="9" floodColor="#ff5a36" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* Render inactive states first */}
          {locations.map((location) => {
            const isSelected = selectedStateId === location.id;
            const isHovered = hoveredStateId === location.id;

            // Elevated/selected states will be re-rendered on top to avoid clipping
            if (isSelected || isHovered) return null;

            return (
              <path
                key={location.id}
                id={`state-${location.id}`}
                d={location.path}
                fill="#161c28"
                stroke="#2a3449"
                strokeWidth="0.85"
                className="cursor-pointer transition-all duration-200 hover:fill-[#222b3d] outline-none"
                onMouseEnter={(e) => handleMouseEnter(location, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(location)}
                tabIndex={0}
                role="button"
                aria-label={`Select ${location.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClick(location);
                  }
                }}
              />
            );
          })}

          {/* Render hovered or selected states on top for true 3D elevation */}
          {locations.map((location) => {
            const isSelected = selectedStateId === location.id;
            const isHovered = hoveredStateId === location.id && !isSelected;

            if (!isSelected && !isHovered) return null;

            // Hover: subtle physical lift (-5px)
            // Click/Selected: Launch up significantly farther (-16px)
            const transformStyle = isSelected
              ? "translateY(-16px) scale(1.025)"
              : "translateY(-5px) scale(1.015)";

            const filterStyle = isSelected
              ? "url(#launchShadow)"
              : "url(#hoverShadow)";

            return (
              <g
                key={`elevated-${location.id}`}
                style={{
                  transform: transformStyle,
                  transformOrigin: "center center",
                  transition: "transform 0.28s cubic-bezier(0.2, 0.9, 0.2, 1), fill 0.2s",
                }}
              >
                <path
                  id={`state-${location.id}`}
                  d={location.path}
                  fill={isSelected ? "#ff5a36" : "#ff704f"}
                  stroke={isSelected ? "#ffffff" : "#ffa38b"}
                  strokeWidth={isSelected ? "1.6" : "1.2"}
                  filter={filterStyle}
                  className="cursor-pointer outline-none"
                  onMouseEnter={(e) => handleMouseEnter(location, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(location)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Selected ${location.name}`}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredStateId && tooltipPos && (
          <div
            className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-lg bg-[#0d1017]/95 border border-[#ff5a36]/50 text-white text-xs font-medium shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a36] animate-pulse" />
              <span>{locations.find((l) => l.id === hoveredStateId)?.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected State Details Card (Revealed when clicked) */}
      <div className="w-full max-w-xl mt-4 px-4">
        {selectedStateId && activeLocation ? (
          <div className="p-5 rounded-2xl border border-[#ff5a36]/40 bg-gradient-to-r from-[#12161f]/95 to-[#161c28]/95 shadow-2xl backdrop-blur-md transition-all animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2633]">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5a36] shadow-glow-accent" />
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeLocation.name}
                  </h3>
                  <p className="text-xs font-mono text-[#ff5a36]">
                    {activeInsight?.zone}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-[#ff5a36]/15 text-[#ff5a36] border border-[#ff5a36]/30">
                Launched & Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-[#1f2633]">
                <div className="text-slate-400 font-mono text-[10px] uppercase">
                  Offbeat Vibe
                </div>
                <div className="font-semibold text-slate-100 mt-1">
                  {activeInsight?.vibe}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-[#1f2633]">
                <div className="text-slate-400 font-mono text-[10px] uppercase">
                  Top Sanctuary
                </div>
                <div className="font-semibold text-slate-100 mt-1">
                  {activeInsight?.highlight}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Terrain: {activeInsight?.terrain}</span>
              <button
                type="button"
                onClick={() => handleClick(activeLocation)}
                className="text-xs font-semibold text-[#ff5a36] hover:text-[#ff704f] transition-colors"
              >
                Explore {activeLocation.name} →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-[#1f2633] text-center text-xs text-slate-400 bg-[#0d1017]/40">
            <span className="inline-block mr-1 text-[#ff5a36]">✦</span>
            Hover over any Indian state to feel subtle elevation. Click to launch into focus.
          </div>
        )}
      </div>

      {/* Accessible Quick State Selector (Ideal for mobile / keyboard) */}
      <div className="w-full max-w-xl mt-4 px-4 flex items-center justify-center gap-2 overflow-x-auto pb-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase shrink-0">
          Quick Jump:
        </span>
        {["rj", "hp", "mh", "kl", "as", "ar", "sk"].map((code) => {
          const loc = locations.find((l) => l.id === code);
          if (!loc) return null;
          const isSel = selectedStateId === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => handleClick(loc)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                isSel
                  ? "bg-[#ff5a36] text-white font-bold shadow-glow-accent"
                  : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/50"
              }`}
            >
              {loc.name.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
