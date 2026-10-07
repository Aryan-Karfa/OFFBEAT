import React from "react";
import type { TakeHomeCategory, TakeHomeGoodFor } from "@offbeat/shared";
import {
  Coffee,
  Utensils,
  Scissors,
  Sparkles,
  Palette,
  Flame,
  Candy,
  HeartPulse,
  Package,
  CheckCircle2,
} from "lucide-react";

interface TakeHomeCategoryStripProps {
  selectedCategory: TakeHomeCategory | "ALL";
  onSelectCategory: (category: TakeHomeCategory | "ALL") => void;
  selectedGiftFor: TakeHomeGoodFor | null;
  onSelectGiftFor: (giftFor: TakeHomeGoodFor | null) => void;
  verifiedOnly: boolean;
  onToggleVerifiedOnly: (verifiedOnly: boolean) => void;
}

const CATEGORIES: Array<{ key: TakeHomeCategory | "ALL"; label: string; icon: React.ReactNode }> = [
  { key: "ALL", label: "All Finds", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { key: "TEA_COFFEE", label: "Tea & Coffee", icon: <Coffee className="w-3.5 h-3.5" /> },
  { key: "FOOD", label: "Local Food", icon: <Utensils className="w-3.5 h-3.5" /> },
  { key: "HANDICRAFT", label: "Handicrafts", icon: <Scissors className="w-3.5 h-3.5" /> },
  { key: "TEXTILE", label: "Textiles & Weaves", icon: <Package className="w-3.5 h-3.5" /> },
  { key: "ART", label: "Art & Decor", icon: <Palette className="w-3.5 h-3.5" /> },
  { key: "SPICES", label: "Spices", icon: <Flame className="w-3.5 h-3.5" /> },
  { key: "SWEETS", label: "Confectionery", icon: <Candy className="w-3.5 h-3.5" /> },
  { key: "BEAUTY_WELLNESS", label: "Wellness", icon: <HeartPulse className="w-3.5 h-3.5" /> },
];

const GIFT_TARGETS: Array<{ key: TakeHomeGoodFor | "ALL"; label: string }> = [
  { key: "ALL", label: "Anyone" },
  { key: "PERSONAL", label: "For Myself" },
  { key: "GIFT", label: "Gift" },
  { key: "FAMILY", label: "Family" },
  { key: "FRIENDS", label: "Friends" },
  { key: "COLLECTOR", label: "Collector" },
];

export const TakeHomeCategoryStrip: React.FC<TakeHomeCategoryStripProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedGiftFor,
  onSelectGiftFor,
  verifiedOnly,
  onToggleVerifiedOnly,
}) => {
  return (
    <div className="mb-8 space-y-4">
      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-[1.02]"
                  : "bg-offbeat-surface hover:bg-offbeat-surface-hover text-offbeat-secondary border border-offbeat-border hover:border-offbeat-secondary/40"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shopping Context & Verified Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-offbeat-surface/60 border border-offbeat-border/60">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-offbeat-muted font-medium pr-1">Shopping for:</span>
          {GIFT_TARGETS.map((target) => {
            const isSelected =
              target.key === "ALL" ? selectedGiftFor === null : selectedGiftFor === target.key;
            return (
              <button
                key={target.key}
                onClick={() =>
                  onSelectGiftFor(target.key === "ALL" ? null : (target.key as TakeHomeGoodFor))
                }
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-offbeat-secondary hover:text-offbeat-text hover:bg-offbeat-surface-hover border border-transparent"
                }`}
              >
                {target.label}
              </button>
            );
          })}
        </div>

        {/* Verified Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-offbeat-secondary hover:text-offbeat-text select-none">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => onToggleVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-offbeat-border bg-offbeat-surface text-amber-500 focus:ring-0 cursor-pointer"
          />
          <span className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${verifiedOnly ? "text-emerald-400" : "text-offbeat-muted"}`}
            />
            Verified Source Only
          </span>
        </label>
      </div>
    </div>
  );
};
