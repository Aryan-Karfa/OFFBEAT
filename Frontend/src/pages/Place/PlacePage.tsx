import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { placesService } from "../../services/placesService";
import { CommunitySection, ContributeModal } from "../../features/community";
import type { PlaceDetailDto } from "@offbeat/shared";
import { ArrowLeft, MapPin, Share2, PlusCircle, Globe, Phone, Compass } from "lucide-react";

export const PlacePage: React.FC = () => {
  const { placeId = "place_tiger_hill" } = useParams<{ placeId: string }>();
  const [place, setPlace] = useState<PlaceDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPlace = async () => {
      setLoading(true);
      try {
        const data = await placesService.getPlaceById(placeId);
        if (isMounted) setPlace(data);
      } catch {
        // Fallback default for Tiger Hill demo
        if (isMounted) {
          setPlace({
            id: placeId,
            name: "Tiger Hill",
            slug: "tiger-hill",
            destination: "Darjeeling",
            categories: ["Mountain", "Sunrise", "Photography"],
            location: { lat: 27.012, lng: 88.261 },
            description:
              "Renowned high-altitude summit offering dawn panoramas of Mount Kanchenjunga and Mount Everest. Surrounded by Senchal Forest reserve.",
            address: "Senchal Forest, Darjeeling, West Bengal 734102",
            status: "ACTIVE",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlace();
    return () => {
      isMounted = false;
    };
  }, [placeId]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <Section spacing="md">
        <Container size="lg">
          {/* Navigation Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/discovery"
              className="inline-flex items-center gap-1.5 text-xs text-offbeat-muted hover:text-offbeat-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Discoveries
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-offbeat-dark border border-offbeat-border text-emerald-400">
                Phase 8 Community Intelligence
              </span>
            </div>
          </div>

          {loading ? (
            <Card
              variant="elevated"
              padding="lg"
              className="border-offbeat-border/50 animate-pulse"
            >
              <div className="h-8 w-48 bg-offbeat-dark/60 rounded mb-4" />
              <div className="h-10 w-96 bg-offbeat-dark/60 rounded mb-6" />
              <div className="h-24 bg-offbeat-dark/60 rounded mb-6" />
            </Card>
          ) : place ? (
            <>
              {/* Place Hero Card */}
              <Card
                variant="elevated"
                padding="lg"
                className="border-offbeat-accent/30 mb-8 bg-offbeat-surface shadow-elevated"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" dot size="sm">
                      OFFBEAT CANONICAL PLACE
                    </Badge>
                    {place.community && (place.community.verifiedCount ?? 0) > 0 && (
                      <Badge variant="verified" size="sm">
                        ✓ {place.community.verifiedCount} Community Verified
                      </Badge>
                    )}
                    <span className="text-[11px] text-offbeat-muted font-mono">
                      LAT: {place.location.lat.toFixed(3)}, LNG: {place.location.lng.toFixed(3)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsContributeOpen(true)}
                      leftIcon={<PlusCircle className="h-3.5 w-3.5 text-offbeat-accent" />}
                    >
                      Share Discovery
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      leftIcon={<Share2 className="h-3.5 w-3.5" />}
                    >
                      {copied ? "Link Copied!" : "Share"}
                    </Button>
                  </div>
                </div>

                <Heading level={1} size="h1" className="text-2xl sm:text-4xl mb-3">
                  {place.name}
                </Heading>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-offbeat-accent mb-6 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{place.destination}, India</span>
                  </div>

                  {place.address && (
                    <span className="text-offbeat-muted text-xs">• {place.address}</span>
                  )}
                </div>

                {/* Canonical Fact / Intel */}
                {place.description && (
                  <div className="p-4 rounded-xl bg-offbeat-dark/70 border border-offbeat-border mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-offbeat-accent block mb-1.5 flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5" /> Canonical Geography & Place Intel
                    </span>
                    <Text variant="body" className="text-offbeat-secondary leading-relaxed text-sm">
                      {place.description}
                    </Text>
                  </div>
                )}

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {place.categories.map((cat) => (
                    <Badge key={cat} variant="tag" size="md">
                      {cat}
                    </Badge>
                  ))}
                </div>

                {/* External Links / Info */}
                {(place.website || place.phone) && (
                  <div className="flex items-center gap-4 text-xs text-offbeat-muted pt-2 border-t border-offbeat-border/60">
                    {place.website && (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-offbeat-accent hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" /> Official Website
                      </a>
                    )}
                    {place.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {place.phone}
                      </span>
                    )}
                  </div>
                )}
              </Card>

              {/* Community Discoveries Section */}
              <CommunitySection placeId={place.id} placeName={place.name} />

              {/* Contribute Modal for Place Context */}
              <ContributeModal
                isOpen={isContributeOpen}
                onClose={() => setIsContributeOpen(false)}
                placeId={place.id}
                placeName={place.name}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <Heading level={2} size="h3">
                Place not found
              </Heading>
              <Link
                to="/discovery"
                className="text-offbeat-accent hover:underline mt-2 inline-block"
              >
                Return to Discoveries
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
};
