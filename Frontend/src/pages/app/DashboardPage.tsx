import React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  CompassIcon,
  SearchIcon,
  LibraryIcon,
  UserIcon,
  SettingsIcon,
  MapPinIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "../../components/icons/Icons";
import { useAppStore } from "../../stores/useAppStore";

export const DashboardPage: React.FC = () => {
  const { systemStatus } = useAppStore();

  const sampleDiscoveries = [
    {
      title: "Kyoto Backstreet Sanctuaries",
      location: "Kyoto, Japan",
      tag: "Hidden Cultural",
      description:
        "Quiet residential alleys and micro-temples far removed from bus tour routes.",
      badgeVariant: "accent" as const,
    },
    {
      title: "Azores Volcanic Lagoons",
      location: "São Miguel, Portugal",
      tag: "Wilderness",
      description:
        "Secluded crater trails and thermal waters nestled in deep Atlantic greenery.",
      badgeVariant: "gold" as const,
    },
    {
      title: "Oaxaca Artisan Roasters & Cellars",
      location: "Oaxaca, Mexico",
      tag: "Culinary Heritage",
      description:
        "Independent heritage bean purveyors and quiet courtyard mescal tastings.",
      badgeVariant: "success" as const,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Discovery Dashboard"
        description="Welcome to OFFBEAT. Your exploration-first intelligence hub for discovering meaningful travel alternatives."
        badge={
          <Badge variant="accent" size="sm">
            Phase 1 Foundation
          </Badge>
        }
        actions={
          <Link to="/search">
            <Button
              variant="primary"
              size="md"
              leftIcon={<SearchIcon size={16} />}
              rightIcon={<ArrowRightIcon size={14} />}
            >
              Start Exploring
            </Button>
          </Link>
        }
      />

      {/* Overview Stat Surface Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#12161f]/70 border-[#1f2633] hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">
                Philosophy
              </span>
              <CompassIcon size={18} className="text-[#ff5a36]" />
            </div>
            <div className="mt-2 text-xl font-bold text-white">Discovery First</div>
            <p className="mt-1 text-xs text-slate-400">
              Explore experiences before locking in destinations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#12161f]/70 border-[#1f2633] hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">
                Taste Profile
              </span>
              <UserIcon size={18} className="text-[#e5a93c]" />
            </div>
            <div className="mt-2 text-xl font-bold text-white">Curious Explorer</div>
            <p className="mt-1 text-xs text-slate-400">
              Low crowd tolerance · High cultural immersion
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#12161f]/70 border-[#1f2633] hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">
                Saved Spots
              </span>
              <LibraryIcon size={18} className="text-emerald-400" />
            </div>
            <div className="mt-2 text-xl font-bold text-white">Collection Ready</div>
            <p className="mt-1 text-xs text-slate-400">
              Organize your bookmarks & future journeys
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#12161f]/70 border-[#1f2633] hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">
                Backend Status
              </span>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  systemStatus === "connected"
                    ? "bg-emerald-500 shadow-glow-accent"
                    : "bg-amber-500"
                }`}
              />
            </div>
            <div className="mt-2 text-xl font-bold text-white capitalize">
              {systemStatus === "connected" ? "API Online" : systemStatus}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Monorepo /api/v1 communication active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Quick Access Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>Application Sections</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/search" className="group block">
            <Card className="h-full border-[#1f2633] hover:border-[#ff5a36]/50 hover:bg-[#161c28] transition-all duration-200">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-[#ff5a36]/10 text-[#ff5a36]">
                    <SearchIcon size={18} />
                  </div>
                  <ArrowRightIcon
                    size={16}
                    className="text-slate-500 group-hover:text-[#ff5a36] group-hover:translate-x-1 transition-all"
                  />
                </div>
                <CardTitle className="text-base text-white mt-3">Search</CardTitle>
                <CardDescription>
                  Search places, regions, and experiences by taste
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/library" className="group block">
            <Card className="h-full border-[#1f2633] hover:border-[#ff5a36]/50 hover:bg-[#161c28] transition-all duration-200">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <LibraryIcon size={18} />
                  </div>
                  <ArrowRightIcon
                    size={16}
                    className="text-slate-500 group-hover:text-[#ff5a36] group-hover:translate-x-1 transition-all"
                  />
                </div>
                <CardTitle className="text-base text-white mt-3">Library</CardTitle>
                <CardDescription>
                  View saved collections, bookmarks, and lists
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/profile" className="group block">
            <Card className="h-full border-[#1f2633] hover:border-[#ff5a36]/50 hover:bg-[#161c28] transition-all duration-200">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-[#e5a93c]/10 text-[#e5a93c]">
                    <UserIcon size={18} />
                  </div>
                  <ArrowRightIcon
                    size={16}
                    className="text-slate-500 group-hover:text-[#ff5a36] group-hover:translate-x-1 transition-all"
                  />
                </div>
                <CardTitle className="text-base text-white mt-3">Profile</CardTitle>
                <CardDescription>
                  Traveler identity and taste dimensions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/settings" className="group block">
            <Card className="h-full border-[#1f2633] hover:border-[#ff5a36]/50 hover:bg-[#161c28] transition-all duration-200">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <SettingsIcon size={18} />
                  </div>
                  <ArrowRightIcon
                    size={16}
                    className="text-slate-500 group-hover:text-[#ff5a36] group-hover:translate-x-1 transition-all"
                  />
                </div>
                <CardTitle className="text-base text-white mt-3">Settings</CardTitle>
                <CardDescription>
                  Application preferences and display settings
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Foundational Discovery Showcase Placeholder */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon size={18} className="text-[#ff5a36]" />
            <h2 className="text-lg font-bold text-white">
              Curated Discovery Concepts
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">UI Preview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleDiscoveries.map((item, idx) => (
            <Card
              key={idx}
              className="border-[#1f2633] bg-[#12161f]/80 hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.tag}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <MapPinIcon size={13} className="text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                </div>
                <CardTitle className="text-base text-white font-semibold">
                  {item.title}
                </CardTitle>
                <CardDescription className="pt-2">{item.description}</CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 mt-3 border-t border-[#1f2633]/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Concept Preview
                </span>
                <Link to="/search">
                  <Button variant="ghost" size="sm" className="text-xs text-[#ff5a36]">
                    Explore similar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Phase Architecture Note */}
      <Card className="border-[#1f2633] bg-gradient-to-r from-[#12161f] to-[#161c28]">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">
              Phase 1 Frontend Foundation Active
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Navigation shell, routing hierarchy, design system, and layouts are established.
              Backend discovery engines and AI services will connect in subsequent phases.
            </p>
          </div>
          <Badge variant="neutral" size="md">
            Phase 1 Completed
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
