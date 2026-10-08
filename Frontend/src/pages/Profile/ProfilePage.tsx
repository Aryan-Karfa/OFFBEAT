import React from "react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { User, Bookmark, Compass, Sparkles } from "lucide-react";

export const ProfilePage: React.FC = () => {
  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-offbeat-surface border-2 border-offbeat-accent flex items-center justify-center text-offbeat-accent">
                <User className="h-8 w-8" />
              </div>
              <div>
                <Heading level={1} size="h2" className="text-xl sm:text-2xl">
                  Traveler Profile
                </Heading>
                <Text variant="muted" className="text-xs">
                  Explorer of the Uncharted · Joined OFFBEAT
                </Text>
              </div>
            </div>

            <Badge variant="accent" size="sm">
              Verified Traveler
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card variant="flat" padding="md">
              <div className="flex items-center gap-2 mb-2 text-offbeat-primary font-semibold text-sm">
                <Compass className="h-4 w-4 text-offbeat-accent" />
                <span>Travel Taste Archetype</span>
              </div>
              <Text variant="muted" className="text-xs mb-3">
                Mountain solitude, ancient stepwells, and sunrise photography.
              </Text>
              <Badge variant="outline" size="sm">
                Himalayan Explorer
              </Badge>
            </Card>

            <Card variant="flat" padding="md">
              <div className="flex items-center gap-2 mb-2 text-offbeat-primary font-semibold text-sm">
                <Bookmark className="h-4 w-4 text-offbeat-accent" />
                <span>Saved Places</span>
              </div>
              <Text variant="muted" className="text-xs mb-3">
                Curated list of bookmarked destinations and quiet hideaways.
              </Text>
              <span className="font-mono text-xs text-offbeat-accent">0 saved</span>
            </Card>

            <Card variant="flat" padding="md">
              <div className="flex items-center gap-2 mb-2 text-offbeat-primary font-semibold text-sm">
                <Sparkles className="h-4 w-4 text-offbeat-accent" />
                <span>Contributions</span>
              </div>
              <Text variant="muted" className="text-xs mb-3">
                Your submitted discoveries and verification community votes.
              </Text>
              <span className="font-mono text-xs text-offbeat-accent">0 submissions</span>
            </Card>
          </div>

          <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border/80 text-xs text-offbeat-muted flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
              <span>
                Traveler Memory & Personalization is active. OFFBEAT continuously remembers your
                travel tastes.
              </span>
            </div>
            <a
              href="/memory"
              className="px-3 py-1.5 rounded-lg bg-offbeat-accent/10 border border-offbeat-accent/30 text-offbeat-accent font-semibold text-xs hover:bg-offbeat-accent/20 transition-all shrink-0"
            >
              View Memory
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
};
