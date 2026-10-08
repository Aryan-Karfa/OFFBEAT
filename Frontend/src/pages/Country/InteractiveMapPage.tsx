import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Map, List, Compass, Filter, Sparkles, MapPin } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { InteractiveMapFoundation } from "../../components/map/InteractiveMapFoundation";
import { RegionReveal } from "../../components/map/RegionReveal";
import { RegionListFallback } from "../../components/map/RegionListFallback";
import { useDiscoveryStore } from "../../stores/discoveryStore";
import { INDIA_REGIONS } from "../../features/geography/data";
import type { Region } from "../../types/geography";
import { cn } from "../../utils/cn";

export const InteractiveMapPage: React.FC = () => {
  const {
    selectedRegion,
    hoveredRegion,
    interactionState,
    viewMode,
    setViewMode,
    setHoveredRegion,
    selectRegionSequence,
    returnToCountryContext,
  } = useDiscoveryStore();

  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const handleSelectRegion = (region: Region) => {
    selectRegionSequence(region, isReducedMotion);
  };

  const handleBackToCountry = () => {
    returnToCountryContext(isReducedMotion);
  };

  const isRegionActive =
    !!selectedRegion &&
    (interactionState === "rising" ||
      interactionState === "focused" ||
      interactionState === "active" ||
      interactionState === "exploring");

  const statesList = [...INDIA_REGIONS.filter((r) => r.type === "STATE")].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const utList = [...INDIA_REGIONS.filter((r) => r.type === "UNION_TERRITORY")].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="w-full">
      <Section spacing="sm" className="pt-6 pb-12">
        <Container size="xl">
          {/* Top Breadcrumbs & Phase 2 Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-offbeat-muted"
            >
              <Link to="/" className="hover:text-offbeat-primary transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/country" className="hover:text-offbeat-primary transition-colors">
                Countries
              </Link>
              <span>/</span>
              <span className="text-offbeat-primary font-medium">India</span>
              <span>/</span>
              <span className="text-offbeat-accent font-semibold">
                {selectedRegion ? selectedRegion.name : "Interactive Map"}
              </span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-accent font-semibold tracking-wider self-start sm:self-auto">
              <Compass className="h-3.5 w-3.5" />
              <span>SIGNATURE GEOGRAPHIC DISCOVERY</span>
            </div>
          </div>

          {/* Page Heading & View Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-offbeat-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent">
                  Geographic Discovery Experience
                </span>
                <span className="text-offbeat-muted">·</span>
                <Badge variant="verified" dot size="sm">
                  Subcontinent of India
                </Badge>
              </div>
              <Heading level={1} size="h1" className="uppercase tracking-wide">
                {selectedRegion && isRegionActive
                  ? `${selectedRegion.name} · ${selectedRegion.zone} India`
                  : "Interactive Geographic Map"}
              </Heading>
              <Text
                variant="lead"
                className="text-sm sm:text-base text-offbeat-secondary max-w-2xl mt-1"
              >
                {selectedRegion && isRegionActive
                  ? `Exploring ${selectedRegion.name}. Discover regional hubs and living culture.`
                  : "Select any State or Union Territory. Watch it rise physically from the map plane as camera focus and regional destinations reveal."}
              </Text>
            </div>

            {/* View Mode Switcher (Map vs Accessible List) */}
            <div
              role="group"
              aria-label="View layout switcher"
              className="flex items-center gap-1.5 p-1 rounded-xl bg-offbeat-surface border border-offbeat-border shrink-0 self-start md:self-auto"
            >
              <button
                type="button"
                aria-pressed={viewMode === "map"}
                onClick={() => setViewMode("map")}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
                  viewMode === "map"
                    ? "bg-offbeat-accent text-offbeat-dark shadow-sm"
                    : "text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-elevated",
                )}
              >
                <Map className="h-3.5 w-3.5" />
                <span>Map Surface</span>
              </button>

              <button
                type="button"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
                  viewMode === "list"
                    ? "bg-offbeat-accent text-offbeat-dark shadow-sm"
                    : "text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-elevated",
                )}
              >
                <List className="h-3.5 w-3.5" />
                <span>Explore as List</span>
              </button>
            </div>
          </div>

          {/* Main Layout Area */}
          {viewMode === "map" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Map Surface (8 Cols on Desktop) */}
              <div className="lg:col-span-8 flex flex-col space-y-4">
                <InteractiveMapFoundation
                  selectedRegion={selectedRegion}
                  hoveredRegion={hoveredRegion}
                  interactionState={interactionState}
                  onSelectRegion={handleSelectRegion}
                  onHoverRegion={setHoveredRegion}
                  onBackToCountry={handleBackToCountry}
                />

                {/* Accessible Regional Hierarchy: Distinct States and Union Territories */}
                <div className="p-4 sm:p-5 rounded-xl bg-offbeat-surface/60 border border-offbeat-border/70 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-offbeat-border/50 pb-2.5">
                    <div className="flex items-center gap-2 text-offbeat-primary font-bold uppercase tracking-wider text-xs">
                      <Filter className="h-3.5 w-3.5 text-offbeat-accent" />
                      <span>Select Administrative Region</span>
                    </div>
                    <span className="text-[11px] font-mono text-offbeat-muted">
                      36 Units · 28 States · 8 Union Territories
                    </span>
                  </div>

                  {/* 28 States Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-offbeat-accent">
                      <span>States (28)</span>
                      <span className="text-[10px] font-mono text-offbeat-muted/80">
                        Click to focus
                      </span>
                    </div>
                    <div
                      className="flex flex-wrap gap-1.5"
                      role="group"
                      aria-label="States of India"
                    >
                      {statesList.map((reg) => (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => handleSelectRegion(reg)}
                          aria-pressed={selectedRegion?.id === reg.id}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
                            selectedRegion?.id === reg.id
                              ? "bg-offbeat-accent text-offbeat-dark font-bold shadow-sm"
                              : "bg-offbeat-elevated text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface",
                          )}
                        >
                          {reg.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 8 Union Territories Section */}
                  <div className="space-y-2 pt-3 border-t border-offbeat-border/50">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-offbeat-accent">
                      <span>Union Territories (8)</span>
                      <span className="text-[10px] font-mono text-offbeat-muted/80">
                        Click to focus
                      </span>
                    </div>
                    <div
                      className="flex flex-wrap gap-1.5"
                      role="group"
                      aria-label="Union Territories of India"
                    >
                      {utList.map((reg) => (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => handleSelectRegion(reg)}
                          aria-pressed={selectedRegion?.id === reg.id}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
                            selectedRegion?.id === reg.id
                              ? "bg-offbeat-accent text-offbeat-dark font-bold shadow-sm"
                              : "bg-offbeat-elevated text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface",
                          )}
                        >
                          {reg.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Editorial Region Reveal Panel (4 Cols on Desktop) */}
              <div className="lg:col-span-4 flex flex-col space-y-6">
                {selectedRegion && isRegionActive ? (
                  <RegionReveal
                    region={selectedRegion}
                    onBack={handleBackToCountry}
                    isReducedMotion={isReducedMotion}
                  />
                ) : hoveredRegion ? (
                  <Card
                    variant="elevated"
                    padding="md"
                    className="border-offbeat-accent/30 bg-gradient-to-br from-offbeat-surface to-offbeat-elevated"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-offbeat-accent">
                        {hoveredRegion.zone} India · {hoveredRegion.code}
                      </span>
                      <Badge variant="tag" size="sm">
                        Hover Preview
                      </Badge>
                    </div>

                    <Heading level={3} size="h3" className="mb-1 text-offbeat-primary">
                      {hoveredRegion.name}
                    </Heading>

                    <Text variant="muted" className="text-xs mb-3 italic">
                      &ldquo;{hoveredRegion.tagline}&rdquo;
                    </Text>

                    <p className="text-xs text-offbeat-secondary mb-4 line-clamp-2">
                      {hoveredRegion.highlight}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleSelectRegion(hoveredRegion)}
                      className="w-full py-2 rounded-lg bg-offbeat-accent/15 border border-offbeat-accent/40 text-xs font-bold text-offbeat-accent hover:bg-offbeat-accent hover:text-offbeat-dark transition-all text-center"
                    >
                      Click to Elevate {hoveredRegion.name}
                    </button>
                  </Card>
                ) : (
                  <Card
                    variant="flat"
                    padding="lg"
                    className="border-dashed border-offbeat-border text-center py-12 space-y-3"
                  >
                    <MapPin className="mx-auto h-8 w-8 text-offbeat-muted/60 animate-pulse" />
                    <Heading level={3} size="h4" className="text-offbeat-secondary">
                      Select a Region to Elevate
                    </Heading>
                    <Text variant="muted" className="text-xs max-w-xs mx-auto">
                      Click any state on the map or choose from the quick selectors below. The
                      region will visually separate and rise from the terrain.
                    </Text>
                  </Card>
                )}

                {/* Phase 2 Architecture & Interaction Guide */}
                <div className="p-4 rounded-xl bg-offbeat-surface/40 border border-offbeat-border/60 text-xs text-offbeat-secondary space-y-2">
                  <div className="flex items-center gap-1.5 text-offbeat-accent font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Signature Interaction Sequence</span>
                  </div>
                  <div className="text-[11px] font-mono text-offbeat-primary/90 flex flex-wrap items-center gap-1.5 py-1">
                    <span className="px-1.5 py-0.5 rounded bg-offbeat-dark border border-offbeat-border">
                      SELECT
                    </span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 rounded bg-offbeat-dark border border-offbeat-border">
                      RISE
                    </span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 rounded bg-offbeat-dark border border-offbeat-border">
                      FOCUS
                    </span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 rounded bg-offbeat-dark border border-offbeat-border">
                      REVEAL
                    </span>
                    <span>→</span>
                    <span className="px-1.5 py-0.5 rounded bg-offbeat-accent text-offbeat-dark font-bold">
                      EXPLORE
                    </span>
                  </div>
                  <p className="text-[11px] text-offbeat-muted leading-relaxed">
                    Keyboard navigable: use{" "}
                    <kbd className="px-1 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-primary">
                      Tab
                    </kbd>{" "}
                    to focus regions,{" "}
                    <kbd className="px-1 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-primary">
                      Enter
                    </kbd>{" "}
                    to elevate, and{" "}
                    <kbd className="px-1 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-primary">
                      Esc
                    </kbd>{" "}
                    to return to country context.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Accessible Map Fallback: Explore Regions as List */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <RegionListFallback
                  selectedRegion={selectedRegion}
                  onSelectRegion={handleSelectRegion}
                />
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  {selectedRegion && isRegionActive ? (
                    <RegionReveal
                      region={selectedRegion}
                      onBack={handleBackToCountry}
                      isReducedMotion={isReducedMotion}
                    />
                  ) : (
                    <Card
                      variant="flat"
                      padding="lg"
                      className="border-dashed border-offbeat-border text-center py-10"
                    >
                      <MapPin className="mx-auto h-7 w-7 text-offbeat-muted/60 mb-2" />
                      <Heading level={4} size="h4" className="text-sm text-offbeat-secondary mb-1">
                        Select a Region from the List
                      </Heading>
                      <Text variant="muted" className="text-xs">
                        Clicking a state reveals its full destination hierarchy and regional
                        insights.
                      </Text>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};
