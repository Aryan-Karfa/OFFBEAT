import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

import { ErrorBoundary } from "../components/ui/ErrorBoundary";

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-offbeat-dark text-offbeat-primary">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-offbeat-accent focus:text-offbeat-dark focus:font-bold focus:rounded-md focus:shadow-glow focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Primary Header Navigation */}
      <Header />

      {/* Main Content Area Protected by ErrorBoundary */}
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};
