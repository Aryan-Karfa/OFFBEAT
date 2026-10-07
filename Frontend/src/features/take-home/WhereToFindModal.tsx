import React from "react";
import type { TakeHomeItemDto } from "@offbeat/shared";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { X, MapPin, Store, Star, Compass, ExternalLink, ShieldCheck } from "lucide-react";

interface WhereToFindModalProps {
  item: TakeHomeItemDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhereToFindModal: React.FC<WhereToFindModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const sources = item.placesToFind || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-offbeat-surface border border-offbeat-border p-6 md:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-offbeat-surface-hover text-offbeat-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="accent" size="sm">
              Verified Locations
            </Badge>
            <span className="text-xs text-offbeat-muted uppercase tracking-wider font-mono">
              {item.destinationName || "Destination"}
            </span>
          </div>

          <Heading level={2} size="h3" className="text-2xl font-bold text-white mb-2">
            Where to Find: <span className="text-amber-400">{item.name}</span>
          </Heading>
          <Text variant="muted" className="text-xs">
            Authentic local businesses and verified workshops directly offering this specialty.
          </Text>
        </div>

        {/* Source List */}
        {sources.length > 0 ? (
          <div className="space-y-4 mb-6">
            {sources.map((source, index) => {
              const hasCoords = source.location?.lat && source.location?.lng;
              const mapsUrl = hasCoords
                ? `https://www.google.com/maps/search/?api=1&query=${source.location?.lat},${source.location?.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${source.name} ${source.address || item.destinationName || ""}`,
                  )}`;

              return (
                <div
                  key={source.placeId || source.externalId || index}
                  className="p-5 rounded-2xl bg-offbeat-surface-hover/70 border border-offbeat-border/80 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-white text-sm md:text-base">
                        {source.name}
                      </span>
                      {source.type && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-offbeat-surface text-offbeat-muted border border-offbeat-border uppercase">
                          {source.type.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    {source.address && (
                      <div className="text-xs text-offbeat-secondary flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-offbeat-muted shrink-0 mt-0.5" />
                        <span>{source.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-offbeat-muted pt-1">
                      {source.rating && (
                        <span className="flex items-center gap-1 text-amber-300 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {source.rating.toFixed(1)}
                          {source.reviewCount ? ` (${source.reviewCount})` : ""}
                        </span>
                      )}

                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {source.source === "INTERNAL" ? "OFFBEAT Curated" : "Google Maps Verified"}
                      </span>
                    </div>
                  </div>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 transition-all shrink-0"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-offbeat-surface-hover/40 border border-dashed border-offbeat-border text-center mb-6">
            <MapPin className="w-8 h-8 text-offbeat-muted mx-auto mb-2 opacity-60" />
            <Text className="text-sm font-medium text-white mb-1">Local Specialty Confirmed</Text>
            <Text variant="muted" className="text-xs max-w-sm mx-auto">
              We found this authentic local specialty, but don't have a reliable, verified shop in
              our directory yet.
            </Text>
          </div>
        )}

        {/* Footer Note */}
        <div className="p-3.5 rounded-xl bg-offbeat-surface/40 border border-offbeat-border/60 text-[11px] text-offbeat-muted flex items-center justify-between">
          <span>Truthful recommendation — no sponsored placement or affiliate commissions.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-offbeat-surface hover:bg-offbeat-surface-hover text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
