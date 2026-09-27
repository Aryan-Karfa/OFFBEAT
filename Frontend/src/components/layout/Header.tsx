import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../../stores/useAppStore";
import { MenuIcon, SearchIcon, UserIcon } from "../icons/Icons";
import { Badge } from "../ui/Badge";

export interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { systemStatus } = useAppStore();
  const location = useLocation();

  // Get readable current section name based on path
  const currentPath = location.pathname;
  const sectionName =
    currentPath.replace(/^\//, "").charAt(0).toUpperCase() +
    currentPath.replace(/^\//, "").slice(1) || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1f2633] bg-[#0a0c10]/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile menu button & breadcrumb indicator */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open sidebar menu"
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-[#ff5a36] md:hidden"
          >
            <MenuIcon size={20} />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link
            to="/dashboard"
            className="hover:text-slate-200 transition-colors"
          >
            OFFBEAT
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-medium">{sectionName}</span>
        </div>
      </div>

      {/* Center: Search trigger placeholder linking to /search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <Link
          to="/search"
          className="flex items-center justify-between w-full h-9 px-3 text-xs text-slate-400 bg-[#12161f]/90 border border-[#1f2633] rounded-lg hover:border-slate-600 hover:text-slate-300 transition-all shadow-inner group"
        >
          <span className="flex items-center gap-2">
            <SearchIcon size={14} className="text-slate-500 group-hover:text-slate-400" />
            <span>Search destinations, tastes, or spots...</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/70 border border-slate-700/60 rounded">
            /search
          </kbd>
        </Link>
      </div>

      {/* Right: System status & Profile action */}
      <div className="flex items-center gap-3">
        {/* Backend health status badge */}
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/80 border border-[#1f2633] px-2.5 py-1 rounded-full">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              systemStatus === "connected"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                : systemStatus === "checking"
                ? "bg-amber-500 animate-pulse"
                : systemStatus === "error"
                ? "bg-rose-500"
                : "bg-slate-600"
            }`}
          />
          <span className="text-[11px] text-slate-300 hidden sm:inline capitalize">
            {systemStatus === "connected" ? "API Live" : systemStatus}
          </span>
        </div>

        <Badge variant="accent" size="sm" className="hidden lg:inline-flex">
          Phase 1 Foundation
        </Badge>

        {/* Profile Quick Link */}
        <Link
          to="/profile"
          aria-label="View Profile"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-[#1f2633] text-slate-300 hover:text-white hover:border-[#ff5a36] hover:bg-[#1c2333] transition-colors"
        >
          <UserIcon size={16} />
        </Link>
      </div>
    </header>
  );
};
