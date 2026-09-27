import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  buildDiscoveryContext,
  getTravelTasteBySlug,
  getExperienceTasteBySlug,
} from "../../features/taste/tasteUtils";
import { INDIA_REGIONS, findRegion } from "../../features/geography/data";
import { useTasteStore } from "../../stores/tasteStore";
import { useDiscoveryStore } from "../../stores/discoveryStore";
import {
  Compass,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Code,
  Copy,
  Check,
} from "lucide-react";

export const DiscoveryContextPage: React.FC = () => {
  const {
    activeRegionId,
    selectedTravelTastes,
    selectedExperienceTastes,
    timeContext,
    resetTastes,
  } = useTasteStore();

  const { selectedRegion, selectedCountry } = useDiscoveryStore();
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);

  const currentRegion = selectedRegion || findRegion(activeRegionId) || INDIA_REGIONS[0];

  const countryName = selectedCountry?.name || "India";
  const regionName = currentRegion?.name || "West Bengal";

  // Build the normalized DiscoveryContext object
  const discoveryContext = buildDiscoveryContext(
    countryName,
    regionName,
    selectedTravelTastes,
    selectedExperienceTastes,
    timeContext,
  );

  const jsonString = JSON.stringify(discoveryContext, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full">
      <Section spacing="sm" className="pt-6 pb-20">
        <Container size="lg">
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
              <Link to="/experience-taste" className="hover:text-offbeat-primary transition-colors">
                Experience Taste
              </Link>
              <span>/</span>
              <span className="text-offbeat-accent font-semibold">Discovery Context Ready</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-offbeat-surface border border-offbeat-border text-xs text-confidence-verified font-semibold tracking-wider self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>PHASE 3 COMPLETE — INTENT CAPTURED</span>
            </div>
          </div>

          {/* Milestone Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Your OFFBEAT Discovery Context
            </span>
            <Heading
              level={1}
              size="display"
              className="text-3xl sm:text-5xl uppercase tracking-wide mb-3"
            >
              Ready to Discover
            </Heading>
            <Text variant="lead" className="text-sm sm:text-base text-offbeat-secondary">
              You have successfully defined what you love, where you want to explore, and how you
              want to travel.
            </Text>
          </div>

          {/* Central Normalized Context Card */}
          <Card
            variant="elevated"
            padding="lg"
            className="relative overflow-hidden border-offbeat-accent/50 bg-gradient-to-br from-offbeat-surface via-offbeat-elevated to-offbeat-dark shadow-elevated mb-8"
          >
            <div className="absolute top-0 right-0 h-64 w-64 bg-offbeat-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-offbeat-border/70">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-offbeat-dark border border-offbeat-accent/50 flex items-center justify-center text-offbeat-accent shadow-md">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-offbeat-muted">
                      Target Subcontinent & Province
                    </span>
                    <h2 className="font-display text-2xl font-bold text-offbeat-primary uppercase tracking-wide">
                      {regionName}, {countryName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="verified" dot size="md">
                    Intent Verified
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJsonInspector(!showJsonInspector)}
                    leftIcon={<Code className="h-3.5 w-3.5" />}
                    className="text-xs"
                  >
                    {showJsonInspector ? "Hide JSON" : "Inspect Payload"}
                  </Button>
                </div>
              </div>

              {/* Discovery Context Triple Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Travel Tastes */}
                <div className="p-4 rounded-xl bg-offbeat-dark/60 border border-offbeat-border/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-offbeat-accent">
                      Travel Taste
                    </span>
                    <Link
                      to="/travel-taste"
                      className="text-offbeat-muted hover:text-offbeat-primary"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedTravelTastes.length > 0 ? (
                      selectedTravelTastes.map((slug) => {
                        const item = getTravelTasteBySlug(slug);
                        return (
                          <Badge key={slug} variant="accent" size="sm" className="gap-1">
                            <span>{item?.icon}</span>
                            <span>{item?.name || slug}</span>
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-xs text-offbeat-muted italic">None selected</span>
                    )}
                  </div>
                </div>

                {/* 2. Experience Nuances */}
                <div className="p-4 rounded-xl bg-offbeat-dark/60 border border-offbeat-border/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-offbeat-accent">
                      Experience Taste
                    </span>
                    <Link
                      to="/experience-taste"
                      className="text-offbeat-muted hover:text-offbeat-primary"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedExperienceTastes.length > 0 ? (
                      selectedExperienceTastes.map((slug) => {
                        const item = getExperienceTasteBySlug(slug);
                        return (
                          <Badge key={slug} variant="tag" size="sm" className="gap-1">
                            <span>{item?.icon}</span>
                            <span>{item?.name || slug}</span>
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-xs text-offbeat-muted italic">None selected</span>
                    )}
                  </div>
                </div>

                {/* 3. Temporal Rhythm */}
                <div className="p-4 rounded-xl bg-offbeat-dark/60 border border-offbeat-border/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-offbeat-accent">
                      Temporal Context
                    </span>
                    <Link
                      to="/experience-taste"
                      className="text-offbeat-muted hover:text-offbeat-primary"
                    >
                      Edit
                    </Link>
                  </div>
                  <div className="pt-1">
                    {timeContext === "day" ? (
                      <Badge variant="supported" size="md" className="gap-1.5 font-bold">
                        <Sun className="h-4 w-4 text-amber-400" />
                        <span>☀️ DAYLIGHT EXPLORATION</span>
                      </Badge>
                    ) : timeContext === "night" ? (
                      <Badge variant="accent" size="md" className="gap-1.5 font-bold">
                        <Moon className="h-4 w-4 text-indigo-400" />
                        <span>🌙 NOCTURNAL & STARLIGHT</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="md">
                        ANYTIME
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* JSON Payload Inspector */}
              {showJsonInspector && (
                <div className="p-4 rounded-xl bg-[#070809] border border-offbeat-border font-mono text-xs text-offbeat-secondary relative space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-offbeat-muted border-b border-offbeat-border/50 pb-2">
                    <span>Normalized DiscoveryContext Payload (RFC 8259)</span>
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="inline-flex items-center gap-1 text-offbeat-accent hover:underline cursor-pointer"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-emerald-400 py-2 leading-relaxed">
                    {jsonString}
                  </pre>
                </div>
              )}

              {/* Architecture Boundary Card */}
              <div className="p-4 rounded-xl bg-offbeat-dark/80 border border-offbeat-border/80 flex items-start gap-3.5 text-xs">
                <Sparkles className="h-5 w-5 text-offbeat-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-offbeat-primary block uppercase tracking-wider">
                    Phase 3 Scope Boundary Respected
                  </span>
                  <p className="text-offbeat-muted leading-relaxed">
                    This traveler intent object is persisted in local storage and will be consumed
                    by Phase 4 intelligence systems to match verified community gems and places
                    without generic ranking algorithms.
                  </p>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-offbeat-border/70">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link to="/experience-taste" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="md"
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                      className="w-full sm:w-auto"
                    >
                      Refine Preferences
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={resetTastes}
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                  >
                    Reset Intent
                  </Button>
                </div>

                <Link to="/discovery" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                    className="w-full sm:w-auto font-bold tracking-wider shadow-glow"
                  >
                    DISCOVER {regionName.toUpperCase()}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};
