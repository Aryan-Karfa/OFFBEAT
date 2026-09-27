import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Sparkles, ArrowLeft } from "lucide-react";

export const ExperienceTastePage: React.FC = () => {
  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/travel-taste"
              className="inline-flex items-center gap-1.5 text-xs text-offbeat-muted hover:text-offbeat-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Travel Taste
            </Link>
            <Badge variant="tag" size="sm">
              Phase 3 Route Foundation
            </Badge>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Deep Experience Preferences
            </span>
            <Heading level={1} size="h1" className="mb-2">
              Experience Taste & Nuance
            </Heading>
            <Text variant="lead" className="text-base text-offbeat-secondary max-w-2xl">
              Fine-tune the rhythm, physical pace, daylight balance, and solitude levels for your
              discovery session.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card variant="flat" padding="lg">
              <Heading level={3} size="h4" className="mb-2">
                Day / Night Balance
              </Heading>
              <Text variant="muted" className="text-xs mb-4">
                Dawn photography ridge walks vs. vibrant night bazaar explorations and late-night
                star sanctuaries.
              </Text>
              <Badge variant="outline" size="sm">
                Configurable in Phase 3
              </Badge>
            </Card>

            <Card variant="flat" padding="lg">
              <Heading level={3} size="h4" className="mb-2">
                Solitude & Crowd Tolerance
              </Heading>
              <Text variant="muted" className="text-xs mb-4">
                Total remote solitude vs. communal village festivals and shared boat waterways.
              </Text>
              <Badge variant="outline" size="sm">
                Configurable in Phase 3
              </Badge>
            </Card>
          </div>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
            <span>
              Full experience taste profiles will be introduced in <strong>Phase 3</strong>.
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
