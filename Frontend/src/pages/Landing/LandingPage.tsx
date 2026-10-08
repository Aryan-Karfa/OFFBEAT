import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Sparkles, ArrowRight, MapPin, Eye, Search, Layers } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Section } from "../../components/ui/Section";
import { Heading } from "../../components/ui/Heading";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { TRAVEL_TASTE_CATEGORIES, FEATURED_DISCOVERIES } from "../../features/discovery/data";
import { FEATURED_COUNTRIES } from "../../features/geography/data";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDestinationModal, setShowDestinationModal] = useState<boolean>(false);
  const [searchDestination, setSearchDestination] = useState<string>("");

  const filteredDestinations = FEATURED_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchDestination.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchDestination.toLowerCase()),
  );

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <Section spacing="xl" className="relative pt-16 sm:pt-24 lg:pt-32 pb-20 sm:pb-28">
        {/* Subtle background ambient illumination */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-offbeat-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-12 left-8 w-72 h-72 bg-offbeat-surface rounded-full blur-[90px] pointer-events-none opacity-40" />

        <Container size="lg" className="relative z-10 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-offbeat-surface border border-offbeat-border/80 shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-offbeat-accent animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-offbeat-secondary">
              Community-Powered Travel Exploration
            </span>
          </div>

          {/* Primary Statement */}
          <Heading level={1} size="display" className="max-w-4xl mx-auto mb-6 text-glow">
            LET&apos;S DISCOVER WHERE YOU SHOULD GO.
          </Heading>

          {/* Supporting Statement */}
          <Text
            variant="lead"
            className="max-w-2xl mx-auto mb-10 text-base sm:text-lg md:text-xl text-offbeat-secondary"
          >
            Explore destinations based on what you love, how you travel, and what people who&apos;ve
            been there have discovered.
          </Text>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link to="/country" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                START DISCOVERING
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setShowDestinationModal(true)}
            >
              I KNOW WHERE I&apos;M GOING
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-14 pt-8 border-t border-offbeat-border/50 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-offbeat-primary">
                36
              </div>
              <div className="text-xs text-offbeat-muted mt-0.5">States & Territories</div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-offbeat-accent">
                1,400+
              </div>
              <div className="text-xs text-offbeat-muted mt-0.5">Verified Discoveries</div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-offbeat-primary">
                Zero
              </div>
              <div className="text-xs text-offbeat-muted mt-0.5">Paid Placements</div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-offbeat-primary">
                Map-First
              </div>
              <div className="text-xs text-offbeat-muted mt-0.5">Exploration Surface</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. CORE UX PRINCIPLE — DISCOVERY BEFORE DESTINATION */}
      <Section spacing="lg" bordered className="bg-offbeat-surface/30">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
                The OFFBEAT Distinction
              </span>
              <Heading level={2} size="h2" className="mb-4">
                Discovery Before Destination
              </Heading>
              <Text variant="lead" className="text-base text-offbeat-secondary mb-6">
                Conventional travel platforms ask you where you want to go before knowing what kind
                of experience you are seeking. OFFBEAT turns that upside down.
              </Text>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-offbeat-surface border border-offbeat-border flex items-center justify-center text-offbeat-accent shrink-0 mt-0.5">
                    <Compass className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-offbeat-primary">Explore by Taste</h3>
                    <p className="text-xs text-offbeat-muted mt-0.5">
                      Define what you crave — solitary cedar ridges, ancient terracotta temples, or
                      midnight street feasts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-offbeat-surface border border-offbeat-border flex items-center justify-center text-offbeat-accent shrink-0 mt-0.5">
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-offbeat-primary">
                      Living Human Advice
                    </h3>
                    <p className="text-xs text-offbeat-muted mt-0.5">
                      Discover observations from travelers who walked the backtracks rather than
                      sponsored SEO blog posts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-md bg-offbeat-surface border border-offbeat-border flex items-center justify-center text-offbeat-accent shrink-0 mt-0.5">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-offbeat-primary">
                      Geographic Continuity
                    </h3>
                    <p className="text-xs text-offbeat-muted mt-0.5">
                      Discover places connected through actual landscapes, valleys, and regional
                      borders.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Comparison Card */}
            <Card variant="elevated" padding="lg" className="border-offbeat-border">
              <div className="text-xs font-mono uppercase tracking-widest text-offbeat-muted mb-4 border-b border-offbeat-border/60 pb-2">
                Flow Architecture
              </div>

              {/* Conventional vs OFFBEAT */}
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-offbeat-dark/60 border border-offbeat-border/40">
                  <span className="text-[11px] font-bold text-offbeat-muted uppercase tracking-wider block mb-2">
                    Traditional Platform Flow
                  </span>
                  <div className="flex items-center gap-2 text-xs text-offbeat-muted font-mono">
                    <span className="px-2 py-1 rounded bg-offbeat-surface">Know Destination</span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-offbeat-surface">Search</span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-offbeat-surface">Generic Ads</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-offbeat-elevated border border-offbeat-accent/30 shadow-card">
                  <span className="text-[11px] font-bold text-offbeat-accent uppercase tracking-wider block mb-2">
                    OFFBEAT Flow
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-offbeat-primary">
                    <span className="px-2 py-1 rounded bg-offbeat-accent/15 text-offbeat-accent border border-offbeat-accent/30">
                      Experience Taste
                    </span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-offbeat-surface border border-offbeat-border">
                      Explore Map
                    </span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-offbeat-surface border border-offbeat-border">
                      Discover Places
                    </span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-offbeat-accent text-offbeat-dark font-semibold">
                      Choose
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 3. TRAVEL TASTE PREVIEW */}
      <Section spacing="lg">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              Taste Before Destination
            </span>
            <Heading level={2} size="h2" className="mb-3">
              What Are You in the Mood For?
            </Heading>
            <Text variant="body" className="text-offbeat-secondary">
              Describe the feeling, texture, and rhythm of your journey before naming a single pin
              on a map.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAVEL_TASTE_CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                variant="interactive"
                padding="md"
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <Heading level={3} size="h4" className="mb-1 text-offbeat-primary">
                    {cat.name}
                  </Heading>
                  <Text variant="muted" className="text-xs mb-4">
                    {cat.descriptor}
                  </Text>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-offbeat-border/50">
                  {cat.examples.map((example) => (
                    <Badge key={example} variant="outline" size="sm">
                      {example}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/country">
              <Button variant="accent" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Explore All Tastes with Interactive Map
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* 4. COMMUNITY DISCOVERIES & CONFIDENCE BADGES */}
      <Section spacing="lg" bordered className="bg-offbeat-surface/20">
        <Container size="lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
                Human Observations
              </span>
              <Heading level={2} size="h2">
                Curated Community Discoveries
              </Heading>
              <Text variant="body" className="text-offbeat-secondary mt-1 max-w-xl">
                Real travelers sharing hidden places with visible semantic confidence levels.
              </Text>
            </div>

            {/* Semantic Confidence Legend */}
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-offbeat-surface border border-offbeat-border text-xs">
              <span className="text-offbeat-muted mr-1 font-mono text-[10px]">VERIFICATION:</span>
              <Badge variant="verified" dot size="sm">
                Community Verified
              </Badge>
              <Badge variant="supported" dot size="sm">
                Community Supported
              </Badge>
              <Badge variant="new" dot size="sm">
                New Discovery
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_DISCOVERIES.slice(0, 3).map((discovery) => (
              <Card
                key={discovery.id}
                variant="elevated"
                padding="md"
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={discovery.confidence} dot size="sm">
                      {discovery.confidence === "verified"
                        ? "Community Verified"
                        : discovery.confidence === "supported"
                          ? "Community Supported"
                          : "New Discovery"}
                    </Badge>
                    <span className="text-xs font-mono text-offbeat-muted">
                      ▲ {discovery.upvotes}
                    </span>
                  </div>

                  <Heading level={3} size="h4" className="mb-2 text-offbeat-primary line-clamp-2">
                    {discovery.title}
                  </Heading>

                  <div className="flex items-center gap-1.5 text-xs text-offbeat-accent font-medium mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {discovery.location}, {discovery.region}
                    </span>
                  </div>

                  <Text variant="muted" className="text-xs mb-4 line-clamp-3">
                    &ldquo;{discovery.snippet}&rdquo;
                  </Text>
                </div>

                <div className="pt-3 border-t border-offbeat-border/60 flex items-center justify-between text-xs text-offbeat-secondary">
                  <span>By {discovery.author}</span>
                  <div className="flex gap-1">
                    {discovery.tags.map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 5. HOW OFFBEAT WORKS */}
      <Section spacing="lg">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-offbeat-accent block mb-2">
              The Journey
            </span>
            <Heading level={2} size="h2" className="mb-3">
              How OFFBEAT Works
            </Heading>
            <Text variant="body" className="text-offbeat-secondary">
              A four-step cycle that turns curiosity into an unforgettable journey.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="flat" padding="md" className="border-offbeat-border/60">
              <div className="h-8 w-8 rounded-lg bg-offbeat-surface border border-offbeat-border flex items-center justify-center font-display font-bold text-offbeat-accent mb-4">
                1
              </div>
              <h3 className="font-semibold text-offbeat-primary text-base mb-1">Explore Country</h3>
              <p className="text-xs text-offbeat-muted leading-relaxed">
                Step into a rich geographic surface. See states, union territories, and natural
                biomes.
              </p>
            </Card>

            <Card variant="flat" padding="md" className="border-offbeat-border/60">
              <div className="h-8 w-8 rounded-lg bg-offbeat-surface border border-offbeat-border flex items-center justify-center font-display font-bold text-offbeat-accent mb-4">
                2
              </div>
              <h3 className="font-semibold text-offbeat-primary text-base mb-1">State & Taste</h3>
              <p className="text-xs text-offbeat-muted leading-relaxed">
                Focus on a specific region. Layer in travel moods — from misty highlands to coastal
                craft hamlets.
              </p>
            </Card>

            <Card variant="flat" padding="md" className="border-offbeat-border/60">
              <div className="h-8 w-8 rounded-lg bg-offbeat-surface border border-offbeat-border flex items-center justify-center font-display font-bold text-offbeat-accent mb-4">
                3
              </div>
              <h3 className="font-semibold text-offbeat-primary text-base mb-1">Discover Places</h3>
              <p className="text-xs text-offbeat-muted leading-relaxed">
                Uncover authentic community gems and contextual alternatives that avoid crowded
                tourist traps.
              </p>
            </Card>

            <Card variant="flat" padding="md" className="border-offbeat-border/60">
              <div className="h-8 w-8 rounded-lg bg-offbeat-surface border border-offbeat-border flex items-center justify-center font-display font-bold text-offbeat-accent mb-4">
                4
              </div>
              <h3 className="font-semibold text-offbeat-primary text-base mb-1">Take Home</h3>
              <p className="text-xs text-offbeat-muted leading-relaxed">
                Support indigenous artisans and local economies with curated cultural items to bring
                back.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <Section
        spacing="xl"
        className="bg-gradient-to-b from-transparent via-offbeat-surface/40 to-offbeat-surface border-t border-offbeat-border"
      >
        <Container size="md" className="text-center">
          <Heading level={2} size="display" className="text-3xl sm:text-4xl md:text-5xl mb-4">
            Ready to Discover Where You Should Go?
          </Heading>
          <Text variant="lead" className="text-offbeat-secondary mb-8 max-w-xl mx-auto">
            Step away from generic rankings and explore the living geography of the subcontinent.
          </Text>
          <Link to="/country">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              START DISCOVERING
            </Button>
          </Link>
        </Container>
      </Section>

      {/* DESTINATION MODAL ("I KNOW WHERE I'M GOING") */}
      {showDestinationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Direct Destination Selector"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-offbeat-dark/80 backdrop-blur-md"
        >
          <div className="fixed inset-0" onClick={() => setShowDestinationModal(false)} />
          <Card
            variant="elevated"
            padding="lg"
            className="relative z-10 w-full max-w-lg border-offbeat-border"
          >
            <div className="flex items-center justify-between mb-4">
              <Heading level={3} size="h3">
                Where are you thinking of?
              </Heading>
              <button
                type="button"
                onClick={() => setShowDestinationModal(false)}
                className="text-offbeat-muted hover:text-offbeat-primary p-1 rounded-md"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <Text variant="muted" className="text-xs mb-4">
              Select a country or jump directly into India to explore regions and verified community
              gems.
            </Text>

            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-offbeat-muted" />
              <input
                type="search"
                autoFocus
                placeholder="Search country (e.g. India)..."
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-offbeat-surface border border-offbeat-border text-sm text-offbeat-primary placeholder:text-offbeat-muted focus:border-offbeat-accent focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {filteredDestinations.map((country) => (
                <div
                  key={country.id}
                  onClick={() => {
                    setShowDestinationModal(false);
                    if (country.isAvailable) {
                      navigate("/country/india/map");
                    } else {
                      navigate("/country");
                    }
                  }}
                  className="flex items-center justify-between p-3 rounded-lg bg-offbeat-surface hover:bg-offbeat-elevated border border-offbeat-border hover:border-offbeat-accent/50 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-sm font-bold text-offbeat-primary">{country.name}</div>
                    <div className="text-xs text-offbeat-muted">{country.tagline}</div>
                  </div>
                  {country.isAvailable ? (
                    <Badge variant="accent" size="sm">
                      Available Now
                    </Badge>
                  ) : (
                    <Badge variant="tag" size="sm">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDestinationModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowDestinationModal(false);
                  navigate("/country");
                }}
              >
                Browse All Countries
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
