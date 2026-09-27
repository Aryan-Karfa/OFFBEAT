import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { FEATURED_DISCOVERIES } from "../../features/discovery/data";
import { ArrowLeft, MapPin, Sparkles, Share2, Bookmark } from "lucide-react";

export const PlacePage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const place = FEATURED_DISCOVERIES.find((p) => p.id === placeId) || FEATURED_DISCOVERIES[0];

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

          <Card variant="elevated" padding="lg" className="border-offbeat-accent/30 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <Badge variant={place?.confidence || "verified"} dot size="md">
                {place?.confidence === "verified"
                  ? "Community Verified Discovery"
                  : place?.confidence === "supported"
                    ? "Community Supported"
                    : "New Discovery"}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" leftIcon={<Bookmark className="h-3.5 w-3.5" />}>
                  Save
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Share2 className="h-3.5 w-3.5" />}>
                  Share
                </Button>
              </div>
            </div>

            <Heading level={1} size="h1" className="text-2xl sm:text-4xl mb-3">
              {place?.title}
            </Heading>

            <div className="flex items-center gap-2 text-sm text-offbeat-accent mb-6 font-medium">
              <MapPin className="h-4 w-4" />
              <span>
                {place?.location}, {place?.region}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-offbeat-surface border border-offbeat-border mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-offbeat-primary block mb-2">
                Discovery Observation
              </span>
              <Text variant="body" className="text-offbeat-secondary leading-relaxed">
                {place?.snippet}
              </Text>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {place?.tags.map((tag) => (
                <Badge key={tag} variant="tag" size="md">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-offbeat-elevated border border-offbeat-border text-xs text-offbeat-muted flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-offbeat-accent shrink-0" />
              <span>
                Deep place intel, contextual alternatives, and community verification will be
                connected in <strong>Phase 4</strong>.
              </span>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};
