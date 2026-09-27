import React from "react";
import { NavLink, Link } from "react-router-dom";
import { MAIN_NAV_ITEMS } from "../../routes/navigation";
import {
  CompassIcon,
  LibraryIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  LogInIcon,
  XIcon,
} from "../icons/Icons";
import { Badge } from "../ui/Badge";

export interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose, className = "" }) => {
  // Map icon component by item id
  const getNavIcon = (id: string, size = 18, iconClass = "") => {
    switch (id) {
      case "dashboard":
        return <CompassIcon size={size} className={iconClass} />;
      case "library":
        return <LibraryIcon size={size} className={iconClass} />;
      case "search":
        return <SearchIcon size={size} className={iconClass} />;
      case "profile":
        return <UserIcon size={size} className={iconClass} />;
      case "settings":
        return <SettingsIcon size={size} className={iconClass} />;
      default:
        return <CompassIcon size={size} className={iconClass} />;
    }
  };

  return (
    <aside
      className={`flex flex-col h-full w-64 bg-[#0d1017] border-r border-[#1f2633] select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-[#1f2633]">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-[#ff5a36] text-white shadow-glow-accent">
            <CompassIcon size={18} className="transition-transform group-hover:rotate-45 duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-orange-400 bg-clip-text text-transparent">
              OFFBEAT
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 -mt-0.5">
              Explore Differently
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
          >
            <XIcon size={18} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-1" aria-label="Sidebar Navigation">
          {MAIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-[#ff5a36]/15 to-transparent text-white border-l-2 border-[#ff5a36] font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#161c28] border-l-2 border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3 w-full">
                  <span
                    className={
                      isActive
                        ? "text-[#ff5a36] transition-colors"
                        : "text-slate-400 group-hover:text-slate-300 transition-colors"
                    }
                  >
                    {getNavIcon(item.id, 18)}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Secondary / Public Auth Links & Foundation Footer */}
      <div className="p-3 border-t border-[#1f2633] space-y-2 bg-[#0a0c10]/40">
        <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Public Auth Pages
        </div>
        <NavLink
          to="/login"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
              isActive
                ? "bg-[#ff5a36]/10 text-[#ff5a36] font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#161c28]"
            }`
          }
        >
          <LogInIcon size={16} />
          <span>Login / Register</span>
        </NavLink>

        <div className="pt-2 px-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Phase 1 Shell</span>
            <Badge variant="neutral" size="sm">
              v0.1.0
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
};
