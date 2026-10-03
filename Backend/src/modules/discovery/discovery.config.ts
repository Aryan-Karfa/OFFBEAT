import type { ScorerWeights } from "./discovery.types.js";

/**
 * Deterministic scoring weights for Phase 7 Discovery Engine.
 * All weights sum to 1.00 (100%).
 */
export const DEFAULT_SCORER_WEIGHTS: ScorerWeights = {
  travelTaste: 0.3, // 30%
  experienceTaste: 0.3, // 30%
  categoryRelevance: 0.15, // 15%
  geographicRelevance: 0.1, // 10%
  dayNightCompatibility: 0.05, // 5%
  ratingSignal: 0.05, // 5%
  dataCompleteness: 0.05, // 5%
};

/**
 * Deterministic alias mapping between Travel Taste slugs and place keywords / categories.
 */
export const TRAVEL_TASTE_ALIASES: Record<string, string[]> = {
  mountains: [
    "mountain",
    "mountains",
    "peak",
    "peaks",
    "hill",
    "hills",
    "hill station",
    "ridge",
    "valley",
    "summit",
    "pass",
    "viewpoint",
    "himalayan",
  ],
  nature: [
    "nature",
    "wildlife",
    "forest",
    "national park",
    "sanctuary",
    "reserve",
    "canopy",
    "woods",
    "greenery",
    "botanical",
    "park",
  ],
  photography: [
    "photography",
    "photo",
    "vantage",
    "panoramic",
    "vista",
    "viewpoint",
    "scenic",
    "lookout",
    "sunrise",
    "sunset",
  ],
  historical: [
    "historical",
    "heritage",
    "monument",
    "fort",
    "palace",
    "ruin",
    "ancient",
    "memorial",
    "colonial",
    "castle",
  ],
  beaches: ["beach", "beaches", "coast", "coastal", "shore", "sea", "cove", "tide", "bay", "ocean"],
  food: [
    "food",
    "culinary",
    "restaurant",
    "dining",
    "eatery",
    "kitchen",
    "cuisine",
    "cafe",
    "bistro",
    "tea",
  ],
  spiritual: [
    "spiritual",
    "temple",
    "monastery",
    "gompa",
    "shrine",
    "ashram",
    "sacred",
    "pilgrimage",
    "church",
    "mosque",
  ],
  culture_art: [
    "culture",
    "art",
    "living art",
    "museum",
    "handicraft",
    "craft",
    "artisan",
    "folk",
    "tradition",
    "gallery",
  ],
  adventure: [
    "adventure",
    "trekking",
    "trek",
    "trail",
    "hiking",
    "rapids",
    "climbing",
    "expedition",
  ],
  local_life: [
    "local life",
    "village",
    "market",
    "homestay",
    "bazaar",
    "artisan",
    "slow travel",
    "community",
    "hamlet",
  ],
  sunrise_sunset: ["sunrise", "sunset", "dawn", "dusk", "twilight", "first light", "golden hour"],
  nightlife: [
    "nightlife",
    "night",
    "nocturnal",
    "dark sky",
    "stargazing",
    "bazaar",
    "night market",
    "lantern",
  ],
};

/**
 * Deterministic alias mapping between Experience Taste slugs and place keywords / descriptions.
 */
export const EXPERIENCE_TASTE_ALIASES: Record<string, string[]> = {
  sunrise: ["sunrise", "dawn", "first light", "morning", "early morning", "dawn light"],
  sunset: ["sunset", "dusk", "twilight", "evening", "golden hour", "horizon"],
  peaceful: ["peaceful", "serene", "quiet", "solitude", "tranquil", "calm", "secluded", "silent"],
  less_crowded: [
    "less crowded",
    "offbeat",
    "hidden gem",
    "unexplored",
    "quiet",
    "secluded",
    "secret",
  ],
  photography: ["photography", "vantage", "panoramic", "frame", "scenic", "viewpoint", "vista"],
  adventure: ["adventure", "trail", "trek", "climb", "adrenaline", "steep", "rugged"],
  wildlife_spotting: ["wildlife", "bird", "fauna", "animal", "sanctuary", "safari", "nature"],
  forest_trails: ["forest", "trail", "woods", "canopy", "grove", "mossy", "path"],
  ancient_ruins: ["ruin", "ancient", "archaeological", "carving", "fortress", "stone"],
  architectural_detail: [
    "architectural",
    "architecture",
    "monument",
    "facade",
    "geometry",
    "dome",
    "pillar",
  ],
  guided_stories: ["story", "stories", "folklore", "history", "guide", "lore", "oral history"],
  coastal_walks: ["coastal", "headland", "sea cliff", "beach walk", "inlet", "tide"],
  seafood: ["seafood", "fish", "curry", "catch", "harbor", "estuary"],
  street_food: ["street food", "bazaar", "snack", "wok", "market stall", "chaat"],
  authentic_recipes: ["authentic", "heirloom", "traditional", "kitchen", "organic", "hearth"],
  monastic_chants: ["monastic", "chant", "gompa", "monastery", "prayer", "bell", "cymbal"],
  sacred_rituals: ["ritual", "sacred", "ghat", "ceremony", "aarti", "lamp", "incense"],
  artisan_studios: ["artisan", "studio", "workshop", "potter", "weaver", "craft", "handloom"],
  folk_performances: ["folk", "ballad", "music", "dance", "song", "baul", "instrument"],
  village_homestays: ["homestay", "village", "family", "rural", "hearth", "living alongside"],
  river_navigation: ["river", "boat", "skiff", "canoe", "waterway", "rowboat"],
  astro_sky: ["dark sky", "stargazing", "astronomy", "milky way", "night sky", "celestial"],
  night_bazaars: ["night bazaar", "night market", "lantern", "tea stall", "illuminated"],
  ambient_music: ["ambient", "acoustic", "campfire", "music", "fire gathering"],
};

/**
 * Category affinities for daytime vs nighttime suitability.
 */
export const DAY_AFFINITY_TOKENS = [
  "sunrise",
  "dawn",
  "morning",
  "day",
  "mountain",
  "beach",
  "trail",
  "trekking",
  "nature",
  "heritage",
  "monument",
  "viewpoint",
  "park",
  "garden",
  "temple",
  "monastery",
];

export const NIGHT_AFFINITY_TOKENS = [
  "sunset",
  "dusk",
  "night",
  "nightlife",
  "stargazing",
  "dark sky",
  "night market",
  "bazaar",
  "acoustic",
  "dinner",
  "evening",
  "lantern",
  "pub",
  "lounge",
];
