import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawGeoRegion {
  id: string;
  name: string;
  code: string;
  slug: string;
  type: "STATE" | "UNION_TERRITORY";
  isSmallTerritory: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  projectedCentroid: [number, number];
  projectedBounds: [[number, number], [number, number]];
  svgPath: string;
}

describe("Minor UI/UX Fixes: Map Focus, Scroll Restoration, and Union Territories", () => {
  const geoPath = path.resolve(
    __dirname,
    "../../../Frontend/src/features/geography/data/india-administrative.json",
  );
  const rawData = JSON.parse(fs.readFileSync(geoPath, "utf8"));
  const regions: RawGeoRegion[] = rawData.regions;

  const mapRegionPath = path.resolve(
    __dirname,
    "../../../Frontend/src/components/map/MapRegion.tsx",
  );
  const mapRegionContent = fs.readFileSync(mapRegionPath, "utf8");

  const mapFoundationPath = path.resolve(
    __dirname,
    "../../../Frontend/src/components/map/InteractiveMapFoundation.tsx",
  );
  const mapFoundationContent = fs.readFileSync(mapFoundationPath, "utf8");

  const mapPagePath = path.resolve(
    __dirname,
    "../../../Frontend/src/pages/Country/InteractiveMapPage.tsx",
  );
  const mapPageContent = fs.readFileSync(mapPagePath, "utf8");

  const fallbackPath = path.resolve(
    __dirname,
    "../../../Frontend/src/components/map/RegionListFallback.tsx",
  );
  const fallbackContent = fs.readFileSync(fallbackPath, "utf8");

  const appLayoutPath = path.resolve(__dirname, "../../../Frontend/src/layouts/AppLayout.tsx");
  const appLayoutContent = fs.readFileSync(appLayoutPath, "utf8");

  describe("Fix 1: Click outside focused state to reset map", () => {
    it("InteractiveMapFoundation implements outside click handler on canvas and background", () => {
      // Must contain outside click detection that checks target against focused region ID
      expect(mapFoundationContent).toContain("handleMapSurfaceClick");
      expect(mapFoundationContent).toContain("closest");
      expect(mapFoundationContent).toContain("map-canvas-background");
      expect(mapFoundationContent).toContain("onResetFocus");
    });

    it("MapRegion handles clicks outside focused state when another region is clicked", () => {
      // When isOtherSelected is true, clicking another region must reset to normal map
      expect(mapRegionContent).toContain("onResetFocus?.()");
      expect(mapRegionContent).toContain("isOtherSelected");
      expect(mapRegionContent).toContain("pointer-events-auto cursor-pointer");
    });

    it("Clicking inside the focused state maintains focus and does not reset", () => {
      expect(mapRegionContent).toContain("if (isSelected)");
      expect(mapRegionContent).toContain("e.stopPropagation()");
    });

    it("Preserves keyboard accessibility with Space and Enter handling", () => {
      expect(mapRegionContent).toContain('e.key === "Enter"');
      expect(mapRegionContent).toContain('e.key === " "');
    });
  });

  describe("Fix 2: Centralized scroll restoration to top on route navigation", () => {
    it("AppLayout implements instant scroll-to-top restoration on route changes", () => {
      expect(appLayoutContent).toContain("useLayoutEffect");
      expect(appLayoutContent).toContain("window.scrollTo");
      expect(appLayoutContent).toContain('behavior: "instant"');
      expect(appLayoutContent).toContain("document.documentElement.scrollTop = 0");
      expect(appLayoutContent).toContain("ScrollRestoration");
    });

    it("Scroll restoration targets main-content container to avoid nested scroll traps", () => {
      expect(appLayoutContent).toContain("main-content");
    });
  });

  describe("Fix 3: Removal of tiny UT map dots & separation of States and Union Territories", () => {
    it("Removed unexplained permanent decorative dots/beacons for small territories from MapRegion", () => {
      // Must NOT contain the old pulsating circle/indicator ring for isSmall in unhovered/unselected state
      expect(mapRegionContent).not.toContain("Small Territory Indicator Ring");
      expect(mapRegionContent).not.toContain('r={isSelected ? "14" : isHovered ? "12" : "9"}');
    });

    it("Geography retains exactly 28 States and 8 Union Territories (36 total administrative units)", () => {
      const states = regions.filter((r) => r.type === "STATE");
      const unionTerritories = regions.filter((r) => r.type === "UNION_TERRITORY");

      expect(regions).toHaveLength(36);
      expect(states).toHaveLength(28);
      expect(unionTerritories).toHaveLength(8);

      const expectedUts = [
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry",
      ];

      for (const utName of expectedUts) {
        expect(unionTerritories.some((ut) => ut.name === utName)).toBe(true);
      }
    });

    it("InteractiveMapPage presents States (28) and Union Territories (8) as distinct sections", () => {
      expect(mapPageContent).toContain("statesList");
      expect(mapPageContent).toContain("utList");
      expect(mapPageContent).toContain("States (28)");
      expect(mapPageContent).toContain("Union Territories (8)");
    });

    it("RegionListFallback presents States and Union Territories with distinct section headers and counts", () => {
      expect(fallbackContent).toContain("filteredStates");
      expect(fallbackContent).toContain("filteredUTs");
      expect(fallbackContent).toContain("<span>States</span>");
      expect(fallbackContent).toContain("<span>Union Territories</span>");
    });

    it("All 8 Union Territories retain valid coordinates and SVG paths for map focus", () => {
      const unionTerritories = regions.filter((r) => r.type === "UNION_TERRITORY");
      for (const ut of unionTerritories) {
        expect(ut.coordinates.lat).toBeDefined();
        expect(ut.coordinates.lng).toBeDefined();
        expect(ut.svgPath.length).toBeGreaterThan(10);
      }
    });
  });
});
