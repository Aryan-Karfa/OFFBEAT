import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useTasteStore } from "../../stores/tasteStore";
import { useDiscoveryStore } from "../../stores/discoveryStore";
import { useDiscoveryResultsStore } from "../../stores/discoveryResultsStore";
import { findRegion, INDIA_REGIONS } from "../../features/geography/data";
import { getTravelTasteBySlug, getExperienceTasteBySlug } from "../../features/taste/tasteUtils";
import { DiscoveryCard } from "../../features/discovery/components/DiscoveryCard";
import { DiscoveryLoading } from "../../features/discovery/components/DiscoveryLoading";
import { DiscoveryEmpty } from "../../features/discovery/components/DiscoveryEmpty";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import type { DiscoveryRequestDto } from "@offbeat/shared";

export const DiscoveryPage: React.FC = () => {
  const {
    activeRegionId,
    selectedTravelTastes,
    selectedExperienceTastes,
    timeContext,
    resetTastes,
  } = useTasteStore();

  const { selectedRegion, selectedCountry } = useDiscoveryStore();

  const {
    results,
    context,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    fallback,
    notice,
    reasoning,
    executeDiscovery,
    loadMore,
    retry,
  } = useDiscoveryResultsStore();

  const initialFetchAttempted = useRef<boolean>(false);

  // Resolve active region and country
  const currentRegion = selectedRegion || findRegion(activeRegionId) || INDIA_REGIONS[0]!;

  const countryName = selectedCountry?.name || "India";
  const regionName = currentRegion?.name || "West Bengal";
  const regionId = currentRegion?.id || activeRegionId || "IN-WB";

  // Build request payload
  const currentPayload: DiscoveryRequestDto = {
    regionId,
    country: countryName,
    travelTaste: selectedTravelTastes,
    experienceTaste: selectedExperienceTastes,
    dayNight: timeContext === "night" ? "NIGHT" : "DAY",
    intent: "DISCOVER_PLACES",
    page: 1,
    limit: 12,
  };

  // Trigger discovery on initial load or if context parameters change
  useEffect(() => {
    if (!initialFetchAttempted.current) {
      initialFetchAttempted.current = true;
      executeDiscovery(currentPayload);
    }
  }, [regionId, selectedTravelTastes, selectedExperienceTastes, timeContext]);

  const handleManualRefresh = () => {
    executeDiscovery(currentPayload);
  };

  return (
    <div className="w-full">
      <Section spacing="sm" className="pt-6 pb-20">
        <Container size="lg">
          {/* 1. Breadcrumb and Milestone Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-offbeat-muted flex-wrap"
            >
              <Link to="/" className="hover:text-offbeat-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                to="/country/india/map"
                className="hover:text-offbeat-primary transition-colors"
              >
                {countryName} Map
              </Link>
              <span>/</span>
              <Link to="/travel-taste" className="hover:text-offbeat-primary transition-colors">
                Taste Profile
              </Link>
              <span>/</span>
              <Link
                to="/discovery-context"
                className="hover:text-offbeat-primary transition-colors"
              >
                Context
              </Link>
              <span>/</span>
              <span className="text-offbeat-accent font-semibold">Discoveries</span>
            </nav>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                to="/discovery-context"
                className="inline-flex items-center gap-1.5 text-xs text-offbeat-muted hover:text-offbeat-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Context
              </Link>
              <Badge variant="accent" size="sm">
                Phase 7 Engine Active
              </Badge>
            </div>
          </div>

          {/* 2. Headline & Overview */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-offbeat-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-offbeat-accent">
                  Contextual Discovery Results
                </span>
                <span className="text-offbeat-muted">•</span>
                <span className="text-xs text-offbeat-secondary font-medium">
                  {regionName}, {countryName}
                </span>
              </div>
              <Heading level={1} size="display" className="text-3xl sm:text-4xl uppercase mb-2">
                OFFBEAT Discovered Places
              </Heading>
              <Text
                variant="lead"
                className="text-sm sm:text-base text-offbeat-secondary max-w-2xl"
              >
                Personalized matches reflecting your travel tastes and experience nuances, powered
                by internal curation and live intelligence.
              </Text>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
                leftIcon={
                  <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                }
                className="text-xs"
              >
                Refresh
              </Button>
              <Link to="/travel-taste">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                  className="text-xs"
                >
                  Edit Tastes
                </Button>
              </Link>
            </div>
          </div>

          {/* 3. Active Preference Filter Strip */}
          <div className="mb-8 p-4 rounded-xl bg-offbeat-surface border border-offbeat-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-offbeat-muted uppercase tracking-wider text-[11px]">
                Active Intent:
              </span>

              {/* Day/Night Badge */}
              {timeContext === "night" ? (
                <Badge variant="accent" size="sm" className="gap-1">
                  <Moon className="h-3 w-3 text-indigo-400" />
                  <span>Nocturnal & Starlight</span>
                </Badge>
              ) : (
                <Badge variant="supported" size="sm" className="gap-1">
                  <Sun className="h-3 w-3 text-amber-400" />
                  <span>Daylight Exploration</span>
                </Badge>
              )}

              {/* Travel Tastes */}
              {selectedTravelTastes.map((slug) => {
                const item = getTravelTasteBySlug(slug);
                return (
                  <Badge key={slug} variant="tag" size="sm" className="gap-1">
                    <span>{item?.icon || "🏔️"}</span>
                    <span>{item?.name || slug}</span>
                  </Badge>
                );
              })}

              {/* Experience Tastes */}
              {selectedExperienceTastes.map((slug) => {
                const item = getExperienceTasteBySlug(slug);
                return (
                  <Badge
                    key={slug}
                    variant="tag"
                    size="sm"
                    className="gap-1 text-offbeat-accent border-offbeat-accent/30"
                  >
                    <span>{item?.icon || "✨"}</span>
                    <span>{item?.name || slug}</span>
                  </Badge>
                );
              })}

              {selectedTravelTastes.length === 0 && selectedExperienceTastes.length === 0 && (
                <span className="text-offbeat-muted italic text-xs">
                  Broad exploration (all tastes)
                </span>
              )}
            </div>

            <div className="text-[11px] font-mono text-offbeat-muted">
              {pagination ? (
                <span>
                  Showing {results.length} of {pagination.total} candidates
                </span>
              ) : null}
            </div>
          </div>

          {/* 4. Partial Fallback Notice (if external intelligence was down or unconfigured) */}
          {(fallback || notice) && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300 uppercase tracking-wider mb-0.5">
                  Fallback Mode Active
                </span>
                <span>
                  {notice ||
                    "Displaying curated OFFBEAT places (live external search temporarily unavailable)."}
                </span>
              </div>
            </div>
          )}

          {/* 4a. Gemini Contextual Intelligence Banner (Phase 11) */}
          {reasoning && results.length > 0 && !isLoading && (
            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-offbeat-surface to-offbeat-dark border border-purple-500/30 shadow-elevated">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Why Offbeat Chose These Recommendations
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/70 border border-purple-500/40 text-purple-200">
                  {reasoning.source === "GEMINI"
                    ? "Gemini 3.8 Reasoning Layer"
                    : "Deterministic Engine Reasoning"}
                </span>
              </div>
              <p className="text-sm font-medium text-offbeat-primary mb-3 leading-relaxed">
                {reasoning.summary}
              </p>
              {reasoning.reasons && reasoning.reasons.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-offbeat-secondary mb-3">
                  {reasoning.reasons.slice(0, 4).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 p-2 rounded-lg bg-offbeat-dark/50 border border-purple-500/15"
                    >
                      <span className="text-purple-400 font-bold shrink-0">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
              {reasoning.contextualNotes && reasoning.contextualNotes.length > 0 && (
                <div className="text-[11px] text-offbeat-muted flex flex-wrap items-center gap-2 pt-2 border-t border-purple-500/20">
                  <span className="font-semibold text-purple-300/80">Context:</span>
                  <span>{reasoning.contextualNotes[0]}</span>
                </div>
              )}
            </div>
          )}

          {/* 5. Main Content Area */}
          {isLoading && results.length === 0 ? (
            <DiscoveryLoading
              regionName={regionName}
              travelTastes={selectedTravelTastes}
              experienceTastes={selectedExperienceTastes}
            />
          ) : error && results.length === 0 ? (
            <div className="p-8 rounded-2xl bg-offbeat-surface border border-red-500/30 text-center max-w-md mx-auto my-12 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-offbeat-primary">
                Discovery Query Failed
              </h3>
              <p className="text-xs text-offbeat-muted leading-relaxed">{error}</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={retry}
                  leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                >
                  Retry Search
                </Button>
                <Link to="/discovery-context">
                  <Button variant="secondary" size="sm">
                    Back to Context
                  </Button>
                </Link>
              </div>
            </div>
          ) : results.length === 0 ? (
            <DiscoveryEmpty
              regionName={regionName}
              onReset={() => {
                resetTastes();
                executeDiscovery({
                  regionId,
                  travelTaste: [],
                  experienceTaste: [],
                  dayNight: "DAY",
                  intent: "DISCOVER_PLACES",
                });
              }}
            />
          ) : (
            <div className="space-y-8">
              {/* Places Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <DiscoveryCard key={item.place.id} item={item} />
                ))}
              </div>

              {/* 6. Pagination & Load More */}
              {pagination && pagination.hasMore && (
                <div className="pt-6 flex flex-col items-center justify-center text-center space-y-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    leftIcon={
                      isLoadingMore ? (
                        <RotateCcw className="h-4 w-4 animate-spin text-offbeat-accent" />
                      ) : (
                        <Compass className="h-4 w-4 text-offbeat-accent" />
                      )
                    }
                    className="font-medium tracking-wide border-offbeat-accent/30 hover:border-offbeat-accent"
                  >
                    {isLoadingMore ? "Discovering more places..." : "Load More Discoveries"}
                  </Button>
                  <span className="text-xs text-offbeat-muted">
                    Showing {results.length} of {pagination.total} ranked places
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 7. Footer Architecture Notice */}
          <div className="mt-16 p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
              <span>
                <strong>Phase 7 Discovery Engine</strong>: Multi-signal deterministic ranking
                combining canonical OFFBEAT places and Google Maps intelligence.
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-offbeat-muted">
              Intent: {context?.intent || "DISCOVER_PLACES"}
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
