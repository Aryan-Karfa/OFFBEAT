import type { CanonicalTakeHomeDefinition } from "./take-home.types.js";

export const CANONICAL_TAKE_HOME_ITEMS: CanonicalTakeHomeDefinition[] = [
  // ==========================================
  // Darjeeling (West Bengal)
  // ==========================================
  {
    id: "item_darjeeling_tea",
    name: "Darjeeling First Flush & Muscatel Tea",
    category: "TEA_COFFEE",
    categories: ["TEA_COFFEE", "FOOD", "GIFT", "LOCAL_PRODUCT"],
    destinationId: "dest_darjeeling",
    destinationName: "Darjeeling",
    regionId: "IN-WB",
    description:
      "World-famous high-altitude teas harvested across historic Himalayan slopes with protected Geographical Indication.",
    whyTakeHome:
      "A globally celebrated Himalayan specialty with unique Geographical Indication (GI) status, delicate floral aroma, and distinct seasonal flushes.",
    localRelevance: "SIGNATURE",
    goodFor: ["GIFT", "PERSONAL", "FAMILY", "COLLECTOR"],
    budget: "MEDIUM",
    confidenceScore: 0.95,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "store_nathmulls_tea",
        externalId: "ext_nathmulls_darjeeling",
        name: "Nathmulls Tea Room & Boutique",
        type: "STORE",
        address: "The Mall / Chowrasta, Darjeeling, West Bengal 734101",
        location: { lat: 27.0435, lng: 88.2662 },
        rating: 4.8,
        reviewCount: 420,
        source: "INTERNAL",
      },
      {
        placeId: "estate_happy_valley",
        externalId: "ext_happy_valley_outlet",
        name: "Happy Valley Tea Estate Outlet",
        type: "TEA_ESTATE",
        address: "Lebong Cart Road, Darjeeling, West Bengal 734101",
        location: { lat: 27.0541, lng: 88.2618 },
        rating: 4.6,
        reviewCount: 310,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_darjeeling_crafts",
        name: "Tibetan & Bhutia Handcrafted Curios",
        category: "HANDICRAFT",
        why: "Non-perishable artisanal keepsake carrying rich Himalayan cultural heritage",
      },
      {
        id: "item_darjeeling_churpi",
        name: "Smoked Himalayan Yak Churpi",
        category: "FOOD",
        why: "Traditional high-altitude mountain dairy snack with savory earthy notes",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800",
    tasteAffinity: {
      travelTastes: ["food", "culture", "nature"],
      experienceTastes: ["tea", "shopping", "heritage", "peaceful"],
    },
  },
  {
    id: "item_darjeeling_crafts",
    name: "Tibetan & Bhutia Handcrafted Curios & Thangkas",
    category: "HANDICRAFT",
    categories: ["HANDICRAFT", "ART", "CULTURAL_GOOD", "GIFT"],
    destinationId: "dest_darjeeling",
    destinationName: "Darjeeling",
    regionId: "IN-WB",
    description:
      "Handmade Buddhist prayer wheels, carved cedar masks, and intricate scroll paintings by indigenous craftspeople.",
    whyTakeHome:
      "Directly supports local refugee and artisan guilds while carrying authentic Eastern Himalayan Buddhist aesthetic traditions.",
    localRelevance: "STRONGLY_ASSOCIATED",
    goodFor: ["COLLECTOR", "GIFT", "PERSONAL"],
    budget: "MEDIUM",
    confidenceScore: 0.88,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "center_tibetan_refugee",
        externalId: "ext_tibetan_refugee_center",
        name: "Tibetan Refugee Self-Help Centre",
        type: "CRAFT_WORKSHOP",
        address: "Hill Cart Road / Gandhi Road, Darjeeling, West Bengal 734101",
        location: { lat: 27.048, lng: 88.271 },
        rating: 4.7,
        reviewCount: 195,
        source: "INTERNAL",
      },
      {
        placeId: "chowrasta_curios",
        externalId: "ext_chowrasta_craft_guild",
        name: "Chowrasta Curio & Craft Guild",
        type: "MARKET",
        address: "The Mall / Chowrasta, Darjeeling, West Bengal 734101",
        location: { lat: 27.0438, lng: 88.2665 },
        rating: 4.5,
        reviewCount: 140,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_darjeeling_tea",
        name: "Darjeeling First Flush Tea",
        category: "TEA_COFFEE",
        why: "Signature world-renowned brew from local tea gardens",
      },
      {
        id: "item_darjeeling_woolens",
        name: "Himalayan Hand-Knitted Woolens",
        category: "TEXTILE",
        why: "Warm wearable souvenir handcrafted by mountain knitters",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800",
    tasteAffinity: {
      travelTastes: ["culture", "art", "photography"],
      experienceTastes: ["craft", "shopping", "spiritual"],
    },
  },
  {
    id: "item_darjeeling_woolens",
    name: "Himalayan Hand-Knitted Woolens & Shawls",
    category: "TEXTILE",
    categories: ["TEXTILE", "LOCAL_PRODUCT", "GIFT"],
    destinationId: "dest_darjeeling",
    destinationName: "Darjeeling",
    regionId: "IN-WB",
    description:
      "Hand-knitted pure wool cardigans, beanies, mufflers, and pashmina-blend stoles made for mountain winters.",
    whyTakeHome:
      "Practical, warm, and directly knitted by local Himalayan women cooperatives at fair community rates.",
    localRelevance: "LOCAL",
    goodFor: ["PERSONAL", "FAMILY", "GIFT"],
    budget: "LOW",
    confidenceScore: 0.82,
    evidenceStrength: "MODERATE",
    defaultSources: [
      {
        placeId: "market_mahakal_woolens",
        externalId: "ext_mahakal_market_darjeeling",
        name: "Mahakal Market Woolen Cooperative",
        type: "MARKET",
        address: "Laden La Road, Darjeeling, West Bengal 734101",
        location: { lat: 27.041, lng: 88.264 },
        rating: 4.4,
        reviewCount: 112,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_darjeeling_crafts",
        name: "Tibetan & Bhutia Handcrafted Curios",
        category: "HANDICRAFT",
        why: "Artistic keepsake representing local culture",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
    tasteAffinity: {
      travelTastes: ["culture", "local-life"],
      experienceTastes: ["shopping", "comfort"],
    },
  },
  {
    id: "item_darjeeling_churpi",
    name: "Smoked Himalayan Yak Churpi & Forest Honey",
    category: "FOOD",
    categories: ["FOOD", "LOCAL_PRODUCT"],
    destinationId: "dest_darjeeling",
    destinationName: "Darjeeling",
    regionId: "IN-WB",
    description:
      "Traditional sun-dried yak cheese bites alongside unprocessed wild raw honey from regional apiaries.",
    whyTakeHome:
      "A rare indigenous Himalayan staple with extraordinary shelf-life and authentic pastoral heritage.",
    localRelevance: "LOCAL",
    goodFor: ["PERSONAL", "FRIENDS"],
    budget: "LOW",
    confidenceScore: 0.8,
    evidenceStrength: "MODERATE",
    defaultSources: [
      {
        placeId: "keventers_dairy_counter",
        externalId: "ext_keventers_counter",
        name: "Keventers Dairy & Produce Counter",
        type: "LOCAL_BUSINESS",
        address: "Clubside, 1 Nehru Road, Darjeeling, West Bengal 734101",
        location: { lat: 27.0422, lng: 88.2655 },
        rating: 4.5,
        reviewCount: 380,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_darjeeling_tea",
        name: "Darjeeling First Flush Tea",
        category: "TEA_COFFEE",
        why: "More universal culinary gift suitable for wider audiences",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
    tasteAffinity: {
      travelTastes: ["food", "adventure"],
      experienceTastes: ["culinary", "unusual"],
    },
  },

  // ==========================================
  // Kolkata (West Bengal)
  // ==========================================
  {
    id: "item_kolkata_tant_silk",
    name: "Bengal Handloom Tant & Baluchari Silk Sarees",
    category: "TEXTILE",
    categories: ["TEXTILE", "CULTURAL_GOOD", "GIFT"],
    destinationId: "dest_kolkata",
    destinationName: "Kolkata",
    regionId: "IN-WB",
    description:
      "Handwoven cotton Tant and mulberry Baluchari silk weaves depicting classical epics and Bengal motifs.",
    whyTakeHome:
      "Timeless artisanal textiles woven on traditional wooden pit looms with centuries of heritage acclaim.",
    localRelevance: "SIGNATURE",
    goodFor: ["GIFT", "FAMILY", "COLLECTOR"],
    budget: "MEDIUM",
    confidenceScore: 0.92,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "complex_dakshinapan",
        externalId: "ext_dakshinapan_kolkata",
        name: "Dakshinapan Handicrafts Complex",
        type: "MARKET",
        address: "Gariahat Flyover, Dhakuria, Kolkata, West Bengal 700068",
        location: { lat: 22.5085, lng: 88.365 },
        rating: 4.7,
        reviewCount: 520,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_kolkata_patachitra",
        name: "Kalighat Patachitra Heritage Art",
        category: "ART",
        why: "Visual folk art alternative from historic Kolkata painters",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    tasteAffinity: {
      travelTastes: ["culture", "art", "shopping"],
      experienceTastes: ["handloom", "heritage"],
    },
  },
  {
    id: "item_kolkata_sweets",
    name: "Nolen Gur Sandesh & Packaged Rosogolla",
    category: "SWEETS",
    categories: ["SWEETS", "FOOD", "GIFT"],
    destinationId: "dest_kolkata",
    destinationName: "Kolkata",
    regionId: "IN-WB",
    description:
      "Legendary confections made from cow's milk chhena and seasonal date palm jaggery (Nolen Gur).",
    whyTakeHome:
      "The quintessential Bengal culinary gift with unmatched sweetness and rich artisanal confectionary tradition.",
    localRelevance: "SIGNATURE",
    goodFor: ["FAMILY", "FRIENDS", "GIFT", "PERSONAL"],
    budget: "LOW",
    confidenceScore: 0.94,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "store_balaram_mullick",
        externalId: "ext_balaram_mullick_kolkata",
        name: "Balaram Mullick & Radharaman Mullick Sweets",
        type: "STORE",
        address: "2 Paddapukur Road, Bhowanipore, Kolkata, West Bengal 700020",
        location: { lat: 22.5335, lng: 88.349 },
        rating: 4.8,
        reviewCount: 680,
        source: "INTERNAL",
      },
      {
        placeId: "store_kc_das",
        externalId: "ext_kc_das_kolkata",
        name: "K.C. Das Heritage Sweets",
        type: "STORE",
        address: "11A Esplanade East, Chowringhee, Kolkata, West Bengal 700069",
        location: { lat: 22.564, lng: 88.352 },
        rating: 4.6,
        reviewCount: 450,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_kolkata_tant_silk",
        name: "Bengal Handloom Tant Saree",
        category: "TEXTILE",
        why: "Long-lasting non-perishable gift",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800",
    tasteAffinity: {
      travelTastes: ["food", "culinary"],
      experienceTastes: ["sweets", "tasting"],
    },
  },
  {
    id: "item_kolkata_patachitra",
    name: "Kalighat Patachitra Heritage Folk Art",
    category: "ART",
    categories: ["ART", "CULTURAL_GOOD", "GIFT"],
    destinationId: "dest_kolkata",
    destinationName: "Kolkata",
    regionId: "IN-WB",
    description:
      "Distinctive 19th-century folk painting style on mill paper depicting folklore, mythology, and social satire.",
    whyTakeHome:
      "An evocative art movement born around Kalighat temple, preserved by generational Patua folk painters.",
    localRelevance: "STRONGLY_ASSOCIATED",
    goodFor: ["COLLECTOR", "GIFT", "PERSONAL"],
    budget: "MEDIUM",
    confidenceScore: 0.86,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "store_kalighat_art_collective",
        externalId: "ext_kalighat_patua_artists",
        name: "Kalighat Patua Artist Collective",
        type: "CRAFT_WORKSHOP",
        address: "Kalighat Temple Lane, Kolkata, West Bengal 700026",
        location: { lat: 22.5218, lng: 88.3425 },
        rating: 4.6,
        reviewCount: 130,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_kolkata_tant_silk",
        name: "Bengal Baluchari Silk Saree",
        category: "TEXTILE",
        why: "Textile expression of Bengali mythological motifs",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800",
    tasteAffinity: {
      travelTastes: ["art", "culture", "history"],
      experienceTastes: ["painting", "antiques"],
    },
  },

  // ==========================================
  // Digha (West Bengal)
  // ==========================================
  {
    id: "item_digha_cashews",
    name: "Coastal Plantation Roasted Cashews",
    category: "FOOD",
    categories: ["FOOD", "LOCAL_PRODUCT", "GIFT"],
    destinationId: "dest_digha",
    destinationName: "Digha",
    regionId: "IN-WB",
    description:
      "Freshly harvested cashews grown along the red soil coastal belt of Purba Medinipur, wood-fire roasted on order.",
    whyTakeHome:
      "Known throughout coastal Bengal for crispy, sweet flavor straight from local plantation processors.",
    localRelevance: "SIGNATURE",
    goodFor: ["FAMILY", "FRIENDS", "PERSONAL", "GIFT"],
    budget: "LOW",
    confidenceScore: 0.88,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "market_digha_cashews",
        externalId: "ext_old_digha_cashew_mkt",
        name: "Old Digha Cashew Market Guild",
        type: "MARKET",
        address: "Sea Beach Road, Old Digha, West Bengal 721428",
        location: { lat: 21.627, lng: 87.508 },
        rating: 4.5,
        reviewCount: 220,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_digha_conch",
        name: "Hand-Carved Conch Shell Crafts",
        category: "HANDICRAFT",
        why: "Traditional coastal artisanal craft keepsake",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    tasteAffinity: {
      travelTastes: ["food", "nature"],
      experienceTastes: ["culinary", "shopping"],
    },
  },
  {
    id: "item_digha_conch",
    name: "Hand-Carved Conch Shell Bangles & Decorative Shankha",
    category: "HANDICRAFT",
    categories: ["HANDICRAFT", "CULTURAL_GOOD", "GIFT"],
    destinationId: "dest_digha",
    destinationName: "Digha",
    regionId: "IN-WB",
    description:
      "Hand-etched sea conch ornaments and sacred blow-horns engraved with coastal floral motifs.",
    whyTakeHome:
      "An enduring coastal Bengal artisan specialty crafted by generational shell carvers using age-old hand lathes.",
    localRelevance: "LOCAL",
    goodFor: ["GIFT", "COLLECTOR", "FAMILY"],
    budget: "LOW",
    confidenceScore: 0.82,
    evidenceStrength: "MODERATE",
    defaultSources: [
      {
        placeId: "stall_new_digha_shells",
        externalId: "ext_new_digha_shell_market",
        name: "New Digha Coastal Artisan Shell Market",
        type: "MARKET",
        address: "Foreshore Road, New Digha, West Bengal 721463",
        location: { lat: 21.618, lng: 87.495 },
        rating: 4.3,
        reviewCount: 95,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_digha_cashews",
        name: "Coastal Plantation Roasted Cashews",
        category: "FOOD",
        why: "Signature edible coastal regional specialty",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
    tasteAffinity: {
      travelTastes: ["culture", "craft"],
      experienceTastes: ["coastal", "shopping"],
    },
  },

  // ==========================================
  // Jodhpur (Rajasthan)
  // ==========================================
  {
    id: "item_jodhpur_bandhani",
    name: "Marwar Bandhani & Leheriya Silk Dupattas",
    category: "TEXTILE",
    categories: ["TEXTILE", "CULTURAL_GOOD", "GIFT"],
    destinationId: "dest_jodhpur",
    destinationName: "Jodhpur",
    regionId: "IN-RJ",
    description:
      "Vibrant desert tie-dye and ripple wave patterns dyed with natural pigments by Marwar Khatri communities.",
    whyTakeHome:
      "World-renowned textile art of Rajasthan capturing the kaleidoscope colors of desert festivals.",
    localRelevance: "SIGNATURE",
    goodFor: ["GIFT", "PERSONAL", "FAMILY"],
    budget: "MEDIUM",
    confidenceScore: 0.91,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "market_sardar_bazaar",
        externalId: "ext_sardar_bazaar_jodhpur",
        name: "Sardar Market Clock Tower Bazaars",
        type: "MARKET",
        address: "Ghanta Ghar, Old City, Jodhpur, Rajasthan 342001",
        location: { lat: 26.295, lng: 73.023 },
        rating: 4.6,
        reviewCount: 480,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_jodhpur_mojari",
        name: "Handcrafted Camel Leather Mojaris",
        category: "HANDICRAFT",
        why: "Embroidered traditional footwear specialty",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
    tasteAffinity: {
      travelTastes: ["culture", "art"],
      experienceTastes: ["shopping", "heritage"],
    },
  },
  {
    id: "item_jodhpur_mojari",
    name: "Handcrafted Camel Leather Mojaris",
    category: "HANDICRAFT",
    categories: ["HANDICRAFT", "LOCAL_PRODUCT", "GIFT"],
    destinationId: "dest_jodhpur",
    destinationName: "Jodhpur",
    regionId: "IN-RJ",
    description:
      "Curled-toe leather juttis stitched with zari and silk thread embroidery by local cobbler guilds.",
    whyTakeHome:
      "Comfortable traditional footwear crafted using century-old vegetable tanning and hand-embroidery methods.",
    localRelevance: "STRONGLY_ASSOCIATED",
    goodFor: ["PERSONAL", "GIFT"],
    budget: "LOW",
    confidenceScore: 0.85,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "mojari_lane_tripolia",
        externalId: "ext_tripolia_bazaar_jodhpur",
        name: "Tripolia Bazaar Leather Guild",
        type: "MARKET",
        address: "Tripolia Road, Jodhpur, Rajasthan 342001",
        location: { lat: 26.294, lng: 73.021 },
        rating: 4.4,
        reviewCount: 160,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_jodhpur_bandhani",
        name: "Marwar Bandhani Dupatta",
        category: "TEXTILE",
        why: "Iconic royal Rajasthani textile souvenir",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    tasteAffinity: {
      travelTastes: ["craft", "culture"],
      experienceTastes: ["leatherwork", "shopping"],
    },
  },

  // ==========================================
  // Munnar (Kerala)
  // ==========================================
  {
    id: "item_munnar_spices",
    name: "Highland Estate Green Cardamom & Black Pepper",
    category: "SPICES",
    categories: ["SPICES", "FOOD", "LOCAL_PRODUCT", "GIFT"],
    destinationId: "dest_munnar",
    destinationName: "Munnar",
    regionId: "IN-KL",
    description:
      "Aromatic whole spices freshly harvested from mist-covered plantations across the Western Ghats.",
    whyTakeHome:
      "High elevation produces intense essential oil concentrations unmatched by commercial store-bought spices.",
    localRelevance: "SIGNATURE",
    goodFor: ["FAMILY", "FRIENDS", "PERSONAL", "GIFT"],
    budget: "LOW",
    confidenceScore: 0.93,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "market_munnar_spices",
        externalId: "ext_munnar_spice_bazaar",
        name: "Munnar Spice Growers Cooperative",
        type: "MARKET",
        address: "Main Bazaar, Munnar, Kerala 685612",
        location: { lat: 10.089, lng: 77.06 },
        rating: 4.7,
        reviewCount: 390,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_munnar_tea",
        name: "Kolukkumalai High-Grown Orthodox Tea",
        category: "TEA_COFFEE",
        why: "Signature world-highest elevation orthodox black tea",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800",
    tasteAffinity: {
      travelTastes: ["food", "nature"],
      experienceTastes: ["culinary", "plantations"],
    },
  },
  {
    id: "item_munnar_tea",
    name: "Kolukkumalai High-Grown Orthodox Tea",
    category: "TEA_COFFEE",
    categories: ["TEA_COFFEE", "FOOD", "GIFT"],
    destinationId: "dest_munnar",
    destinationName: "Munnar",
    regionId: "IN-KL",
    description:
      "Single-estate handpicked orthodox leaf tea from estates sitting at over 7,900 feet above sea level.",
    whyTakeHome:
      "Celebrated as the highest elevation orthodox tea in the world, renowned for its golden liquor and citrus nuances.",
    localRelevance: "SIGNATURE",
    goodFor: ["GIFT", "PERSONAL", "FAMILY"],
    budget: "MEDIUM",
    confidenceScore: 0.9,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "tea_counter_kdhp",
        externalId: "ext_kdhp_munnar_outlet",
        name: "KDHP / Ripple Tea Factory Boutique",
        type: "STORE",
        address: "Nullatanni Estate, Munnar, Kerala 685612",
        location: { lat: 10.078, lng: 77.054 },
        rating: 4.6,
        reviewCount: 310,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_munnar_spices",
        name: "Highland Estate Green Cardamom",
        category: "SPICES",
        why: "Aromatic hill station culinary spice treasure",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
    tasteAffinity: {
      travelTastes: ["nature", "tea"],
      experienceTastes: ["tasting", "relaxation"],
    },
  },

  // ==========================================
  // Nubra Valley (Ladakh)
  // ==========================================
  {
    id: "item_nubra_pashmina",
    name: "Changthangi Pashmina Wool Shawls",
    category: "TEXTILE",
    categories: ["TEXTILE", "CULTURAL_GOOD", "GIFT"],
    destinationId: "dest_nubra",
    destinationName: "Nubra Valley",
    regionId: "IN-LA",
    description:
      "Pure Changthangi cashmere hand-carded and hand-spun by high-altitude Changpa nomadic pastoralists.",
    whyTakeHome:
      "One of the rarest and softest natural fibers on earth, authentically sourced from cold desert pastures.",
    localRelevance: "SIGNATURE",
    goodFor: ["COLLECTOR", "GIFT", "PERSONAL"],
    budget: "HIGH",
    confidenceScore: 0.94,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "coop_diskit_crafts",
        externalId: "ext_diskit_women_crafts",
        name: "Diskit Women's Craft Cooperative",
        type: "CRAFT_WORKSHOP",
        address: "Diskit Village, Nubra Valley, Ladakh 194401",
        location: { lat: 34.542, lng: 77.561 },
        rating: 4.8,
        reviewCount: 90,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_nubra_seabuckthorn",
        name: "Wild Himalayan Seabuckthorn Berry Nectar",
        category: "BEAUTY_WELLNESS",
        why: "Accessible and healthy natural wellness specialty",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800",
    tasteAffinity: {
      travelTastes: ["culture", "craft"],
      experienceTastes: ["artisan", "heritage"],
    },
  },
  {
    id: "item_nubra_seabuckthorn",
    name: "Wild Himalayan Seabuckthorn Berry Nectar & Oil",
    category: "BEAUTY_WELLNESS",
    categories: ["BEAUTY_WELLNESS", "FOOD", "LOCAL_PRODUCT"],
    destinationId: "dest_nubra",
    destinationName: "Nubra Valley",
    regionId: "IN-LA",
    description:
      "Cold-pressed oil and pure fruit preserve extracted from wild 'Leh Berry' bushes growing along the Shyok River.",
    whyTakeHome:
      "A high-altitude superfood bursting with natural Vitamin C, Omegas, and revitalizing bio-actives.",
    localRelevance: "STRONGLY_ASSOCIATED",
    goodFor: ["PERSONAL", "FRIENDS", "GIFT"],
    budget: "LOW",
    confidenceScore: 0.87,
    evidenceStrength: "HIGH",
    defaultSources: [
      {
        placeId: "hunder_local_produce",
        externalId: "ext_hunder_organic_center",
        name: "Hunder Organic Village Center",
        type: "LOCAL_BUSINESS",
        address: "Hunder Village, Nubra Valley, Ladakh 194401",
        location: { lat: 34.582, lng: 77.475 },
        rating: 4.6,
        reviewCount: 75,
        source: "INTERNAL",
      },
    ],
    alternatives: [
      {
        id: "item_nubra_pashmina",
        name: "Changthangi Pashmina Shawl",
        category: "TEXTILE",
        why: "Luxury hand-spun highland heirloom textile",
      },
    ],
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800",
    tasteAffinity: {
      travelTastes: ["health", "nature"],
      experienceTastes: ["wellness", "organic"],
    },
  },
];
