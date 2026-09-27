import React from "react";
import { Outlet, Link } from "react-router-dom";
import { CompassIcon, ArrowRightIcon } from "../components/icons/Icons";
import { Badge } from "../components/ui/Badge";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#ff5a36]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Header with Brand & Return to App */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-[#1f2633]/60 bg-[#0a0c10]/40 backdrop-blur-md">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-[#ff5a36] text-white shadow-glow-accent">
            <CompassIcon size={18} className="transition-transform group-hover:rotate-45 duration-300" />
          </div>
          <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
            OFFBEAT
          </span>
          <Badge variant="accent" size="sm" className="hidden sm:inline-flex ml-1">
            Phase 1
          </Badge>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors group"
        >
          <span>Continue to App</span>
          <ArrowRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </header>

      {/* Main Content (Forms render here via Outlet) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-400 font-mono border-t border-[#1f2633]/60 bg-[#0a0c10]/60">
        <span>OFFBEAT — Discovery-First Travel — Phase 1 Foundation</span>
      </footer>
    </div>
  );
};
