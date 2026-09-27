import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, MapPin, Compass } from "lucide-react";
import type { Region } from "../../types/geography";
import { useTasteStore } from "../../stores/tasteStore";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Heading } from "../ui/Heading";
import { Text } from "../ui/Text";

interface RegionRevealProps {
  region: Region;
  onBack: () => void;
  isReducedMotion?: boolean;
}

export const RegionReveal: React.FC<RegionRevealProps> = ({
  region,
  onBack,
  isReducedMotion = false,
}) => {
  return (
    <div
      role="region"
      aria-label={`Detailed discovery context for ${region.name}`}
      className={`space-y-6 ${!isReducedMotion ? "animate-[fadeIn_300ms_ease-out]" : ""}`}
    >
      {/* Return to Map Action Banner */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-offbeat-border/70">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="text-xs uppercase tracking-wider font-semibold"
        >
          Return to Country Map
        </Button>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-offbeat-accent">
          <span className="h-2 w-2 rounded-full bg-offbeat-accent animate-ping" />
          <span>FOCUSED REGION ACTIVE</span>
        </div>
      </div>

      {/* Main Region Header Card */}
      <Card
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden border-offbeat-accent/40 bg-gradient-to-br from-offbeat-surface via-offbeat-elevated to-offbeat-dark shadow-elevated"
      >
        <div className="absolute top-0 right-0 h-44 w-44 bg-offbeat-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-accent font-bold">
                {region.code}
              </span>
              <Badge variant="accent" size="sm">
                {region.type === "UNION_TERRITORY" ? "Union Territory" : "State"}
              </Badge>
              <span className="text-xs text-offbeat-muted font-medium">· {region.zone} India</span>
            </div>

            <Badge variant="verified" dot size="sm">
              {region.discoveryCount} Discoveries
            </Badge>
          </div>

          <Heading
            level={2}
            size="display"
            className="text-2xl sm:text-3xl md:text-4xl text-offbeat-primary uppercase tracking-wide mb-2"
          >
            {region.name}
          </Heading>

          <Text variant="lead" className="text-sm sm:text-base text-offbeat-primary/95 italic mb-4">
            &ldquo;{region.tagline}&rdquo;
          </Text>

          <Text
            variant="body"
            className="text-xs sm:text-sm text-offbeat-secondary leading-relaxed mb-5"
          >
            {region.description}
          </Text>

          {/* Local Highlight */}
          <div className="p-3.5 rounded-xl bg-offbeat-dark/70 border border-offbeat-border/80 mb-5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-offbeat-accent mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Signature Highlight</span>
            </div>
            <p className="text-xs text-offbeat-primary/90 leading-normal">{region.highlight}</p>
          </div>

          {/* Tag Badges */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {region.tags.map((tag) => (
              <Badge key={tag} variant="tag" size="sm">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Primary Action Button */}
          <Link
            to="/travel-taste"
            onClick={() => useTasteStore.getState().setActiveRegion("in", region.id)}
            className="block w-full"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-between shadow-glow font-bold tracking-wider"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              LET&apos;S DISCOVER {region.name.toUpperCase()}
            </Button>
          </Link>
        </div>
      </Card>

      {/* REGION -> DESTINATIONS Gateway Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-offbeat-primary">
            <Compass className="h-4 w-4 text-offbeat-accent" />
            <span>Destinations in {region.name}</span>
          </div>
          <span className="text-[11px] font-mono text-offbeat-muted">
            {region.destinations.length} Key Hubs
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {region.destinations.map((dest) => (
            <Card
              key={dest.id}
              variant="interactive"
              padding="sm"
              className="border-offbeat-border/70 hover:border-offbeat-accent/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-offbeat-accent shrink-0" />
                  <span className="font-semibold text-sm text-offbeat-primary">{dest.name}</span>
                </div>
                <Badge variant="outline" size="sm" className="text-[10px]">
                  {dest.type}
                </Badge>
              </div>

              <p className="text-xs text-offbeat-secondary italic mb-2 pl-5.5">{dest.tagline}</p>

              <div className="text-[11px] text-offbeat-muted bg-offbeat-dark/50 p-2 rounded-md border border-offbeat-border/40">
                {dest.highlight}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
