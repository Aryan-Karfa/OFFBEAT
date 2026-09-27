import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { INDIA_REGIONS, findRegion } from "../../features/geography/data";
import { useTasteStore } from "../../stores/tasteStore";
import { ArrowLeft, Compass, Sparkles, MapPin, ArrowRight } from "lucide-react";

export const RegionPage: React.FC = () => {
  const { regionId } = useParams<{ regionId: string }>();
  const region = findRegion(regionId) || INDIA_REGIONS[0];

  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-xs text-offbeat-muted"
          >
            <Link to="/" className="hover:text-offbeat-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/country" className="hover:text-offbeat-primary transition-colors">
              Country
            </Link>
            <span>/</span>
            <Link to="/country/india/map" className="hover:text-offbeat-primary transition-colors">
              India Map
            </Link>
            <span>/</span>
            <span className="text-offbeat-accent font-medium">{region?.name}</span>
          </nav>

          <Card variant="elevated" padding="lg" className="border-offbeat-accent/30 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-offbeat-accent uppercase tracking-widest">
                <Compass className="h-4 w-4" />
                <span>
                  {region?.type === "UNION_TERRITORY" ? "Union Territory" : "State"} ·{" "}
                  {region?.zone} India
                </span>
              </div>
              <Badge variant="verified" dot size="sm">
                {region?.discoveryCount} Discoveries
              </Badge>
            </div>

            <Heading
              level={1}
              size="display"
              className="text-3xl sm:text-5xl uppercase tracking-wide mb-3"
            >
              {region?.name}
            </Heading>

            <Text variant="lead" className="text-offbeat-secondary mb-4 italic">
              &ldquo;{region?.tagline}&rdquo;
            </Text>

            <Text variant="body" className="text-sm text-offbeat-secondary/90 leading-relaxed mb-6">
              {region?.description}
            </Text>

            <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-offbeat-accent block mb-1">
                Regional Highlight
              </span>
              <p className="text-sm text-offbeat-primary/95">{region?.highlight}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {region?.tags.map((tag) => (
                <Badge key={tag} variant="tag" size="md">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* REGION -> DESTINATIONS Relationship Display */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between border-b border-offbeat-border/70 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-offbeat-primary">
                  Key Destinations in {region?.name}
                </span>
                <span className="text-xs font-mono text-offbeat-muted">
                  {region?.destinations.length} Catalogued Hubs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {region?.destinations.map((dest) => (
                  <Card
                    key={dest.id}
                    variant="flat"
                    padding="md"
                    className="border-offbeat-border/70"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-offbeat-accent" />
                        <span className="font-semibold text-sm text-offbeat-primary">
                          {dest.name}
                        </span>
                      </div>
                      <Badge variant="outline" size="sm">
                        {dest.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-offbeat-secondary italic mb-2 pl-6">
                      {dest.tagline}
                    </p>
                    <p className="text-xs text-offbeat-muted pl-6">{dest.highlight}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-offbeat-elevated border border-offbeat-border/80 flex items-center gap-3 text-xs text-offbeat-muted">
              <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
              <span>
                Region selected. Shape your travel and experience preferences in{" "}
                <strong className="text-offbeat-primary">Phase 3</strong>.
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/country/india/map">
                <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Interactive Map
                </Button>
              </Link>
              <Link
                to="/travel-taste"
                onClick={() => {
                  if (region) {
                    useTasteStore.getState().setActiveRegion("in", region.id);
                  }
                }}
              >
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="font-bold tracking-wider shadow-glow"
                >
                  LET&apos;S DISCOVER {region?.name.toUpperCase()}
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};
