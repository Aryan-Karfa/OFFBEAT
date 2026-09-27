import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { TRAVEL_TASTE_CATEGORIES } from "../../features/discovery/data";
import { Sparkles, ArrowLeft } from "lucide-react";

export const TravelTastePage: React.FC = () => {
  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/country/india/map"
              className="inline-flex items-center gap-1.5 text-xs text-offbeat-muted hover:text-offbeat-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Map
            </Link>
            <Badge variant="accent" size="sm">
              Phase 3 Route Foundation
            </Badge>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Taste Discovery
            </span>
            <Heading level={1} size="h1" className="mb-2">
              What Are You in the Mood For?
            </Heading>
            <Text variant="lead" className="text-base text-offbeat-secondary max-w-2xl">
              Select multiple moods and textures of exploration. In Phase 3, these will directly
              filter and rank authentic community discoveries.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {TRAVEL_TASTE_CATEGORIES.map((cat) => (
              <Card key={cat.id} variant="interactive" padding="md">
                <div className="text-3xl mb-3">{cat.icon}</div>
                <Heading level={3} size="h4" className="mb-1">
                  {cat.name}
                </Heading>
                <Text variant="muted" className="text-xs mb-4">
                  {cat.descriptor}
                </Text>
                <div className="flex flex-wrap gap-1">
                  {cat.examples.map((ex) => (
                    <Badge key={ex} variant="outline" size="sm">
                      {ex}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
            <span>
              Multi-taste selection state and vector matching will be fully wired in{" "}
              <strong>Phase 3</strong>.
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
