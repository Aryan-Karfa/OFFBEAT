import React from "react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ShoppingBag, Sparkles } from "lucide-react";

export const TakeHomePage: React.FC = () => {
  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-offbeat-muted">
              OFFBEAT / TAKE HOME
            </span>
            <Badge variant="accent" size="sm">
              Phase 6 Route Foundation
            </Badge>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Cultural Preservation
            </span>
            <Heading level={1} size="h1" className="mb-2">
              TAKE HOME
            </Heading>
            <Text variant="lead" className="text-base text-offbeat-secondary max-w-2xl">
              Authentic local crafts, seasonal harvests, and indigenous artisan traditions to
              directly support local communities.
            </Text>
          </div>

          <Card variant="flat" padding="lg" className="border-offbeat-border/80 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="h-5 w-5 text-offbeat-accent" />
              <Heading level={3} size="h4">
                Direct Community Sourcing
              </Heading>
            </div>
            <Text variant="muted" className="text-xs">
              Hand-spun Pashmina from Changthang cooperatives, Terracotta from Bishnupur, Dokra
              brass castings from Bikna, and Single-Estate Darjeeling first-flush teas.
            </Text>
          </Card>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
            <span>
              Artisan directory and verified provenance will be activated in{" "}
              <strong>Phase 6</strong>.
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
