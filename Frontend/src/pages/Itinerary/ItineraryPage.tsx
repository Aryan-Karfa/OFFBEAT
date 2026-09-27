import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Sparkles, MapPin } from "lucide-react";

export const ItineraryPage: React.FC = () => {
  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-offbeat-muted">
              OFFBEAT / ITINERARY
            </span>
            <Badge variant="accent" size="sm">
              Phase 5 Route Foundation
            </Badge>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Journey Flow
            </span>
            <Heading level={1} size="h1" className="mb-2">
              Your Itinerary
            </Heading>
            <Text variant="lead" className="text-base text-offbeat-secondary max-w-2xl">
              Day-by-day discovery journeys balanced for travel pace, morning light, and local
              tempo.
            </Text>
          </div>

          <Card
            variant="flat"
            padding="lg"
            className="border-dashed border-offbeat-border text-center py-12 mb-8"
          >
            <MapPin className="mx-auto h-8 w-8 text-offbeat-muted mb-3 animate-bounce" />
            <Heading level={3} size="h4" className="text-offbeat-primary mb-2">
              No places saved yet
            </Heading>
            <Text variant="muted" className="text-xs max-w-sm mx-auto mb-6">
              Start by exploring the interactive map to discover authentic community spots to add to
              your journey.
            </Text>
            <Link to="/country/india/map">
              <Button variant="primary" size="md">
                START DISCOVERING
              </Button>
            </Link>
          </Card>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
            <span>
              Multi-day route building and pacing algorithms will be established in{" "}
              <strong>Phase 5</strong>.
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
