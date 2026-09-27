import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ExperienceTasteGrid } from "../../components/taste/ExperienceTasteGrid";
import { TimeContextSelector } from "../../components/taste/TimeContextSelector";
import { TasteSummary } from "../../components/taste/TasteSummary";
import { getAvailableExperienceTastes } from "../../features/taste/tasteUtils";
import { INDIA_REGIONS, findRegion } from "../../features/geography/data";
import { useTasteStore } from "../../stores/tasteStore";
import { useDiscoveryStore } from "../../stores/discoveryStore";
import { ArrowLeft, ArrowRight, Sparkles, MapPin, AlertCircle } from "lucide-react";

export const ExperienceTastePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeRegionId,
    selectedTravelTastes,
    selectedExperienceTastes,
    timeContext,
    toggleExperienceTaste,
    setTimeContext,
    resetTastes,
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

  const currentRegion = selectedRegion || findRegion(activeRegionId) || INDIA_REGIONS[0];

  const countryName = selectedCountry?.name || "India";
  const regionName = currentRegion?.name || "West Bengal";

  // Context-dependent experiences calculated from the union of selected travel tastes
  const availableExperiences = getAvailableExperienceTastes(selectedTravelTastes);

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
              <Link to="/travel-taste" className="hover:text-offbeat-primary transition-colors">
                Travel Taste
              </Link>
              <span>/</span>
              <span className="text-offbeat-accent font-semibold">Experience Taste & Time</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-accent font-semibold tracking-wider self-start sm:self-auto">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PHASE 3 — STEP 2: EXPERIENCE TASTE & TIME</span>
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
                <Badge variant="verified" dot size="sm">
                  {selectedExperienceTastes.length} Nuances Chosen
                </Badge>
              </div>

              <Heading level={1} size="h1" className="uppercase tracking-wide">
                What Kind of Experience Are You Looking For?
              </Heading>

              <Text
                variant="lead"
                className="text-sm sm:text-base text-offbeat-secondary max-w-2xl mt-1"
              >
                Contextual nuances tailored to your selected travel tastes. Choose the specific
                textures, pace, and daylight rhythm for your trip.
              </Text>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/travel-taste">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Travel Taste
                </Button>
              </Link>

              {selectedExperienceTastes.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetTastes}>
                  Reset All
                </Button>
              )}
            </div>
          </div>

          {/* Main Layout: Experience Grid & Temporal Selector (8 cols) + Sticky Summary (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-10">
              {/* If user reached experience taste without travel tastes */}
              {selectedTravelTastes.length === 0 ? (
                <div className="p-8 rounded-2xl bg-offbeat-surface border border-offbeat-border text-center space-y-4">
                  <AlertCircle className="h-10 w-10 text-offbeat-accent mx-auto" />
                  <Heading level={3} size="h3">
                    No Travel Tastes Selected Yet
                  </Heading>
                  <Text variant="body" className="text-offbeat-secondary max-w-md mx-auto">
                    Experience nuances are generated dynamically based on what you are drawn to
                    (e.g. Mountains, Beaches, Heritage, Food).
                  </Text>
                  <Link to="/travel-taste">
                    <Button variant="primary" size="md">
                      CHOOSE TRAVEL TASTES FIRST
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Experience Taste Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent">
                        Contextual Experience Nuances
                      </span>
                      <span className="text-xs font-mono text-offbeat-muted">
                        {availableExperiences.length} contextual choices available
                      </span>
                    </div>

                    <ExperienceTasteGrid
                      experiences={availableExperiences}
                      selectedSlugs={selectedExperienceTastes}
                      onToggle={toggleExperienceTaste}
                      isReducedMotion={isReducedMotion}
                    />
                  </div>

                  {/* Day / Night Context Selector */}
                  <div className="pt-8 border-t border-offbeat-border/70">
                    <TimeContextSelector
                      value={timeContext}
                      onChange={setTimeContext}
                      isReducedMotion={isReducedMotion}
                    />
                  </div>

                  {/* Bottom Navigation Control Bar */}
                  <div className="p-5 rounded-2xl bg-offbeat-surface border border-offbeat-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-offbeat-secondary">
                      <span>
                        Intent configured:{" "}
                        <strong className="text-offbeat-primary">
                          {selectedTravelTastes.length}
                        </strong>{" "}
                        tastes,{" "}
                        <strong className="text-offbeat-primary">
                          {selectedExperienceTastes.length}
                        </strong>{" "}
                        experiences,{" "}
                        <strong className="text-offbeat-primary">
                          {timeContext ? timeContext.toUpperCase() : "Anytime"}
                        </strong>
                        .
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link to="/travel-taste">
                        <Button variant="secondary" size="md">
                          Back
                        </Button>
                      </Link>

                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/discovery-context")}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                        className="font-bold tracking-wider shadow-glow"
                      >
                        VIEW DISCOVERY CONTEXT
                      </Button>
                    </div>
                  </div>
                </>
              )}
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
                  <span>Dynamic Invalidation Rule</span>
                </div>
                <p className="text-[11px] text-offbeat-muted leading-relaxed">
                  If you deselect a broad Travel Taste, any dependent experience nuances that no
                  longer have support are automatically pruned, guaranteeing no stale traveler
                  context.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
