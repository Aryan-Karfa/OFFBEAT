import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import type { DiscoveryResultItemDto } from "@offbeat/shared";
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  Compass,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface DiscoveryCardProps {
  item: DiscoveryResultItemDto;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ item }) => {
  const { place, score, why, source } = item;
  const [imageError, setImageError] = useState<boolean>(false);

  // Source transparency label and badge variant
  const getSourceBadge = () => {
    switch (source.type) {
      case "COMBINED":
        return (
          <Badge
            variant="verified"
            dot
            size="sm"
            title="Canonical OFFBEAT place enriched with Google Maps data"
          >
            Verified + SerpApi
          </Badge>
        );
      case "INTERNAL":
        return (
          <Badge variant="accent" dot size="sm" title="Canonical OFFBEAT curated discovery">
            OFFBEAT Canonical
          </Badge>
        );
      case "EXTERNAL":
        return (
          <Badge
            variant="supported"
            dot
            size="sm"
            title="Discovered via live Google Maps intelligence"
          >
            SerpApi Live
          </Badge>
        );
    }
  };

  return (
    <Card
      variant="interactive"
      padding="none"
      className="group flex flex-col justify-between overflow-hidden border-offbeat-border/80 hover:border-offbeat-accent/50 transition-all duration-300 bg-offbeat-surface shadow-elevated"
    >
      {/* 1. Place Image / Visual Header */}
      <div className="relative h-48 w-full overflow-hidden bg-offbeat-dark">
        {place.imageUrl && !imageError ? (
          <img
            src={place.imageUrl}
            alt={place.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#12161f] via-offbeat-dark to-[#080a0f] flex flex-col items-center justify-center p-6 text-center">
            <Compass className="h-10 w-10 text-offbeat-accent/40 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xs uppercase tracking-wider text-offbeat-muted font-mono">
              {place.destination}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-offbeat-surface via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {getSourceBadge()}
          <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-offbeat-dark/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-sm">
            {score}% MATCH
          </span>
        </div>

        {/* Destination & Location pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-offbeat-dark/80 backdrop-blur-md border border-offbeat-border text-[11px] text-offbeat-primary font-medium">
          <MapPin className="h-3 w-3 text-offbeat-accent" />
          <span>
            {place.destination}, {place.region}
          </span>
        </div>
      </div>

      {/* 2. Main Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Place Title */}
          <h3 className="font-display text-xl font-bold text-offbeat-primary group-hover:text-offbeat-accent transition-colors line-clamp-1 mb-2">
            {place.name}
          </h3>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {place.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-md bg-offbeat-dark/60 border border-offbeat-border text-[11px] font-medium text-offbeat-secondary"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* 3. "WHY THIS MATCHES" — Central UX Feature */}
          <div className="p-3.5 rounded-xl bg-offbeat-dark/70 border border-offbeat-accent/25 space-y-2 mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-offbeat-accent">
              <Sparkles className="h-3.5 w-3.5 text-offbeat-accent" />
              <span>Why Offbeat Discovered This</span>
            </div>
            <ul className="space-y-1.5 text-xs text-offbeat-secondary leading-snug">
              {why.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/90 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Description Snippet if available */}
          {place.description && (
            <p className="text-xs text-offbeat-muted line-clamp-2 leading-relaxed mb-3">
              {place.description}
            </p>
          )}

          {/* 4. Supporting Signals (Rating, Opening hours) */}
          <div className="flex items-center gap-4 text-xs text-offbeat-muted pt-1">
            {place.rating && (
              <div className="flex items-center gap-1 text-amber-400 font-medium">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{place.rating.toFixed(1)}</span>
                {place.reviewCount && (
                  <span className="text-[11px] text-offbeat-muted font-normal">
                    (
                    {place.reviewCount > 1000
                      ? `${(place.reviewCount / 1000).toFixed(1)}k`
                      : place.reviewCount}
                    )
                  </span>
                )}
              </div>
            )}

            {place.openingHours && place.openingHours[0] && (
              <div className="flex items-center gap-1 text-offbeat-muted text-[11px] truncate max-w-[180px]">
                <Clock className="h-3 w-3 shrink-0" />
                <span className="truncate">{place.openingHours[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className="pt-3 border-t border-offbeat-border/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-offbeat-muted truncate">
            {place.address ? (
              <span className="truncate block max-w-[180px]" title={place.address}>
                {place.address}
              </span>
            ) : (
              <span>Coordinates verified</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {place.sourceUrl && (
              <a
                href={place.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-offbeat-dark border border-offbeat-border text-offbeat-muted hover:text-offbeat-primary transition-colors"
                title="View original listing"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <Link to={`/place/${place.slug || place.id}`}>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                className="text-xs hover:text-offbeat-accent"
              >
                Explore
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
