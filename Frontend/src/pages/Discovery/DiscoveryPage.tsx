import React from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FEATURED_DISCOVERIES } from "../../features/discovery/data";
import { Sparkles, ArrowLeft, ArrowRight, MapPin } from "lucide-react";

export const DiscoveryPage: React.FC = () => {
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
              Phase 4 Route Foundation
            </Badge>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Discovery Engine
            </span>
            <Heading level={1} size="h1" className="mb-2">
              Discovered Places & Hidden Gems
            </Heading>
            <Text variant="lead" className="text-base text-offbeat-secondary max-w-2xl">
              Authentic community discoveries filtered by region and travel taste.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {FEATURED_DISCOVERIES.map((disc) => (
              <Card
                key={disc.id}
                variant="interactive"
                padding="md"
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={disc.confidence} dot size="sm">
                      {disc.confidence}
                    </Badge>
                    <span className="text-xs font-mono text-offbeat-muted">▲ {disc.upvotes}</span>
                  </div>
                  <Heading level={3} size="h4" className="mb-2 text-offbeat-primary line-clamp-2">
                    {disc.title}
                  </Heading>
                  <div className="flex items-center gap-1.5 text-xs text-offbeat-accent mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {disc.location}, {disc.region}
                    </span>
                  </div>
                  <Text variant="muted" className="text-xs mb-4 line-clamp-3">
                    &ldquo;{disc.snippet}&rdquo;
                  </Text>
                </div>

                <div className="pt-3 border-t border-offbeat-border/50 flex items-center justify-between text-xs">
                  <span className="text-offbeat-secondary">By {disc.author}</span>
                  <Link to={`/place/${disc.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight className="h-3 w-3" />}
                    >
                      Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
            <span>
              AI intelligence, SerpApi live validation, and multi-layered discovery will activate in{" "}
              <strong>Phase 4</strong>.
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
