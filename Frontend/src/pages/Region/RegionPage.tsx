import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { INDIA_REGIONS } from "../../features/geography/data";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";

export const RegionPage: React.FC = () => {
  const { regionId } = useParams<{ regionId: string }>();
  const region = INDIA_REGIONS.find((r) => r.id === regionId) || INDIA_REGIONS[0];

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
            <div className="flex items-center gap-2 text-xs font-semibold text-offbeat-accent uppercase tracking-widest mb-3">
              <Compass className="h-4 w-4" />
              <span>Phase 2 Destination Target</span>
            </div>

            <Heading
              level={1}
              size="display"
              className="text-3xl sm:text-5xl uppercase tracking-wide mb-3"
            >
              {region?.name}
            </Heading>

            <Text variant="lead" className="text-offbeat-secondary mb-6 italic">
              &ldquo;{region?.tagline}&rdquo;
            </Text>

            <div className="p-4 rounded-lg bg-offbeat-surface border border-offbeat-border mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-offbeat-primary block mb-1">
                Regional Highlight
              </span>
              <p className="text-sm text-offbeat-secondary">{region?.highlight}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {region?.tags.map((tag) => (
                <Badge key={tag} variant="tag" size="md">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-offbeat-elevated border border-offbeat-border/80 flex items-center gap-3 text-xs text-offbeat-muted">
              <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
              <span>
                The full <strong>SELECT → RISE → FOCUS → REVEAL → EXPLORE</strong> geographic
                experience will be activated in <strong>Phase 2</strong>.
              </span>
            </div>

            <div className="mt-8 flex gap-4">
              <Link to="/country/india/map">
                <Button variant="secondary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back to Interactive Map
                </Button>
              </Link>
              <Link to="/travel-taste">
                <Button variant="primary" size="md">
                  Preview Travel Taste (Phase 3)
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};
