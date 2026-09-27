export type ConfidenceLevel = "verified" | "supported" | "new" | "flagged";

export interface Region {
  id: string;
  name: string;
  code: string;
  zone: "North" | "South" | "East" | "West" | "Northeast" | "Central";
  tagline: string;
  tags: string[];
  discoveryCount: number;
  highlight: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  svgPath?: string;
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
