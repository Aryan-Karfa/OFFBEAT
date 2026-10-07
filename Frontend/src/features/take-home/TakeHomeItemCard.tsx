import React from "react";
import type { TakeHomeItemDto } from "@offbeat/shared";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { MapPin, Users, Shuffle, ShieldCheck } from "lucide-react";

interface TakeHomeItemCardProps {
  item: TakeHomeItemDto;
  onOpenWhereToFind: (item: TakeHomeItemDto) => void;
  onOpenAlternatives: (item: TakeHomeItemDto) => void;
  isPrimary?: boolean;
}

export const TakeHomeItemCard: React.FC<TakeHomeItemCardProps> = ({
  item,
  onOpenWhereToFind,
  onOpenAlternatives,
  isPrimary = false,
}) => {
  // Local relevance styling
  const getRelevanceBadge = (relevance: string) => {
    switch (relevance) {
      case "SIGNATURE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40">
            ★ Signature Specialty
          </span>
        );
      case "STRONGLY_ASSOCIATED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Strongly Associated
          </span>
        );
      case "LOCAL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Local Tradition
          </span>
        );
      case "REGIONAL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Regional Heritage
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase bg-offbeat-surface text-offbeat-muted border border-offbeat-border">
            Local Find
          </span>
        );
    }
  };

  const confidenceScore = item.confidence?.score ? Math.round(item.confidence.score * 100) : null;
  const placesCount = item.placesToFind?.length || 0;
  const hasAlternatives = (item.alternatives?.length || 0) > 0;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl bg-offbeat-surface/90 border transition-all duration-300 overflow-hidden hover:shadow-2xl hover:border-offbeat-secondary/40 ${
        isPrimary
          ? "border-amber-500/50 ring-1 ring-amber-500/30 shadow-xl shadow-amber-500/5"
          : "border-offbeat-border"
      }`}
    >
      <div>
        {/* Card Header Media */}
        {item.imageUrl && (
          <div className="relative w-full h-48 overflow-hidden bg-offbeat-surface-hover">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-offbeat-surface via-transparent to-black/30" />

            {/* Top Badge overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {getRelevanceBadge(item.localRelevance)}
              </div>

              {item.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-white/90 border border-white/10 uppercase tracking-wider">
                  {item.category.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-6">
          {!item.imageUrl && (
            <div className="flex items-center justify-between gap-2 mb-3">
              {getRelevanceBadge(item.localRelevance)}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-offbeat-surface-hover text-offbeat-muted border border-offbeat-border uppercase tracking-wider">
                {item.category.replace(/_/g, " ")}
              </span>
            </div>
          )}

          <div className="mb-3">
            <Heading
              level={3}
              size="h4"
              className="text-xl font-bold tracking-tight text-white mb-1.5 group-hover:text-amber-300 transition-colors"
            >
              {item.name}
            </Heading>
            {item.description && (
              <Text
                variant="muted"
                className="text-xs line-clamp-2 leading-relaxed text-offbeat-muted"
              >
                {item.description}
              </Text>
            )}
          </div>

          {/* WHY TAKE THIS HOME Panel */}
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">
              Why Take This Home?
            </div>
            <Text className="text-xs text-white/90 leading-relaxed font-normal">
              {item.whyTakeHome}
            </Text>
          </div>

          {/* Contextual signals: Good For & Community */}
          <div className="space-y-2 mb-4 text-xs">
            {item.goodFor && item.goodFor.length > 0 && (
              <div className="flex items-center gap-1.5 text-offbeat-secondary">
                <span className="text-offbeat-muted font-medium">Good for:</span>
                <span className="font-semibold text-white/90">
                  {item.goodFor.map((g) => g.toLowerCase().replace(/_/g, " ")).join(" • ")}
                </span>
              </div>
            )}

            {/* Community Intelligence Corroboration */}
            {item.community && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-offbeat-surface-hover/60 border border-offbeat-border/60 text-emerald-400 text-xs">
                <Users className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">
                  {item.community.status === "COMMUNITY_VERIFIED"
                    ? "Verified community discovery"
                    : `${item.community.supportCount || 2} traveler recommendations`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-6 pt-0 border-t border-offbeat-border/40 mt-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-offbeat-muted pt-3">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confidence:</span>
            <span className="font-semibold text-white/90">
              {item.confidence?.evidenceStrength ||
                (confidenceScore ? `${confidenceScore}%` : "HIGH")}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{placesCount > 0 ? `${placesCount} places to find` : "Local shops"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onOpenWhereToFind(item)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Where to Find It</span>
          </button>

          {hasAlternatives && (
            <button
              onClick={() => onOpenAlternatives(item)}
              title="Find an Alternative specialty"
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium bg-offbeat-surface hover:bg-offbeat-surface-hover text-offbeat-secondary border border-offbeat-border hover:border-offbeat-secondary/40 transition-all active:scale-[0.98]"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alternatives</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
