import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Text } from "../components/ui/Text";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-offbeat-border bg-offbeat-dark py-12 mb-16 md:mb-0">
      <Container size="xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Philosophy */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-offbeat-surface border border-offbeat-border text-offbeat-accent">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold tracking-widest text-offbeat-primary">
                OFFBEAT
              </span>
            </div>
            <Text variant="lead" className="text-base text-offbeat-secondary max-w-md">
              &ldquo;Let&apos;s discover where you should go.&rdquo;
            </Text>
            <Text variant="muted" className="text-xs max-w-sm">
              Community-powered travel exploration prioritizing taste, geography, and living culture
              over generic itineraries.
            </Text>
          </div>

          {/* Discovery Links */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-offbeat-primary">
              Discovery
            </h4>
            <ul className="space-y-2 text-xs text-offbeat-secondary">
              <li>
                <Link to="/country" className="hover:text-offbeat-accent transition-colors">
                  Explore Countries
                </Link>
              </li>
              <li>
                <Link
                  to="/country/india/map"
                  className="hover:text-offbeat-accent transition-colors"
                >
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link to="/travel-taste" className="hover:text-offbeat-accent transition-colors">
                  Travel Taste
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-offbeat-accent transition-colors">
                  Verified Discoveries
                </Link>
              </li>
            </ul>
          </div>

          {/* Principles & Standards */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-offbeat-primary">
              Standards
            </h4>
            <ul className="space-y-2 text-xs text-offbeat-secondary">
              <li>
                <span className="text-offbeat-muted">Discovery Before Destination</span>
              </li>
              <li>
                <span className="text-offbeat-muted">Human Experience First</span>
              </li>
              <li>
                <span className="text-offbeat-muted">Semantic Confidence Levels</span>
              </li>
              <li>
                <span className="text-offbeat-muted">Accessible Map Fallbacks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-offbeat-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-offbeat-muted">
          <p>© {new Date().getFullYear()} OFFBEAT. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-offbeat-secondary transition-colors font-mono">
              OFFBEAT v0.1.0
            </span>
            <span>·</span>
            <span className="hover:text-offbeat-secondary transition-colors">
              WCAG 2.1 AA Compliant
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
