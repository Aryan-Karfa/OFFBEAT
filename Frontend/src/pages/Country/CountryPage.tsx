import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles, Compass } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FEATURED_COUNTRIES } from "../../features/geography/data";

export const CountryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filtered = FEATURED_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full">
      <Section spacing="lg" className="pt-8 sm:pt-12">
        <Container size="xl">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-xs text-offbeat-muted"
          >
            <Link to="/" className="hover:text-offbeat-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-offbeat-accent font-medium">Countries</span>
          </nav>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-offbeat-border">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-accent mb-3 font-semibold tracking-wider">
                <Compass className="h-3.5 w-3.5" />
                <span>PHASE 1 JOURNEY — STEP 2</span>
              </div>
              <Heading level={1} size="h1" className="mb-2 uppercase tracking-wide">
                Where Do You Want to Explore?
              </Heading>
              <Text variant="lead" className="max-w-xl text-offbeat-secondary text-base">
                Select a country to enter its interactive geographic discovery map.
              </Text>
            </div>

            {/* Search Country Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-offbeat-muted" />
              <input
                type="search"
                aria-label="Search countries"
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-offbeat-surface border border-offbeat-border text-sm text-offbeat-primary placeholder:text-offbeat-muted focus:border-offbeat-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Featured Country Spotlight — India */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent">
                Primary Discovery Canvas
              </span>
              <Badge variant="accent" size="sm">
                Active Subcontinent
              </Badge>
            </div>

            <Card
              variant="elevated"
              padding="lg"
              className="relative overflow-hidden border-offbeat-accent/40 bg-gradient-to-br from-offbeat-surface via-offbeat-elevated to-offbeat-dark group"
            >
              <div className="absolute top-0 right-0 h-64 w-64 bg-offbeat-accent/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-offbeat-dark border border-offbeat-border text-offbeat-accent">
                      IND · 36 Regions
                    </span>
                    <Badge variant="verified" dot size="sm">
                      1,420+ Community Discoveries
                    </Badge>
                  </div>

                  <Heading
                    level={2}
                    size="display"
                    className="text-3xl sm:text-4xl lg:text-5xl text-offbeat-primary"
                  >
                    INDIA
                  </Heading>

                  <Text variant="lead" className="text-base text-offbeat-primary/90 font-medium">
                    28 States · 8 Union Territories · Countless Living Micro-Cultures
                  </Text>

                  <Text variant="body" className="text-sm text-offbeat-secondary max-w-2xl">
                    From the glacial passes and monasteries of Ladakh and Sikkim to the spice groves
                    of Kerala and the terracotta temples of West Bengal, discover places through the
                    people who cherish them.
                  </Text>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link to="/country/india/map">
                      <Button
                        variant="primary"
                        size="lg"
                        rightIcon={<ArrowRight className="h-5 w-5" />}
                        className="shadow-glow"
                      >
                        EXPLORE INTERACTIVE MAP
                      </Button>
                    </Link>

                    <Link to="/country/india/map">
                      <Button variant="secondary" size="lg">
                        Browse Regions as List
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Country Quick Highlights Panel */}
                <div className="p-5 rounded-xl bg-offbeat-dark/70 border border-offbeat-border/80 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-offbeat-accent border-b border-offbeat-border/60 pb-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Discovery Highlights</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-offbeat-primary block">
                        Himalayan Valleys
                      </span>
                      <span className="text-offbeat-muted">
                        Ladakh, Himachal Pradesh, Uttarakhand, Sikkim
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-offbeat-primary block">
                        Ancient Arches & Stepwells
                      </span>
                      <span className="text-offbeat-muted">Rajasthan, Madhya Pradesh, Gujarat</span>
                    </div>
                    <div>
                      <span className="font-semibold text-offbeat-primary block">
                        Monsoon Ghats & Waterways
                      </span>
                      <span className="text-offbeat-muted">Kerala, Karnataka, Goa</span>
                    </div>
                    <div>
                      <span className="font-semibold text-offbeat-primary block">
                        Living Heritage & Mangroves
                      </span>
                      <span className="text-offbeat-muted">West Bengal, Odisha, Meghalaya</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Upcoming Global Horizons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-offbeat-secondary">
                Upcoming Discovery Subcontinents
              </span>
              <span className="text-xs text-offbeat-muted">Expanding in Future Phases</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered
                .filter((c) => !c.isAvailable)
                .map((country) => (
                  <Card
                    key={country.id}
                    variant="flat"
                    padding="md"
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Heading level={3} size="h4" className="text-offbeat-primary">
                        {country.name}
                      </Heading>
                      <Badge variant="tag" size="sm">
                        Coming Soon
                      </Badge>
                    </div>

                    <Text variant="muted" className="text-xs mb-3 italic">
                      {country.tagline}
                    </Text>

                    <Text variant="small" className="text-offbeat-muted text-xs line-clamp-2 mb-4">
                      {country.description}
                    </Text>

                    <div className="pt-2 border-t border-offbeat-border/40 text-xs text-offbeat-muted">
                      {country.regionsCount} Regions Catalogued
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};
