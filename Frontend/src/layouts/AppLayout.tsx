import React, { useLayoutEffect } from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";

import { ErrorBoundary } from "../components/ui/ErrorBoundary";

export const AppLayout: React.FC = () => {
  const { pathname, search } = useLocation();

  // Instant scroll restoration on primary route navigation to ensure view starts at top
  useLayoutEffect(() => {
    // 1. Reset primary window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });

    // 2. Reset document root and body scroll
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 3. Reset main app shell container if it exists
    const main = document.getElementById("main-content");
    if (main) {
      main.scrollTop = 0;
    }
  }, [pathname, search]);

  return (
    <div className="flex min-h-screen flex-col bg-offbeat-dark text-offbeat-primary">
      <ScrollRestoration getKey={(location) => location.pathname} />
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
