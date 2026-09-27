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
  UserIcon,
  SettingsIcon,
  LibraryIcon,
  MapPinIcon,
  CompassIcon,
  ShieldCheckIcon,
} from "../../components/icons/Icons";

export const ProfilePage: React.FC = () => {
  const tasteDimensions = [
    { label: "Crowd Tolerance", value: "Low", description: "Secluded, quiet places over crowded hotspots", score: 85 },
    { label: "Travel Pace", value: "Slow & Immersive", description: "Multi-day stays in single villages or neighborhoods", score: 75 },
    { label: "Culture vs Comfort", value: "Raw & Authentic", description: "Values historic grit over sanitized luxury", score: 90 },
    { label: "Wilderness Index", value: "High", description: "Drawn to rugged coastlines, high passes, and quiet nature", score: 80 },
    { label: "Spontaneity", value: "High", description: "Leaves room for unplanned discoveries and local tips", score: 88 },
    { label: "Culinary Curiosity", value: "Hyper-Local", description: "Seeks neighborhood roasteries and street markets", score: 92 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Traveler Profile"
        description="Your travel taste profile, identity, and discovery parameters."
        badge={
          <Badge variant="accent" size="sm">
            Phase 1 Foundation
          </Badge>
        }
        actions={
          <Link to="/settings">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<SettingsIcon size={14} />}
            >
              Account Settings
            </Button>
          </Link>
        }
      />

      {/* Identity Card */}
      <Card className="border-[#1f2633] bg-[#12161f]/80 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-orange-500/20 via-[#ff5a36]/15 to-transparent border-b border-[#1f2633]/60 relative" />
        <CardContent className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-[#ff5a36] text-white flex items-center justify-center border-4 border-[#12161f] shadow-glow-accent">
                <UserIcon size={36} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Alex Explorer</h2>
                  <Badge variant="accent" size="sm">
                    Curious Explorer
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                  <MapPinIcon size={13} className="text-[#ff5a36]" />
                  <span>Base: Lisbon & Tokyo</span>
                  <span className="text-slate-600">·</span>
                  <ShieldCheckIcon size={13} className="text-emerald-400" />
                  <span>Verified Traveler</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/library">
                <Button variant="secondary" size="sm" leftIcon={<LibraryIcon size={14} />}>
                  View Library
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-2">
            Searching for architectural secrets, uncrowded mountain sanctuaries, and neighborhood food
            stalls where English menus don&apos;t exist.
          </p>
        </CardContent>
      </Card>

      {/* Taste Dimensions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CompassIcon size={18} className="text-[#ff5a36]" />
            <h3 className="text-base font-bold text-white">Travel Taste Matrix</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Phase 1 Foundational Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasteDimensions.map((taste, index) => (
            <Card key={index} className="border-[#1f2633] bg-[#12161f]/70">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {taste.label}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#ff5a36]">
                    {taste.score}%
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold text-white mt-1">
                  {taste.value}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 pt-1">
                  {taste.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-[#ff5a36] h-1.5 rounded-full"
                    style={{ width: `${taste.score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Note about Phase 2/3 Profile Backend */}
      <Card className="border-[#1f2633] bg-[#12161f]/40 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-200">
              Profile Persistence & Taste Engine
            </span>
            <p>
              Taste vector calculation and Prisma profile storage will be implemented in subsequent phases.
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            Phase 1 UI Ready
          </Badge>
        </div>
      </Card>
    </div>
  );
};
