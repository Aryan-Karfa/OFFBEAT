import React from "react";
import { Link } from "react-router-dom";
import type { TimeContext } from "../../types/taste";
import { getTravelTasteBySlug, getExperienceTasteBySlug } from "../../features/taste/tasteUtils";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MapPin, Compass, Sparkles, Sun, Moon, RotateCcw, Edit3 } from "lucide-react";

interface TasteSummaryProps {
  countryName: string;
  regionName: string;
  travelTastes: string[];
  experienceTastes: string[];
  timeContext: TimeContext | null;
  onReset: () => void;
  compact?: boolean;
}

export const TasteSummary: React.FC<TasteSummaryProps> = ({
  countryName,
  regionName,
  travelTastes,
  experienceTastes,
  timeContext,
  onReset,
  compact = false,
}) => {
  return (
    <Card
      variant="elevated"
      padding={compact ? "sm" : "md"}
      className="border-offbeat-accent/30 bg-gradient-to-br from-offbeat-surface via-offbeat-elevated to-offbeat-dark shadow-elevated"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-offbeat-border/70">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-offbeat-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-offbeat-primary">
            Traveler Intent Context
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="h-3 w-3" />}
          className="text-[11px] text-offbeat-muted hover:text-offbeat-accent h-7 px-2"
        >
          Reset
        </Button>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* 1. Geographic Context */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-offbeat-secondary font-medium">
            <MapPin className="h-3.5 w-3.5 text-offbeat-accent shrink-0" />
            <span>Region:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-offbeat-primary uppercase tracking-wide">
              {regionName || "India"}
            </span>
            <span className="text-[10px] text-offbeat-muted">({countryName})</span>
            <Link
              to="/country/india/map"
              className="text-offbeat-muted hover:text-offbeat-accent p-0.5 rounded"
              title="Change Region on Map"
            >
              <Edit3 className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 2. Travel Taste Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-offbeat-secondary">
            <div className="flex items-center gap-1.5 font-medium">
              <Compass className="h-3.5 w-3.5 text-offbeat-accent shrink-0" />
              <span>Travel Taste ({travelTastes.length}):</span>
            </div>
            <Link
              to="/travel-taste"
              className="text-offbeat-muted hover:text-offbeat-accent p-0.5 rounded text-[10px] flex items-center gap-1"
            >
              <span>Edit</span>
              <Edit3 className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-1">
            {travelTastes.length > 0 ? (
              travelTastes.map((slug) => {
                const item = getTravelTasteBySlug(slug);
                return (
                  <Badge key={slug} variant="accent" size="sm" className="gap-1 text-[11px] py-0.5">
                    <span>{item?.icon}</span>
                    <span>{item?.name || slug}</span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-[11px] text-offbeat-muted italic">None selected yet</span>
            )}
          </div>
        </div>

        {/* 3. Experience Nuances */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-offbeat-secondary">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-offbeat-accent shrink-0" />
              <span>Experience Taste ({experienceTastes.length}):</span>
            </div>
            <Link
              to="/experience-taste"
              className="text-offbeat-muted hover:text-offbeat-accent p-0.5 rounded text-[10px] flex items-center gap-1"
            >
              <span>Edit</span>
              <Edit3 className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-1">
            {experienceTastes.length > 0 ? (
              experienceTastes.map((slug) => {
                const item = getExperienceTasteBySlug(slug);
                return (
                  <Badge key={slug} variant="tag" size="sm" className="text-[11px] py-0.5">
                    <span>{item?.icon}</span>
                    <span>{item?.name || slug}</span>
                  </Badge>
                );
              })
            ) : (
              <span className="text-[11px] text-offbeat-muted italic">None selected yet</span>
            )}
          </div>
        </div>

        {/* 4. Time Context */}
        <div className="flex items-center justify-between pt-2 border-t border-offbeat-border/60">
          <span className="text-offbeat-secondary font-medium">Time Context:</span>
          {timeContext === "day" ? (
            <Badge variant="supported" size="sm" className="gap-1">
              <Sun className="h-3 w-3 text-amber-400" />
              <span>☀ DAY</span>
            </Badge>
          ) : timeContext === "night" ? (
            <Badge variant="accent" size="sm" className="gap-1">
              <Moon className="h-3 w-3 text-indigo-400" />
              <span>🌙 NIGHT</span>
            </Badge>
          ) : (
            <span className="text-[11px] text-offbeat-muted italic">Not specified</span>
          )}
        </div>
      </div>
    </Card>
  );
};
