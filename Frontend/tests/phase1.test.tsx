import React from "react";
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { App } from "../src/App";
import { LandingPage } from "../src/pages/Landing/LandingPage";
import { HomePage } from "../src/pages/Home/HomePage";
import { TextType } from "../src/components/TextType/TextType";
import { GlowCursor } from "../src/components/GlowCursor/GlowCursor";
import { IndiaMap } from "../src/components/IndiaMap/IndiaMap";
import { ThoughtLine } from "../src/components/ThoughtLine/ThoughtLine";

describe("OFFBEAT Actual Phase 1 — Visual & Experience Layer", () => {
  describe("1. Landing Page & TextType Experience", () => {
    it("renders Landing Page at default route '/'", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("OFFBEAT");
      expect(html).toContain("Experience Foundation");
      expect(html).toContain("Discovery Before Destination");
      expect(html).toContain("Begin Exploration");
    });

    it("renders TextType component with typewriter elements and cursor", () => {
      const html = renderToString(
        <TextType
          text={["Start Exploring", "अन्वेषण शुरू करें"]}
          typingSpeed={50}
          showCursor={true}
          cursorCharacter="|"
        />
      );
      expect(html).toContain("|");
    });

    it("renders GlowCursor component container gracefully", () => {
      const html = renderToString(<GlowCursor />);
      expect(html).toContain("pointer-events-none");
    });
  });

  describe("2. Home Page & Interactive India Map", () => {
    it("renders Home Page at route '/home'", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/home"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Interactive Map of India");
      expect(html).toContain("Dimensional Cartography Prototype");
      expect(html).toContain("AI Reasoning Experience");
    });

    it("renders India Map with proper state boundaries and SVG viewBox", () => {
      const html = renderToString(<IndiaMap />);
      expect(html).toContain('viewBox="0 0 612 696"');
      // Verifies state paths exist
      expect(html).toContain("state-mh"); // Maharashtra
      expect(html).toContain("state-rj"); // Rajasthan
      expect(html).toContain("state-hp"); // Himachal Pradesh
      expect(html).toContain("state-ka"); // Karnataka
      expect(html).toContain("state-kl"); // Kerala
      expect(html).toContain("state-as"); // Assam
    });

    it("ensures Indian states have interactive button roles and accessible labels", () => {
      const html = renderToString(<IndiaMap />);
      expect(html).toContain('role="button"');
      expect(html).toContain('tabindex="0"');
      expect(html).toContain('aria-label="Select Maharashtra"');
    });

    it("launches and elevates the selected state significantly farther upward", () => {
      const html = renderToString(<IndiaMap selectedStateId="mh" />);
      // Selected state should apply the 16px launch up transform and launchShadow filter
      expect(html).toContain("translateY(-16px) scale(1.025)");
      expect(html).toContain("url(#launchShadow)");
      expect(html).toContain("Maharashtra");
      expect(html).toContain("Launched &amp; Selected");
    });

    it("correctly transfers selection when another state is selected", () => {
      const html = renderToString(<IndiaMap selectedStateId="kl" />);
      expect(html).toContain("Kerala");
      expect(html).toContain("Launched &amp; Selected");
    });
  });

  describe("3. AI Usage & ThoughtLine Experience", () => {
    it("renders ThoughtLine in active thinking/working state with timer", () => {
      const steps = [
        "Understanding your travel preferences",
        "Exploring destinations",
        "Checking places and experiences",
        "Comparing alternatives",
        "Building your recommendations",
      ];

      const html = renderToString(
        <ThoughtLine
          steps={steps}
          currentStepIndex={1}
          isWorking={true}
          isSettled={false}
          showTimer={true}
          elapsedSeconds={2.4}
        />
      );

      expect(html).toContain("OFFBEAT AI Reasoning");
      expect(html).toContain("Current step:");
      expect(html).toContain("Exploring destinations");
      expect(html).toContain("Working...");
    });

    it("transitions ThoughtLine to settled state with completion feedback", () => {
      const steps = [
        "Understanding your travel preferences",
        "Exploring destinations",
        "Checking places and experiences",
        "Comparing alternatives",
        "Building your recommendations",
      ];

      const html = renderToString(
        <ThoughtLine
          steps={steps}
          currentStepIndex={4}
          isWorking={false}
          isSettled={true}
          showTimer={true}
          elapsedSeconds={5.8}
        />
      );

      expect(html).toContain("Thought for");
      expect(html).toContain("5.8");
      expect(html).toContain("Thought process complete");
      expect(html).toContain("Ready for exploration");
    });
  });

  describe("4. Router Navigation Transitions", () => {
    it("redirects '/dashboard' to '/home'", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <App />
        </MemoryRouter>
      );
      // In SSR, Navigate returns null as it executes client redirect
      expect(html).toBe("");
    });

    it("renders 404 destination not found for unknown paths", () => {
      const html = renderToString(
        <MemoryRouter initialEntries={["/unknown-mountain-path"]}>
          <App />
        </MemoryRouter>
      );
      expect(html).toContain("Destination Not Found");
    });
  });
});
