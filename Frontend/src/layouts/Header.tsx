import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, Sparkles, RotateCcw } from "lucide-react";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";
import { resetDemoSession } from "../utils/demoReset";

export const Header: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: "DISCOVER", href: "/country" },
    { label: "ITINERARY", href: "/itinerary" },
    { label: "TAKE HOME", href: "/take-home" },
    { label: "MEMORY", href: "/memory" },
    { label: "COMMUNITY", href: "/community" },
  ];

  const isActive = (href: string) => {
    if (href === "/country") {
      return (
        location.pathname.startsWith("/country") ||
        location.pathname.startsWith("/map") ||
        location.pathname.startsWith("/region") ||
        location.pathname.startsWith("/travel-taste") ||
        location.pathname.startsWith("/experience-taste") ||
        location.pathname.startsWith("/discovery") ||
        location.pathname.startsWith("/place")
      );
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-offbeat-border/80 bg-offbeat-dark/85 backdrop-blur-md transition-colors">
      <Container size="xl">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition-transform duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent rounded-lg p-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-offbeat-surface border border-offbeat-border text-offbeat-accent group-hover:border-offbeat-accent/50 group-hover:shadow-glow transition-all">
              <Compass className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-widest text-offbeat-primary">
                OFFBEAT
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-offbeat-muted -mt-1">
                Discovery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offbeat-accent",
                    active
                      ? "text-offbeat-accent bg-offbeat-accent/10 border border-offbeat-accent/20"
                      : "text-offbeat-secondary hover:text-offbeat-primary hover:bg-offbeat-surface/60",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions & Demo Reset */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => resetDemoSession()}
              title="Reset demo session to pristine state"
              className="text-[11px] font-mono uppercase tracking-wider text-offbeat-muted hover:text-amber-400 px-2.5 py-1.5 rounded-lg border border-offbeat-border/60 hover:border-amber-400/40 hover:bg-amber-400/5 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <Link to="/country">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                className="hidden sm:inline-flex"
              >
                DISCOVER
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
};
