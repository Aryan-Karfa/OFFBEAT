import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IndiaMap, StateLocation } from "../../components/IndiaMap/IndiaMap";
import { ThoughtLine } from "../../components/ThoughtLine/ThoughtLine";
import {
  CompassIcon,
  SparklesIcon,
  MapPinIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "../../components/icons/Icons";

export const HomePage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<StateLocation | null>({
    id: "hp",
    name: "Himachal Pradesh",
    path: "",
  });

  // AI ThoughtLine simulation state
  const [aiState, setAiState] = useState<"idle" | "thinking" | "settled">("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const aiSteps = [
    "Understanding your travel preferences",
    "Exploring destinations",
    "Checking places and experiences",
    "Comparing alternatives",
    "Building your recommendations",
  ];

  // Start the AI reasoning simulation
  const handleStartSimulation = () => {
    setAiState("thinking");
    setCurrentStepIndex(0);
  };

  const handleResetSimulation = () => {
    setAiState("idle");
    setCurrentStepIndex(0);
  };

  // Progress through steps automatically when thinking
  useEffect(() => {
    if (aiState !== "thinking") return;

    if (currentStepIndex < aiSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      // Final step -> settle after a moment
      const settleTimer = setTimeout(() => {
        setAiState("settled");
      }, 1400);
      return () => clearTimeout(settleTimer);
    }
  }, [aiState, currentStepIndex, aiSteps.length]);

  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-slate-100 flex flex-col font-sans selection:bg-[#ff5a36]/20 selection:text-[#ff5a36]">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 w-full h-16 border-b border-[#1f2633] bg-[#0a0c10]/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-[#ff5a36] text-white shadow-glow-accent">
              <CompassIcon size={18} className="group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
                OFFBEAT
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 -mt-0.5">
                India Exploration Hub
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            to="/"
            className="text-slate-400 hover:text-white transition-colors hidden sm:inline"
          >
            ← Back to Landing
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-[#1f2633] text-[11px] text-[#ff5a36]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a36] animate-pulse" />
            <span>Phase 1 Interactive Map</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Page Title & Interaction Mission */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f2633]/80">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#ff5a36] mb-2">
              <SparklesIcon size={14} />
              <span>Dimensional Cartography Prototype</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Interactive Map of India
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Hover to feel physical state elevation. Click any state to launch it forward from the
              map surface.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-[#1f2633] max-w-xs">
            <span className="text-slate-300 font-semibold block mb-0.5">
              Dimensional Feedback:
            </span>
            <span>Hover = 5px lift · Click = 16px launch up</span>
          </div>
        </div>

        {/* Primary Interactive Section: Map + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Central Visual: India Map (7 cols) */}
          <div className="lg:col-span-7 bg-[#0d1017]/70 rounded-2xl border border-[#1f2633] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 px-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPinIcon size={14} className="text-[#ff5a36]" />
                <span>36 States &amp; Union Territories</span>
              </span>
              <span>Vector SVG Boundaries</span>
            </div>

            <IndiaMap
              selectedStateId={selectedState?.id || null}
              onSelectState={(state) => setSelectedState(state)}
            />
          </div>

          {/* Right Column: AI Experience + State Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Experience Section (ThoughtLine component) */}
            <div className="rounded-2xl border border-[#1f2633] bg-[#0d1017]/80 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2633]/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#ff5a36]/10 text-[#ff5a36]">
                    <SparklesIcon size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      AI Reasoning Experience
                    </h2>
                    <p className="text-[11px] font-mono text-slate-400">
                      React Bits ThoughtLine Prototype
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {aiState === "idle" && (
                    <button
                      type="button"
                      onClick={handleStartSimulation}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-[#ff5a36] text-white text-xs font-medium shadow-glow-accent hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <SparklesIcon size={13} />
                      <span>Simulate AI</span>
                    </button>
                  )}

                  {aiState === "thinking" && (
                    <span className="px-2.5 py-1 rounded bg-[#ff5a36]/15 text-[#ff5a36] text-[11px] font-mono border border-[#ff5a36]/30 animate-pulse">
                      Processing...
                    </span>
                  )}

                  {aiState === "settled" && (
                    <button
                      type="button"
                      onClick={handleResetSimulation}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                    >
                      Reset Demo
                    </button>
                  )}
                </div>
              </div>

              {/* ThoughtLine Component Container */}
              <div>
                <ThoughtLine
                  steps={aiSteps}
                  currentStepIndex={currentStepIndex}
                  isWorking={aiState === "thinking"}
                  isSettled={aiState === "settled"}
                  showTimer={true}
                />
              </div>

              <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                Communicates thorough, expert-level AI processing rather than a generic spinner.
                Progresses from working to settled state.
              </p>
            </div>

            {/* Selected State Overview Card */}
            {selectedState && (
              <div className="rounded-2xl border border-[#1f2633] bg-[#0d1017]/80 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2633]/60">
                  <span className="text-xs font-mono uppercase text-slate-400">
                    Active State Sanctuary
                  </span>
                  <span className="text-xs font-mono text-[#ff5a36]">
                    Elevation: Active
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xl font-bold text-white">
                    {selectedState.name}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This state has launched up from the map surface. In future discovery phases,
                    curated taste vectors and regional recommendations will populate here.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-[#1f2633]/60">
                  <span>Prototype State Layer</span>
                  <span className="text-[#ff5a36] flex items-center gap-1">
                    <span>Explore Territory</span>
                    <ChevronRightIcon size={12} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 w-full px-6 sm:px-12 py-6 border-t border-[#1f2633] text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>OFFBEAT · Phase 1 Product Experience</span>
        <span>Landing · Interactive India Map · ThoughtLine AI Experience</span>
      </footer>
    </div>
  );
};
