import React, { useEffect, useState } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useItineraryStore } from "../../stores/itineraryStore";
import {
  ItineraryBuilder,
  ItineraryTimeline,
  ItineraryMap,
  SwapStopModal,
} from "../../features/itinerary";
import {
  Sparkles,
  RefreshCw,
  Compass,
  Coffee,
  Flame,
  Share2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Map,
  SlidersHorizontal,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export const ItineraryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { itineraryId } = useParams<{ itineraryId?: string }>();
  const mustVisitParam = searchParams.get("mustVisit") || itineraryId;
  const destinationParam = searchParams.get("destination") || "Darjeeling";

  const {
    itinerary,
    loading,
    error,
    fallback,
    selectedDay,
    selectedStopId,
    swappingStop,
    selectDay,
    selectStop,
    setSwappingStop,
    swapStopWithAlternative,
    generateItinerary,
    reset,
  } = useItineraryStore();

  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(true);
  const [copied, setCopied] = useState(false);

  // Auto-generate if query param mustVisit is present and no itinerary exists
  useEffect(() => {
    if (mustVisitParam && !itinerary && !loading) {
      generateItinerary({
        destinationId: "dest_darjeeling",
        mustVisitPlaceIds: [mustVisitParam],
        travelTaste: ["mountains", "photography"],
        experienceTaste: ["sunrise", "nature"],
      });
    }
  }, [mustVisitParam]);

  const activeDay = itinerary?.days.find((d) => d.day === selectedDay) || itinerary?.days[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPaceIcon = (pace?: string) => {
    switch (pace) {
      case "RELAXED":
        return <Coffee className="h-3.5 w-3.5 mr-1 text-emerald-400" />;
      case "PACKED":
        return <Flame className="h-3.5 w-3.5 mr-1 text-amber-400" />;
      default:
        return <Compass className="h-3.5 w-3.5 mr-1 text-offbeat-accent" />;
    }
  };

  return (
    <div className="w-full min-h-screen pb-16">
      <Section spacing="md">
        <Container size="lg">
          {/* Top Breadcrumb & Status Bar */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-offbeat-muted">
                OFFBEAT / ITINERARY
              </span>
              <span className="text-offbeat-muted text-xs">•</span>
              <span className="text-xs font-mono font-bold text-offbeat-accent">
                {destinationParam.toUpperCase()}
              </span>
            </div>

            {itinerary && (
              <div className="flex items-center gap-2">
                <Badge variant={fallback ? "tag" : "verified"} size="sm">
                  {fallback ? "Deterministic Guard" : "Gemini 3.8 Multi-Signal"}
                </Badge>
                <Badge variant="outline" size="sm" className="font-mono">
                  {getPaceIcon(itinerary.pace)}
                  {itinerary.pace} PACE
                </Badge>
              </div>
            )}
          </div>

          {/* Scenario 1: No Itinerary Generated Yet */}
          {!itinerary && !loading && (
            <div className="space-y-8">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
                  Smart Journey Planning
                </span>
                <Heading level={1} size="h1" className="mb-3">
                  Build Your Day
                </Heading>
                <Text variant="lead" className="text-base text-offbeat-secondary max-w-2xl">
                  OFFBEAT doesn&apos;t just show places—it arranges them in the optimal
                  chronological and geographic sequence for YOUR travel taste.
                </Text>
              </div>

              {/* Itinerary Builder */}
              <div className="max-w-3xl mx-auto">
                <ItineraryBuilder
                  defaultDestination={destinationParam}
                  defaultMustVisitId={mustVisitParam || undefined}
                />
              </div>
            </div>
          )}

          {/* Scenario 2: Loading State */}
          {loading && (
            <div className="py-20 text-center space-y-4">
              <div className="h-10 w-10 border-3 border-offbeat-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <Heading level={3} size="h3" className="text-offbeat-primary">
                Synthesizing Your OFFBEAT Day...
              </Heading>
              <Text variant="muted" className="text-sm max-w-md mx-auto">
                Evaluating candidate places, checking opening hours, balancing travel pace, and
                optimizing the route across {destinationParam}.
              </Text>
            </div>
          )}

          {/* Scenario 3: Error State */}
          {!loading && error && !itinerary && (
            <Card
              variant="elevated"
              padding="lg"
              className="border-red-500/40 bg-red-950/10 text-center py-12 mb-8"
            >
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-offbeat-primary mb-2">
                Unable to build itinerary
              </h3>
              <p className="text-sm text-offbeat-secondary max-w-md mx-auto mb-5">{error}</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => reset()}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Modify Preferences & Try Again
              </Button>
            </Card>
          )}

          {/* Scenario 4: Itinerary Result Display */}
          {itinerary && (
            <div className="space-y-6">
              {/* Result Hero */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-offbeat-border">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-offbeat-accent">
                      {itinerary.durationDays === 1
                        ? "1-Day Exploration"
                        : `${itinerary.durationDays}-Day Journey`}
                    </span>
                    <span className="text-offbeat-muted text-xs">•</span>
                    <span className="text-xs text-offbeat-muted font-medium">
                      {itinerary.totalStops} experiences planned
                    </span>
                  </div>
                  <Heading
                    level={1}
                    size="h1"
                    className="text-2xl sm:text-4xl text-offbeat-primary"
                  >
                    {itinerary.title}
                  </Heading>
                  <p className="text-sm text-offbeat-secondary max-w-2xl mt-1.5 leading-relaxed">
                    {itinerary.summary}
                  </p>
                </div>

                {/* Top Action Bar */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBuilderModal(!showBuilderModal)}
                    leftIcon={<SlidersHorizontal className="h-3.5 w-3.5 text-offbeat-accent" />}
                  >
                    Adjust Pace & Tastes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateItinerary(useItineraryStore.getState().request)}
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleShare}
                    leftIcon={<Share2 className="h-3.5 w-3.5" />}
                  >
                    {copied ? "Copied!" : "Share"}
                  </Button>
                </div>
              </div>

              {/* Adjust Modal / Collapsible */}
              {showBuilderModal && (
                <div className="mb-6 animate-in slide-in-from-top-4 duration-200">
                  <ItineraryBuilder
                    onGenerated={() => setShowBuilderModal(false)}
                    defaultDestination={itinerary.destination}
                  />
                </div>
              )}

              {/* WHY OFFBEAT BUILT THIS DAY Reasoning Card */}
              {itinerary.reasoning && (
                <Card
                  variant="elevated"
                  padding="md"
                  className="bg-gradient-to-r from-offbeat-accent/10 via-offbeat-surface to-offbeat-surface border-offbeat-accent/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-offbeat-accent/20 text-offbeat-accent shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-bold tracking-wider text-offbeat-accent uppercase">
                          Why OFFBEAT Built This Day
                        </span>
                        <span className="text-[11px] text-offbeat-muted">
                          {fallback ? "Deterministic Geographic Sequence" : "AI Context Reasoning"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-offbeat-secondary leading-relaxed">
                        {itinerary.reasoning.explanation}
                      </p>

                      {/* Tradeoffs if any */}
                      {itinerary.reasoning.tradeoffs &&
                        itinerary.reasoning.tradeoffs.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-offbeat-border/40 flex items-center gap-2 text-xs text-amber-300/90">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                            <span>Trade-off: {itinerary.reasoning.tradeoffs[0]}</span>
                          </div>
                        )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Multi-Day Tabs if applicable */}
              {itinerary.days.length > 1 && (
                <div className="flex items-center gap-2 border-b border-offbeat-border pb-2">
                  {itinerary.days.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => selectDay(d.day)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                        selectedDay === d.day
                          ? "bg-offbeat-accent border-offbeat-accent text-offbeat-dark"
                          : "bg-offbeat-surface border-offbeat-border text-offbeat-secondary hover:text-offbeat-primary"
                      }`}
                    >
                      Day {d.day} ({d.stops.filter((s) => !s.isFreeTime).length} stops)
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile Map Toggle Button */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileMap(!showMobileMap)}
                  className="w-full justify-center text-xs"
                  leftIcon={<Map className="h-3.5 w-3.5 text-offbeat-accent" />}
                  rightIcon={
                    showMobileMap ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {showMobileMap ? "Hide Interactive Route Map" : "Show Interactive Route Map"}
                </Button>
              </div>

              {/* Main Content: Split Timeline & Map */}
              {activeDay && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Timeline */}
                  <div className="lg:col-span-7 space-y-4">
                    <ItineraryTimeline
                      day={activeDay}
                      selectedStopId={selectedStopId}
                      onSelectStop={selectStop}
                      onSwapStop={(stop) => setSwappingStop(stop)}
                    />
                  </div>

                  {/* Right Column: Interactive Route Map */}
                  <div
                    className={`lg:col-span-5 space-y-4 sticky top-6 ${showMobileMap ? "block" : "hidden lg:block"}`}
                  >
                    <ItineraryMap
                      stops={activeDay.stops}
                      selectedStopId={selectedStopId}
                      onSelectStop={selectStop}
                      destinationName={itinerary.destination}
                    />

                    {/* Quick Trip Tips Card */}
                    <Card
                      variant="flat"
                      padding="md"
                      className="bg-offbeat-dark/60 border-offbeat-border/60 text-xs"
                    >
                      <div className="flex items-center gap-2 text-offbeat-primary font-bold mb-1.5">
                        <Compass className="h-3.5 w-3.5 text-offbeat-accent" />
                        <span>Traveler&apos;s Field Guide</span>
                      </div>
                      <p className="text-offbeat-secondary leading-relaxed">
                        Stops are arranged to minimize Hill Cart Road traffic, keeping viewpoints in
                        early light and cultural experiences during calmer midday windows.
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {/* Phase 14: BEFORE YOU LEAVE — TAKE HOME Section */}
              <div className="mt-12 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-offbeat-surface to-offbeat-surface border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      Before You Leave
                    </span>
                  </div>
                  <Heading level={3} size="h3" className="text-xl md:text-2xl font-bold text-white">
                    TAKE HOME FROM {itinerary.destination.toUpperCase()}
                  </Heading>
                  <Text variant="muted" className="text-xs text-offbeat-secondary leading-relaxed">
                    Complete your journey with authentic regional specialties, tea flushes, and
                    indigenous crafts directly from verified local cooperatives.
                  </Text>
                </div>

                <Link
                  to={`/take-home/${itinerary.destination?.toLowerCase().replace(/\s+/g, "_") || "dest_darjeeling"}`}
                  className="shrink-0"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    See Take Home Picks
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Swap Stop Modal (Reuses Phase 12 Alternatives) */}
          {swappingStop && (
            <SwapStopModal
              stop={swappingStop}
              onClose={() => setSwappingStop(null)}
              onSelectReplacement={(replacement) => {
                if (swappingStop.placeId) {
                  swapStopWithAlternative(swappingStop.placeId, replacement);
                }
              }}
            />
          )}
        </Container>
      </Section>
    </div>
  );
};
