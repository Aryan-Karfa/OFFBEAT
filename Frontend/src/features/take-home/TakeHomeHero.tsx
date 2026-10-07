import React from "react";
import { Badge } from "../../components/ui/Badge";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Sparkles, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";

interface TakeHomeHeroProps {
  destinationName: string;
  source: string;
  fallback: boolean;
  totalItems: number;
  onSelectDestination?: (destId: string) => void;
  activeDestinationId?: string;
}

const DEMO_DESTINATIONS = [
  { id: "dest_darjeeling", name: "Darjeeling" },
  { id: "dest_kolkata", name: "Kolkata" },
  { id: "dest_jodhpur", name: "Jodhpur" },
  { id: "dest_munnar", name: "Munnar" },
  { id: "dest_nubra", name: "Nubra Valley" },
];

export const TakeHomeHero: React.FC<TakeHomeHeroProps> = ({
  destinationName,
  source,
  fallback,
  totalItems,
  onSelectDestination,
  activeDestinationId,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-offbeat-surface via-offbeat-surface to-offbeat-surface-hover/40 border border-offbeat-border p-6 md:p-10 mb-8 shadow-2xl">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top meta strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-offbeat-muted flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-offbeat-accent" />
              OFFBEAT / TAKE HOME
            </span>
            <span className="text-offbeat-border">•</span>
            <span className="text-xs font-medium text-offbeat-secondary flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {destinationName}
            </span>
            {totalItems > 0 && (
              <>
                <span className="text-offbeat-border">•</span>
                <span className="text-xs text-offbeat-muted">{totalItems} finds</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {source === "GEMINI" && !fallback ? (
              <Badge variant="accent" size="sm" dot>
                <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                Gemini Intelligence
              </Badge>
            ) : (
              <Badge variant="supported" size="sm">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                Grounded Truth
              </Badge>
            )}

            {fallback && (
              <Badge variant="new" size="sm">
                Deterministic Fallback
              </Badge>
            )}
          </div>
        </div>

        {/* Hero title & philosophy */}
        <div className="max-w-3xl mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            What is this place known for?
          </div>
          <Heading
            level={1}
            size="h1"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3"
          >
            TAKE HOME FROM{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
              {destinationName.toUpperCase()}
            </span>
          </Heading>
          <Text
            variant="lead"
            className="text-base md:text-lg text-offbeat-secondary leading-relaxed"
          >
            Local specialties, artisanal crafts, and harvest goods genuinely worth bringing back —
            with verified provenance and zero tourist traps.
          </Text>
        </div>

        {/* Fast Destination Switcher for judges */}
        {onSelectDestination && (
          <div className="pt-4 border-t border-offbeat-border/60">
            <div className="text-xs font-medium uppercase tracking-wider text-offbeat-muted mb-2.5">
              Explore Destinations:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DEMO_DESTINATIONS.map((dest) => {
                const isActive =
                  activeDestinationId === dest.id ||
                  destinationName.toLowerCase() === dest.name.toLowerCase();
                return (
                  <button
                    key={dest.id}
                    onClick={() => onSelectDestination(dest.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "bg-offbeat-surface hover:bg-offbeat-surface-hover text-offbeat-secondary border border-offbeat-border"
                    }`}
                  >
                    {dest.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
