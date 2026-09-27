import React from "react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FEATURED_DISCOVERIES } from "../../features/discovery/data";
import { Sparkles, PlusCircle, MapPin } from "lucide-react";

export const CommunityPage: React.FC = () => {
  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
                The Living Network
              </span>
              <Heading level={1} size="h1" className="mb-2">
                Community Discoveries
              </Heading>
              <Text variant="lead" className="text-base text-offbeat-secondary max-w-xl">
                Real discoveries shared by travelers. Verified by peers, not algorithms.
              </Text>
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              className="self-start sm:self-auto"
            >
              SHARE A DISCOVERY
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {FEATURED_DISCOVERIES.map((disc) => (
              <Card
                key={disc.id}
                variant="elevated"
                padding="md"
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={disc.confidence} dot size="sm">
                      {disc.confidence === "verified"
                        ? "Community Verified"
                        : disc.confidence === "supported"
                          ? "Community Supported"
                          : "New Discovery"}
                    </Badge>
                    <span className="text-xs font-mono text-offbeat-muted">▲ {disc.upvotes}</span>
                  </div>

                  <Heading level={3} size="h4" className="text-base font-bold mb-2">
                    {disc.title}
                  </Heading>

                  <div className="flex items-center gap-1.5 text-xs text-offbeat-accent mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {disc.location}, {disc.region}
                    </span>
                  </div>

                  <Text variant="muted" className="text-xs mb-4">
                    &ldquo;{disc.snippet}&rdquo;
                  </Text>
                </div>

                <div className="pt-3 border-t border-offbeat-border/60 flex items-center justify-between text-xs text-offbeat-secondary">
                  <span>By {disc.author}</span>
                  <Badge variant="outline" size="sm">
                    {disc.tags[0]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
            <span>
              Community verification voting, badge elevation, and traveler contributions will
              activate in <strong>Phase 7</strong>.
            </span>
          </div>
        </Container>
      </Section>
    </div>
  );
};
