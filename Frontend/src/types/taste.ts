export type TimeContext = "day" | "night";

export interface TravelTaste {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  example?: string;
}

export interface ExperienceTaste {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  compatibleTravelTastes: string[];
}

export interface DiscoveryContext {
  country: string;
  region: string;
  travelTaste: string[];
  experienceTaste: string[];
  timeContext: TimeContext | null;
}

// Kept for backward compatibility with community discovery previews
export interface TravelTasteCategory {
  id: string;
  name: string;
  icon: string;
  descriptor: string;
  examples: string[];
}

export interface CommunityDiscoveryPreview {
  id: string;
  title: string;
  location: string;
  region: string;
  snippet: string;
  author: string;
  confidence: "verified" | "supported" | "new";
  tags: string[];
  upvotes: number;
}
