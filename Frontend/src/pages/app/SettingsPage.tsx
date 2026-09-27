import React, { useState } from "react";
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
import { useAppStore } from "../../stores/useAppStore";
import {
  CheckCircleIcon,
} from "../../components/icons/Icons";

export const SettingsPage: React.FC = () => {
  const { systemStatus } = useAppStore();
  const [compactMode, setCompactMode] = useState(false);
  const [avoidCrowds, setAvoidCrowds] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Settings"
        description="Configure your discovery preferences, interface options, and view system status."
        badge={
          <Badge variant="accent" size="sm">
            Phase 1 Foundation
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={savedSuccess ? <CheckCircleIcon size={16} /> : undefined}
          >
            {savedSuccess ? "Preferences Saved" : "Save Changes"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance & Interface */}
        <Card className="border-[#1f2633] bg-[#12161f]/80">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Interface & Display
            </CardTitle>
            <CardDescription>
              Configure visual appearance and viewport density.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-[#1f2633]/60">
              <div>
                <div className="text-sm font-medium text-slate-200">Color Theme</div>
                <div className="text-xs text-slate-400">
                  OFFBEAT dark obsidian theme
                </div>
              </div>
              <Badge variant="accent" size="sm">
                Dark Mode Active
              </Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#1f2633]/60">
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Compact Density
                </div>
                <div className="text-xs text-slate-400">
                  Display denser cards in discovery lists
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompactMode(!compactMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                  compactMode ? "bg-[#ff5a36]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    compactMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Map Aesthetics
                </div>
                <div className="text-xs text-slate-400">
                  Cartographic rendering style
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/60">
                Midnight Cartography
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Discovery Parameters */}
        <Card className="border-[#1f2633] bg-[#12161f]/80">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Discovery Engine Defaults
            </CardTitle>
            <CardDescription>
              Adjust default parameters used for discovering places.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-[#1f2633]/60">
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Strict Anti-Crowd Filter
                </div>
                <div className="text-xs text-slate-400">
                  Automatically suppress top-rated TripAdvisor tourist hubs
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAvoidCrowds(!avoidCrowds)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff5a36] ${
                  avoidCrowds ? "bg-[#ff5a36]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    avoidCrowds ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#1f2633]/60">
              <div>
                <div className="text-sm font-medium text-slate-200">
                  Default Exploration Radius
                </div>
                <div className="text-xs text-slate-400">
                  Regional scope for discoveries
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/60">
                50 km (Regional)
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-slate-200">
                  AI Recommendation Grounding
                </div>
                <div className="text-xs text-slate-400">
                  Gemini model reasoning level
                </div>
              </div>
              <Badge variant="gold" size="sm">
                High Context Grounding
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System & Architecture Information */}
      <Card className="border-[#1f2633] bg-[#12161f]/80">
        <CardHeader>
          <CardTitle className="text-base text-white">
            Architecture & System Information
          </CardTitle>
          <CardDescription>
            Current build, monorepo packages, and connection baseline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-[#1f2633]">
              <div className="text-slate-400 mb-1">Architecture</div>
              <div className="font-semibold text-slate-200">Domain Monorepo</div>
              <div className="text-[11px] text-slate-400 mt-1">pnpm workspace</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-[#1f2633]">
              <div className="text-slate-400 mb-1">Frontend Shell</div>
              <div className="font-semibold text-slate-200">Phase 1 Foundation</div>
              <div className="text-[11px] text-slate-400 mt-1">React Router v7 + Tailwind</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-[#1f2633]">
              <div className="text-slate-400 mb-1">Backend API Status</div>
              <div className="font-semibold text-slate-200 capitalize flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    systemStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>{systemStatus}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">/api/v1 prefix baseline</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-[#1f2633]">
              <div className="text-slate-400 mb-1">Database Model</div>
              <div className="font-semibold text-slate-200">PostgreSQL + Prisma</div>
              <div className="text-[11px] text-slate-400 mt-1">Phase 0 schema baseline</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
