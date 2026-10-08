import React, { useState } from "react";
import { Search, MapPin, ArrowRight, Compass } from "lucide-react";
import type { Region } from "../../types/geography";
import { INDIA_REGIONS } from "../../features/geography/data";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Heading } from "../ui/Heading";
import { Text } from "../ui/Text";
import { cn } from "../../utils/cn";

interface RegionListFallbackProps {
  selectedRegion: Region | null;
  onSelectRegion: (region: Region) => void;
}

export const RegionListFallback: React.FC<RegionListFallbackProps> = ({
  selectedRegion,
  onSelectRegion,
}) => {
  const [filterZone, setFilterZone] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const zones = ["All", "North", "South", "East", "West", "Northeast", "Central"];

  const filteredRegions = INDIA_REGIONS.filter((region) => {
    const matchesZone = filterZone === "All" || region.zone === filterZone;
    const matchesSearch =
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      region.destinations.some((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesZone && matchesSearch;
  });

  const filteredStates = filteredRegions.filter((r) => r.type === "STATE");
  const filteredUTs = filteredRegions.filter((r) => r.type === "UNION_TERRITORY");

  const renderRegionCard = (region: Region) => {
    const isSelected = selectedRegion?.id === region.id;
    return (
      <Card
        key={region.id}
        variant="interactive"
        padding="md"
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        onClick={() => onSelectRegion(region)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectRegion(region);
          }
        }}
        className={cn(
          "relative transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offbeat-accent focus-visible:outline-none",
          isSelected && "border-offbeat-accent bg-offbeat-elevated shadow-glow",
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <MapPin
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isSelected
                  ? "text-offbeat-accent"
                  : "text-offbeat-muted group-hover:text-offbeat-accent",
              )}
            />
            <Heading level={4} size="h4" className="text-base font-bold text-offbeat-primary">
              {region.name}
            </Heading>
          </div>
          <Badge variant={isSelected ? "accent" : "tag"} size="sm">
            {region.zone} · {region.discoveryCount} discoveries
          </Badge>
        </div>

        <Text variant="muted" className="text-xs mb-3 line-clamp-2">
          {region.tagline}
        </Text>

        {/* Destination Hubs Chips */}
        <div className="flex items-center gap-1.5 text-[11px] text-offbeat-secondary mb-3">
          <Compass className="h-3.5 w-3.5 text-offbeat-accent shrink-0" />
          <span className="truncate">{region.destinations.map((d) => d.name).join(" · ")}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {region.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-offbeat-border/50 text-xs">
          <span className="text-offbeat-muted italic truncate max-w-[200px]">
            {region.highlight}
          </span>
          <span className="text-offbeat-accent font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Explore <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Zone Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-offbeat-muted" />
          <input
            type="search"
            aria-label="Filter regions"
            placeholder="Search state, territory, or landscape..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-offbeat-surface border border-offbeat-border text-sm text-offbeat-primary placeholder:text-offbeat-muted focus:border-offbeat-accent focus:outline-none focus:ring-1 focus:ring-offbeat-accent transition-colors"
          />
        </div>

        {/* Zone Filters */}
        <div
          role="radiogroup"
          aria-label="Filter by geographic zone"
          className="flex flex-wrap gap-1"
        >
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              role="radio"
              aria-checked={filterZone === zone}
              onClick={() => setFilterZone(zone)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
                filterZone === zone
                  ? "bg-offbeat-accent text-offbeat-dark font-semibold shadow-sm"
                  : "bg-offbeat-surface text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-elevated",
              )}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* 28 States Section */}
      {filteredStates.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-offbeat-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-offbeat-accent flex items-center gap-2">
              <span>States</span>
              <span className="px-2 py-0.5 rounded-full bg-offbeat-surface text-offbeat-muted text-[10px] font-mono">
                {filteredStates.length}
              </span>
            </h3>
            <span className="text-[10px] font-mono text-offbeat-muted/70">Click to elevate</span>
          </div>
          <div
            role="region"
            aria-label="List of Indian states"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredStates.map(renderRegionCard)}
          </div>
        </section>
      )}

      {/* 8 Union Territories Section */}
      {filteredUTs.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-offbeat-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-offbeat-accent flex items-center gap-2">
              <span>Union Territories</span>
              <span className="px-2 py-0.5 rounded-full bg-offbeat-surface text-offbeat-muted text-[10px] font-mono">
                {filteredUTs.length}
              </span>
            </h3>
            <span className="text-[10px] font-mono text-offbeat-muted/70">Click to elevate</span>
          </div>
          <div
            role="region"
            aria-label="List of Indian union territories"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredUTs.map(renderRegionCard)}
          </div>
        </section>
      )}

      {filteredRegions.length === 0 && (
        <Card variant="flat" padding="lg" className="text-center py-12">
          <Text variant="body" className="text-offbeat-secondary mb-2">
            No regions match your search criteria.
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterZone("All");
              setSearchTerm("");
            }}
          >
            Reset Filters
          </Button>
        </Card>
      )}
    </div>
  );
};
