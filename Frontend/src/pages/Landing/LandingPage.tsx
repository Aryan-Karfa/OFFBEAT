import React from "react";
import { useNavigate } from "react-router-dom";
import { TextType } from "../../components/TextType/TextType";
import { GlowCursor } from "../../components/GlowCursor/GlowCursor";
import { CompassIcon, ArrowRightIcon } from "../../components/icons/Icons";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // 9 required languages for "Start Exploring"
  const multilingualExplore = [
    "Start Exploring", // English
    "अन्वेषण शुरू करें", // Hindi
    "অন্বেষণ শুরু করুন", // Bengali
    "शोध सुरू करा", // Marathi
    "ਖੋਜ ਸ਼ੁਰੂ ਕਰੋ", // Punjabi
    "অন্বেষণ আৰম্ভ কৰক", // Assamese
    "探索を始める", // Japanese
    "Comienza a Explorar", // Spanish
    "开始探索", // Chinese
  ];

  const handleEnter = () => {
    navigate("/home");
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#0a0c10] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans"
      onKeyDown={(e) => {
        if (e.key === "Enter") handleEnter();
      }}
      tabIndex={0}
    >
      {/* React Bits GlowCursor WebGL layer */}
      <GlowCursor subtle={true} />

      {/* Atmospheric ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-orange-500/10 via-[#ff5a36]/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Minimal Header */}
      <header className="relative z-10 w-full px-6 sm:px-12 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-[#ff5a36] text-white shadow-glow-accent">
            <CompassIcon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-widest uppercase bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
              OFFBEAT
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 -mt-0.5">
              Experience Foundation
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnter}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors group px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/50 backdrop-blur"
        >
          <span>Enter Application</span>
          <ArrowRightIcon
            size={13}
            className="text-[#ff5a36] group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </header>

      {/* Main Experience: Multilingual TextType "Start Exploring" */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Subtle category badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-[#1f2633] text-xs font-mono text-slate-400 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5a36] animate-pulse" />
            <span className="tracking-wider uppercase text-[11px]">
              Discovery Before Destination
            </span>
          </div>

          {/* Central Typewriter Statement */}
          <div className="min-h-[140px] sm:min-h-[160px] flex items-center justify-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
              <TextType
                text={multilingualExplore}
                typingSpeed={80}
                deletingSpeed={45}
                pauseDuration={1900}
                showCursor={true}
                cursorCharacter="|"
                className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
                cursorClassName="text-[#ff5a36] font-light"
              />
            </h1>
          </div>

          {/* Lightweight exploratory transition CTA */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleEnter}
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-[#ff5a36] text-white font-medium text-sm sm:text-base shadow-glow-accent hover:shadow-[0_0_30px_rgba(255,90,54,0.5)] transition-all duration-300 active:scale-95"
            >
              <CompassIcon size={18} className="group-hover:rotate-45 transition-transform duration-300" />
              <span>Begin Exploration</span>
              <ArrowRightIcon size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="text-[11px] font-mono text-slate-400 tracking-wide">
              Press Enter or click to enter the interactive map
            </span>
          </div>
        </div>
      </main>

      {/* Intentionally Minimal Footer */}
      <footer className="relative z-10 w-full px-6 sm:px-12 py-6 flex items-center justify-between text-xs text-slate-400 font-mono border-t border-[#1f2633]/40">
        <span>OFFBEAT · Travel Beyond the Mainstream</span>
        <span className="text-slate-400">Phase 1 Foundation</span>
      </footer>
    </div>
  );
};
