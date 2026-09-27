import React from "react";
import { Link } from "react-router-dom";
import { Map, List, Compass, Info, Filter } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Badge } from "../../components/ui/Badge";
import { InteractiveMapFoundation } from "../../components/map/InteractiveMapFoundation";
import { RegionDrawer } from "../../components/map/RegionDrawer";
import { RegionListFallback } from "../../components/map/RegionListFallback";
import { useDiscoveryStore } from "../../stores/discoveryStore";
import { INDIA_REGIONS } from "../../features/geography/data";
import type { Region } from "../../types/geography";
import { cn } from "../../utils/cn";

export const InteractiveMapPage: React.FC = () => {
  const {
    selectedRegion,
    setSelectedRegion,
    hoveredRegion,
    setHoveredRegion,
    viewMode,
    setViewMode,
  } = useDiscoveryStore();

  // Default to West Bengal if none selected initially to demonstrate the UI/UX spec preview
  const activeRegion = selectedRegion || hoveredRegion || INDIA_REGIONS[0] || null;

  const handleSelectRegion = (region: Region) => {
    setSelectedRegion(region);
  };

  return (
    <div className="w-full">
      <Section spacing="sm" className="pt-6 pb-12">
        <Container size="xl">
          {/* Top Breadcrumbs & Phase 1 Pill */}
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
              <span className="text-offbeat-accent font-semibold">Interactive Map</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-accent font-semibold tracking-wider self-start sm:self-auto">
              <Compass className="h-3.5 w-3.5" />
              <span>PHASE 1 JOURNEY — STEP 3: INTERACTIVE MAP</span>
            </div>
          </div>

          {/* Page Heading & View Toggle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-offbeat-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent">
                  Geographic Discovery Surface
                </span>
                <span className="text-offbeat-muted">·</span>
                <Badge variant="verified" dot size="sm">
                  Subcontinent of India
                </Badge>
              </div>
              <Heading level={1} size="h1" className="uppercase tracking-wide">
                Interactive Map Foundation
              </Heading>
              <Text
                variant="lead"
                className="text-sm sm:text-base text-offbeat-secondary max-w-2xl mt-1"
              >
                Explore the geography of 36 Indian States and Union Territories. Select any region
                to inspect local highlights and prepare for travel taste discovery.
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
                  onSelectRegion={handleSelectRegion}
                  onHoverRegion={setHoveredRegion}
                />

                {/* Quick accessible region chips below the map */}
                <div className="p-4 rounded-xl bg-offbeat-surface/60 border border-offbeat-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-offbeat-secondary font-medium">
                    <Filter className="h-3.5 w-3.5 text-offbeat-accent" />
                    <span>Quick Region Jump:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {INDIA_REGIONS.slice(0, 6).map((reg) => (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => handleSelectRegion(reg)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium transition-colors select-none",
                          selectedRegion?.id === reg.id
                            ? "bg-offbeat-accent text-offbeat-dark font-bold"
                            : "bg-offbeat-elevated text-offbeat-secondary hover:text-offbeat-primary",
                        )}
                      >
                        {reg.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Region Context Drawer & Details (4 Cols on Desktop) */}
              <div className="lg:col-span-4 flex flex-col space-y-6">
                <RegionDrawer region={activeRegion} onClose={() => setSelectedRegion(null)} />

                {/* Architectural Note Card */}
                <div className="p-4 rounded-xl bg-offbeat-surface/40 border border-offbeat-border/60 text-xs text-offbeat-secondary space-y-2">
                  <div className="flex items-center gap-1.5 text-offbeat-accent font-semibold uppercase tracking-wider">
                    <Info className="h-3.5 w-3.5" />
                    <span>Phase 1 Architectural Scope</span>
                  </div>
                  <p className="leading-relaxed text-offbeat-muted">
                    This establishes the visual map viewport, vector geography, coordinate
                    projection, and responsive layout. Phase 2 will layer the signature{" "}
                    <strong className="text-offbeat-primary">
                      SELECT → RISE → FOCUS → REVEAL → EXPLORE
                    </strong>{" "}
                    elevation animation onto this foundation.
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
                  <RegionDrawer region={activeRegion} onClose={() => setSelectedRegion(null)} />
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};
