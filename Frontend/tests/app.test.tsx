import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/App";
import { MAIN_NAV_ITEMS } from "../src/routes/navigation";
import { Header } from "../src/components/layout/Header";
import { Sidebar } from "../src/components/layout/Sidebar";

describe("OFFBEAT Frontend Foundation — Phase 1", () => {
  describe("App Shell & Router Verification", () => {
    it("handles root path with redirect to /dashboard", () => {
      // In SSR/renderToString, <Navigate /> triggers client-side redirect and produces empty markup
      const html = renderToString(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toBe("");
    });

    it("renders /dashboard route correctly", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Discovery Dashboard");
      expect(html).toContain("Your exploration-first intelligence hub");
      expect(html).toContain("Application Sections");
    });

    it("renders /library route correctly", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/library"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Saved Library");
      expect(html).toContain("Your personal repository of offbeat spots");
      expect(html).toContain("All Collections");
    });

    it("renders /search route correctly", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/search"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Search &amp; Explore");
      expect(html).toContain("Taste Filters:");
      expect(html).toContain("Quiet &amp; Isolation");
    });

    it("renders /profile route correctly", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/profile"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Traveler Profile");
      expect(html).toContain("Alex Explorer");
      expect(html).toContain("Travel Taste Matrix");
    });

    it("renders /settings route correctly", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/settings"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Settings");
      expect(html).toContain("Interface &amp; Display");
      expect(html).toContain("Discovery Engine Defaults");
      expect(html).toContain("Architecture &amp; System Information");
    });

    it("renders /login route under AuthLayout correctly", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/login"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Welcome back");
      expect(html).toContain("Email or Username");
      expect(html).toContain("Sign In");
      expect(html).toContain("Create an account");
      // Auth layout should NOT render the main application sidebar navigation
      expect(html).not.toContain("Sidebar Navigation");
    });

    it("renders /register route under AuthLayout correctly", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/register"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Create an account");
      expect(html).toContain("Full Name");
      expect(html).toContain("Email Address");
      expect(html).toContain("Confirm Password");
      // Auth layout should NOT render the main application sidebar navigation
      expect(html).not.toContain("Sidebar Navigation");
    });

    it("renders 404 NotFoundPage for undefined routes", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/some-nonexistent-path"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Destination Not Found");
      expect(html).toContain("Return to Dashboard");
    });
  });

  describe("Core Layout & Navigation", () => {
    it("renders Sidebar with all required navigation items", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Sidebar />
        </MemoryRouter>
      );

      MAIN_NAV_ITEMS.forEach((item) => {
        expect(html).toContain(item.name);
        expect(html).toContain(`href="${item.href}"`);
      });

      expect(html).toContain("Explore Differently");
      expect(html).toContain("Phase 1 Shell");
    });

    it("applies active state styling to the active navigation item", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/library"]}>
          <Sidebar />
        </MemoryRouter>
      );

      // The library link should have active styling
      expect(html).toContain('href="/library"');
      expect(html).toContain("text-white border-l-2 border-[#ff5a36]");
    });

    it("renders Header with branding, breadcrumbs, search shortcut, and status badge", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Header />
        </MemoryRouter>
      );

      expect(html).toContain("OFFBEAT");
      expect(html).toContain("href=\"/search\"");
      expect(html).toContain("href=\"/profile\"");
      expect(html).toContain("Phase 1 Foundation");
    });
  });
});
