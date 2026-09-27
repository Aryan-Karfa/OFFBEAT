import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { TravelTasteGrid } from "../../components/taste/TravelTasteGrid";
import { TasteSummary } from "../../components/taste/TasteSummary";
import { TRAVEL_TASTES } from "../../features/taste/travelTasteData";
import { INDIA_REGIONS } from "../../features/geography/data";
import { useTasteStore } from "../../stores/tasteStore";
import { useDiscoveryStore } from "../../stores/discoveryStore";
import { ArrowLeft, ArrowRight, Sparkles, MapPin } from "lucide-react";

export const TravelTastePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeRegionId,
    selectedTravelTastes,
    selectedExperienceTastes,
    timeContext,
    toggleTravelTaste,
    resetTastes,
    setActiveRegion,
  } = useTasteStore();

  const { selectedRegion, selectedCountry } = useDiscoveryStore();
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Ensure activeRegionId matches discovery store if a region was selected in Phase 2
  useEffect(() => {
    if (selectedRegion && selectedRegion.id !== activeRegionId) {
      setActiveRegion(selectedCountry?.id || "in", selectedRegion.id);
    }
  }, [selectedRegion, selectedCountry, activeRegionId, setActiveRegion]);

  const currentRegion =
    selectedRegion || INDIA_REGIONS.find((r) => r.id === activeRegionId) || INDIA_REGIONS[0];

  const countryName = selectedCountry?.name || "India";
  const regionName = currentRegion?.name || "West Bengal";

  return (
    <div className="w-full">
      <Section spacing="sm" className="pt-6 pb-16">
        <Container size="xl">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-offbeat-muted"
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
              <span className="text-offbeat-primary font-medium">{regionName}</span>
              <span>/</span>
              <span className="text-offbeat-accent font-semibold">Travel Taste</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-accent font-semibold tracking-wider self-start sm:self-auto">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PHASE 3 — STEP 1: TRAVEL TASTE</span>
            </div>
          </div>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-offbeat-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-offbeat-accent">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Region: {regionName}</span>
                </div>
                <span className="text-offbeat-muted">·</span>
                <Badge variant="accent" size="sm">
                  {selectedTravelTastes.length} Selected
                </Badge>
              </div>

              <Heading level={1} size="h1" className="uppercase tracking-wide">
                What Are You in the Mood For?
              </Heading>

              <Text
                variant="lead"
                className="text-sm sm:text-base text-offbeat-secondary max-w-2xl mt-1"
              >
                Select the broad kinds of travel that appeal to you. Multiple categories can be
                combined naturally to shape your discovery journey in {regionName}.
              </Text>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/country/india/map">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Change Region
                </Button>
              </Link>

              {selectedTravelTastes.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetTastes}>
                  Clear Tastes
                </Button>
              )}
            </div>
          </div>

          {/* Main Content Layout: Grid (8 cols) + Sticky Summary (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              {/* Category Grid */}
              <TravelTasteGrid
                tastes={TRAVEL_TASTES}
                selectedSlugs={selectedTravelTastes}
                onToggle={toggleTravelTaste}
                isReducedMotion={isReducedMotion}
              />

              {/* Bottom Navigation Bar */}
              <div className="p-5 rounded-2xl bg-offbeat-surface border border-offbeat-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-offbeat-secondary">
                  {selectedTravelTastes.length === 0 ? (
                    <span className="italic text-offbeat-muted">
                      Select at least one travel taste to unlock tailored experience nuances.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-offbeat-primary">
                        {selectedTravelTastes.length}
                      </strong>{" "}
                      taste{selectedTravelTastes.length === 1 ? "" : "s"} selected for {regionName}.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    disabled={selectedTravelTastes.length === 0}
                    onClick={() => navigate("/experience-taste")}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-full sm:w-auto font-bold tracking-wider"
                  >
                    CONTINUE TO EXPERIENCE TASTE
                  </Button>
                </div>
              </div>
            </div>

            {/* Side Panel: Taste Summary */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <TasteSummary
                countryName={countryName}
                regionName={regionName}
                travelTastes={selectedTravelTastes}
                experienceTastes={selectedExperienceTastes}
                timeContext={timeContext}
                onReset={resetTastes}
              />

              <div className="p-4 rounded-xl bg-offbeat-surface/40 border border-offbeat-border/60 text-xs text-offbeat-secondary space-y-2">
                <div className="flex items-center gap-1.5 text-offbeat-accent font-semibold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>The OFFBEAT Rule</span>
                </div>
                <p className="text-[11px] text-offbeat-muted leading-relaxed">
                  No rigid questionnaires. Travel Taste captures your broad instinct, unlocking
                  contextual nuances in the next step.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
