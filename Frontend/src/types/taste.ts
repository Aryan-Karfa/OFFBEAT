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
