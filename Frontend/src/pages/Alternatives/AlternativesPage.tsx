import React, { useEffect } from "react";
import { useSearchParams, useParams, Link, useNavigate } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Compass,
  Cpu,
  Layers,
  MapPin,
} from "lucide-react";
import { useAlternativesStore } from "../../stores/alternativesStore";
import {
  AlternativeModeSelector,
  OriginalPlaceBanner,
  AlternativeCard,
  AlternativesMap,
} from "../../features/alternatives";
import type { AlternativeMode } from "@offbeat/shared";

export const AlternativesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { placeId: routePlaceId } = useParams<{ placeId?: string }>();
  const navigate = useNavigate();

  const placeId = routePlaceId || searchParams.get("placeId") || "place_tiger_hill";
  const urlMode = (searchParams.get("mode") as AlternativeMode) || "REPLACEMENT";

  const {
    originalPlace,
    selectedMode,
    loading,
    results,
    reasoning,
    fallback,
    error,
    selectedAlternative,
    setMode,
    selectAlternative,
    fetchAlternatives,
  } = useAlternativesStore();

  useEffect(() => {
    // Sync URL mode to store and fetch alternatives
    fetchAlternatives(placeId, { mode: urlMode });
  }, [placeId, urlMode, fetchAlternatives]);

  const handleModeChange = (newMode: AlternativeMode) => {
    setSearchParams({ placeId, mode: newMode });
    setMode(newMode);
  };

  const primaryCandidate = results[0];
  const primaryName = primaryCandidate ? primaryCandidate.name : undefined;

  return (
    <div className="w-full min-h-screen pb-16">
      <Section spacing="sm" className="pt-6">
        <Container size="xl">
          {/* Top Breadcrumb & Status */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              to={`/place/${placeId}`}
              className="inline-flex items-center gap-1.5 text-xs text-offbeat-muted hover:text-offbeat-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Place Details
            </Link>

            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">
                Phase 12 Intelligent Alternatives
              </Badge>
              {reasoning && !fallback && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> Gemini 3.8 Intelligence
                </span>
              )}
              {fallback && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-offbeat-dark border border-offbeat-border text-offbeat-muted flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Deterministic Pipeline
                </span>
              )}
            </div>
          </div>

          {/* Original Place Anchor Banner */}
          {originalPlace && (
            <OriginalPlaceBanner
              originalPlace={originalPlace}
              mode={selectedMode}
              primaryAlternativeName={primaryName}
            />
          )}

          {/* Alternative Mode Selection */}
          <AlternativeModeSelector
            selectedMode={selectedMode}
            onSelectMode={handleModeChange}
            disabled={loading}
          />

          {/* Gemini or Engine Strategic Overview */}
          {reasoning && !loading && (
            <Card
              variant="elevated"
              padding="md"
              className="border-offbeat-border/80 bg-offbeat-surface mb-8 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-offbeat-dark text-offbeat-accent shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-offbeat-accent">
                      {fallback ? "OFFBEAT Strategy Synthesis" : "Gemini 3.8 Strategy Synthesis"}
                    </span>
                    <Badge variant={fallback ? "tag" : "verified"} size="sm">
                      {fallback ? "Deterministic Guard" : "AI Multi-Signal Reasoned"}
                    </Badge>
                  </div>
                  <p className="text-sm text-offbeat-secondary leading-relaxed">
                    {reasoning.explanation}
                  </p>

                  {reasoning.tradeoff && (
                    <div className="mt-2.5 pt-2 border-t border-offbeat-border/60 text-xs text-amber-300/90 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span>{reasoning.tradeoff}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center gap-3 text-offbeat-muted py-6">
                <div className="h-5 w-5 border-2 border-offbeat-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">
                  Evaluating candidates across geography, taste, crowd, and time...
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Card
                    key={n}
                    variant="elevated"
                    padding="lg"
                    className="border-offbeat-border/40 animate-pulse h-72"
                  >
                    <div className="h-4 w-24 bg-offbeat-dark rounded mb-3" />
                    <div className="h-6 w-48 bg-offbeat-dark rounded mb-4" />
                    <div className="h-20 bg-offbeat-dark/60 rounded mb-4" />
                    <div className="h-8 bg-offbeat-dark/40 rounded mt-auto" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <Card
              variant="elevated"
              padding="lg"
              className="border-red-500/40 bg-red-950/10 text-center py-12 mb-8"
            >
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-offbeat-primary mb-2">
                Unable to load alternatives
              </h3>
              <p className="text-sm text-offbeat-secondary max-w-md mx-auto mb-5">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAlternatives(placeId, { mode: selectedMode })}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Try Again
              </Button>
            </Card>
          )}

          {/* Empty Candidates State */}
          {!loading && !error && results.length === 0 && (
            <Card
              variant="elevated"
              padding="lg"
              className="border-offbeat-border/80 bg-offbeat-surface text-center py-12 mb-8"
            >
              <Compass className="h-10 w-10 text-offbeat-muted mx-auto mb-3" />
              <h3 className="text-lg font-bold text-offbeat-primary mb-2">
                No immediate alternatives found
              </h3>
              <p className="text-sm text-offbeat-secondary max-w-md mx-auto mb-5">
                OFFBEAT couldn&apos;t find a strong alternative matching this specific mode yet. Try a different strategy or broaden your travel taste.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModeChange("NEARBY_DISCOVERY")}
                >
                  Explore Nearby Hidden Gems
                </Button>
                <Link to={`/place/${placeId}`}>
                  <Button variant="primary" size="sm">
                    Back to Place
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Results Grid + Map */}
          {!loading && !error && results.length > 0 && originalPlace && (
            <>
              {/* Spatial Map Visualizer */}
              <AlternativesMap
                originalPlace={originalPlace}
                alternatives={results}
                mode={selectedMode}
                selectedCandidateId={selectedAlternative?.placeId || selectedAlternative?.externalId}
                onSelectCandidate={selectAlternative}
              />

              {/* Candidates Grid */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-offbeat-primary">
                    Curated Alternatives ({results.length})
                  </h3>
                  <p className="text-xs text-offbeat-muted">
                    Filtered and scored deterministically, synthesized by OFFBEAT intelligence
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((candidate, idx) => (
                  <AlternativeCard
                    key={candidate.placeId || candidate.externalId || idx}
                    candidate={candidate}
                    mode={selectedMode}
                    isPrimary={idx === 0}
                    isAiReasoned={!fallback && Boolean(reasoning)}
                    isSelected={
                      selectedAlternative?.placeId === candidate.placeId ||
                      selectedAlternative?.externalId === candidate.externalId
                    }
                    onSelect={() => selectAlternative(candidate)}
                  />
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>
    </div>
  );
};
