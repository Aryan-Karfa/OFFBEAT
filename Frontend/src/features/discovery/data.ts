import type { TravelTasteCategory, CommunityDiscoveryPreview } from "../../types/taste";

export const TRAVEL_TASTE_CATEGORIES: TravelTasteCategory[] = [
  {
    id: "mountains",
    name: "Mountains",
    icon: "🏔️",
    descriptor: "Peaks, valleys, viewpoints & escapes",
    examples: ["High passes", "Alpine meadows", "Valley homestays", "Pine ridge trails"],
  },
  {
    id: "historical",
    name: "Historical",
    icon: "🏛️",
    descriptor: "Ancient steps, ruins & heritage stories",
    examples: ["Stepwells", "Carved stone temples", "Old hill forts", "Colonial trails"],
  },
  {
    id: "nature",
    name: "Nature",
    icon: "🌿",
    descriptor: "Old-growth groves, waterfalls & biodiversity",
    examples: ["Sacred forests", "Estuary kayaking", "Bird sanctuaries", "River canyons"],
  },
  {
    id: "beaches",
    name: "Beaches",
    icon: "🏖️",
    descriptor: "Quiet shores, coves & coastal rhythms",
    examples: ["Fisherman coves", "Cliffside beaches", "Bioluminescent waters", "Tide pools"],
  },
  {
    id: "food",
    name: "Food & Recipes",
    icon: "🍜",
    descriptor: "Local flavours, secret kitchens & regional recipes",
    examples: ["Tribal thalis", "Backwater claypot fish", "Heritage bakeries", "Tea tastings"],
  },
  {
    id: "photography",
    name: "Photography",
    icon: "📸",
    descriptor: "Golden hour light, dramatic frames & vantage points",
    examples: ["Sunrise ridge lookouts", "Starlit dunes", "Foggy valleys", "Temple shadows"],
  },
];

export const FEATURED_DISCOVERIES: CommunityDiscoveryPreview[] = [
  {
    id: "disc-1",
    title: "The Quiet Stepwell Behind Bundi's Old Quarter",
    location: "Bundi",
    region: "Rajasthan",
    snippet:
      "Not listed in mainstream guides. Descend three levels of carved sandstone arches at dawn for cool tranquility and zero tour crowds.",
    author: "Arjun S.",
    confidence: "verified",
    tags: ["Historical", "Architecture", "Early Morning"],
    upvotes: 42,
  },
  {
    id: "disc-2",
    title: "Hidden Moss Waterfall off the Darjeeling Ridge",
    location: "Kurseong / Darjeeling",
    region: "West Bengal",
    snippet:
      "Take the old forestry track 2km past Dow Hill. The sound of water leads down a fern gulley to a pristine twin cascade shrouded in cloud.",
    author: "Priya M.",
    confidence: "verified",
    tags: ["Nature", "Mountains", "Hiking"],
    upvotes: 68,
  },
  {
    id: "disc-3",
    title: "Sundarbans Dawn Wooden Skiff Through Mangrove Creeks",
    location: "Sundarbans National Park",
    region: "West Bengal",
    snippet:
      "Avoid large diesel tourist boats. Hire a licensed village rowboat guide from Gosaba at 5:30 AM to drift silently where kingfishers hunt.",
    author: "Debabrata R.",
    confidence: "supported",
    tags: ["Wildlife", "Photography", "Waterways"],
    upvotes: 31,
  },
  {
    id: "disc-4",
    title: "Hanle Dark Sky Reserve Village Homestay",
    location: "Hanle Valley",
    region: "Ladakh",
    snippet:
      "At 4,500m elevation with pristine zero-light pollution, the Milky Way core casts shadows across the Changthang plateau.",
    author: "Zorawar N.",
    confidence: "verified",
    tags: ["Stargazing", "High Altitude", "Photography"],
    upvotes: 89,
  },
  {
    id: "disc-5",
    title: "Secret Pottery Village on the Majuli River Island",
    location: "Majuli",
    region: "Assam",
    snippet:
      "Generations of Salmora artisans still shape terracotta pots entirely by hand without a potter's wheel, firing them in open driftwood pits.",
    author: "Ananya B.",
    confidence: "new",
    tags: ["Craft Heritage", "River", "Culture"],
    upvotes: 14,
  },
];
