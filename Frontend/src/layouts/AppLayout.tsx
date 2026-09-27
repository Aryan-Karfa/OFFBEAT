import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#0a0c10] text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex w-64 max-w-[80%] flex-1 flex-col z-10 shadow-2xl">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col">
          <div className="flex-1 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>

          {/* Application Shell Footer */}
          <footer className="mt-12 pt-6 border-t border-[#1f2633]/60 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
            <span>OFFBEAT — Discover Before Destination</span>
            <span className="text-slate-400">Phase 1: Frontend Foundation</span>
          </footer>
        </main>
      </div>
    </div>
  );
};
