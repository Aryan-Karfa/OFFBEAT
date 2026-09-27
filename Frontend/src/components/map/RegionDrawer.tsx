import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import type { Region } from "../../types/geography";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Heading } from "../ui/Heading";
import { Text } from "../ui/Text";

interface RegionDrawerProps {
  region: Region | null;
  onClose?: () => void;
}

export const RegionDrawer: React.FC<RegionDrawerProps> = ({ region, onClose }) => {
  if (!region) {
    return (
      <Card
        variant="flat"
        padding="md"
        className="border-dashed border-offbeat-border text-center py-8"
      >
        <MapPin className="mx-auto h-8 w-8 text-offbeat-muted/60 mb-3 animate-pulse" />
        <Heading level={4} size="h4" className="text-offbeat-secondary mb-1">
          Select a Region to Explore
        </Heading>
        <Text variant="muted" className="text-xs max-w-xs mx-auto">
          Hover or click on any region on the map surface, or switch to the accessible list view to
          begin discovery.
        </Text>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="relative overflow-hidden border-offbeat-accent/30 bg-gradient-to-br from-offbeat-surface via-offbeat-elevated to-offbeat-surface shadow-elevated"
    >
      <div className="absolute top-0 right-0 h-32 w-32 bg-offbeat-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-offbeat-accent">
            {region.zone} India · {region.code}
          </span>
          <Heading
            level={3}
            size="h2"
            className="mt-0.5 text-offbeat-primary uppercase tracking-wide"
          >
            {region.name}
          </Heading>
        </div>
        <Badge variant="accent" size="sm">
          {region.discoveryCount} Discoveries
        </Badge>
      </div>

      <Text variant="body" className="text-sm text-offbeat-secondary mb-4 italic">
        &ldquo;{region.tagline}&rdquo;
      </Text>

      <div className="mb-4 p-3 rounded-lg bg-offbeat-surface/60 border border-offbeat-border/60">
        <span className="text-xs font-semibold text-offbeat-primary uppercase tracking-wider block mb-1">
          Local Highlight
        </span>
        <Text variant="small" className="text-offbeat-secondary">
          {region.highlight}
        </Text>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {region.tags.map((tag) => (
          <Badge key={tag} variant="tag" size="sm">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-offbeat-border/60">
        <Link to={`/region/${region.id}`} className="flex-1">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-between"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            LET&apos;S DISCOVER {region.name.toUpperCase()}
          </Button>
        </Link>
        {onClose && (
          <Button variant="ghost" size="md" onClick={onClose}>
            Clear
          </Button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-offbeat-muted">
        <Sparkles className="h-3 w-3 text-offbeat-accent" />
        <span>Phase 1 Geographic Surface · Ready for Phase 2 Region Elevation</span>
      </div>
    </Card>
  );
};
