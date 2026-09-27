export type ConfidenceLevel = "verified" | "supported" | "new" | "flagged";

export type MapInteractionState =
  "idle" | "hover" | "pressed" | "rising" | "focused" | "active" | "exploring" | "back";

export interface DestinationPreview {
  id: string;
  name: string;
  type: string;
  tagline: string;
  highlight: string;
  discoveryCount: number;
}

export interface Region {
  id: string;
  countryId: string;
  name: string;
  code: string;
  type: "STATE" | "UNION_TERRITORY";
  slug: string;
  zone: "North" | "South" | "East" | "West" | "Northeast" | "Central";
  tagline: string;
  description: string;
  tags: string[];
  discoveryCount: number;
  highlight: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bbox?: [number, number, number, number];
  projectedCentroid?: [number, number];
  projectedBounds?: [[number, number], [number, number]];
  isSmallTerritory?: boolean;
  labelAnchor?: [number, number];
  svgPath: string;
  geometry?: unknown;
  destinations: DestinationPreview[];
}

export interface Country {
  id: string;
  name: string;
  code: string;
  tagline: string;
  description: string;
  regionsCount: number;
  communityDiscoveriesCount: number;
  image?: string;
  isAvailable: boolean;
}
