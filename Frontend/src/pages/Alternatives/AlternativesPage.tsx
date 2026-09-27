import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ArrowLeft, Sparkles } from "lucide-react";

export const AlternativesPage: React.FC = () => {
  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/discovery"
              className="inline-flex items-center gap-1.5 text-xs text-offbeat-muted hover:text-offbeat-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Discoveries
            </Link>
            <Badge variant="accent" size="sm">
              Phase 4 Route Foundation
            </Badge>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Contextual Alternatives
            </span>
            <Heading level={1} size="h1" className="mb-2">
              Find an Alternative
            </Heading>
            <Text variant="lead" className="text-base text-offbeat-secondary max-w-2xl">
              &ldquo;Find an Alternative&rdquo; in OFFBEAT does not simply mean replace a place. It
              means finding a quieter, closer, better-timed, or more authentic way around an
              experience.
            </Text>
          </div>

          <Card variant="flat" padding="lg" className="border-offbeat-border/80 mb-6">
            <Text variant="body" className="text-sm text-offbeat-secondary">
              This engine will evaluate crowd density, peak daylight windows, and nearby
              lesser-known equivalents in Phase 4.
            </Text>
          </Card>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
            <span>
              Alternatives reasoning engine activates in <strong>Phase 4</strong>.
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
