/**
 * Canonical Phase 5 Seed Data Definitions
 * Used by prisma/seed.ts and verified by integrity test suites.
 */

export const SEED_CATEGORIES = [
  {
    id: "cat_historical",
    name: "Historical",
    slug: "historical",
    description:
      "Heritage monuments, ancient forts, architectural landmarks, and historic quarters.",
  },
  {
    id: "cat_beach",
    name: "Beach",
    slug: "beach",
    description: "Pristine coastlines, secluded coves, and oceanic retreats.",
  },
  {
    id: "cat_mountain",
    name: "Mountain",
    slug: "mountain",
    description: "High-altitude peaks, misty mountain ranges, and alpine valleys.",
  },
  {
    id: "cat_nature",
    name: "Nature",
    slug: "nature",
    description: "Untamed wilderness, living root bridges, biosphere reserves, and national parks.",
  },
  {
    id: "cat_restaurant",
    name: "Restaurant",
    slug: "restaurant",
    description: "Authentic culinary joints, heritage kitchens, and iconic local eateries.",
  },
  {
    id: "cat_photography",
    name: "Photography",
    slug: "photography",
    description: "Panoramic vantage points, golden hour vistas, and dramatic landscapes.",
  },
  {
    id: "cat_spiritual",
    name: "Spiritual",
    slug: "spiritual",
    description: "Monasteries, sacred groves, ancient shrines, and tranquil pilgrimage routes.",
  },
  {
    id: "cat_adventure",
    name: "Adventure",
    slug: "adventure",
    description: "Trekking trails, river rapids, dune crossing, and wilderness exploration.",
  },
  {
    id: "cat_culture",
    name: "Culture",
    slug: "culture",
    description: "Living arts, folk performances, artisan villages, and indigenous heritage.",
  },
  {
    id: "cat_local_business",
    name: "Local Business",
    slug: "local-business",
    description: "Traditional markets, independent craft studios, and generational workshops.",
  },
  {
    id: "cat_sunrise",
    name: "Sunrise",
    slug: "sunrise",
    description: "Magical early morning viewpoints and first-light horizons.",
  },
];

export const SEED_DESTINATIONS = [
  // West Bengal Destinations
  {
    id: "dest_darjeeling",
    regionId: "IN-WB",
    name: "Darjeeling",
    slug: "darjeeling",
    description: "Colonial tea capital perched on Himalayan ridges overlooking Mount Kanchenjunga.",
    coordinates: { lat: 27.036, lng: 88.2627 },
  },
  {
    id: "dest_kolkata",
    regionId: "IN-WB",
    name: "Kolkata",
    slug: "kolkata",
    description:
      "Cultural capital along the Hooghly River rich with literature, adda lanes, and Raj-era heritage.",
    coordinates: { lat: 22.5726, lng: 88.3639 },
  },
  {
    id: "dest_digha",
    regionId: "IN-WB",
    name: "Digha",
    slug: "digha",
    description: "Bay of Bengal seaside stretch with casuarina groves and wide coastal tides.",
    coordinates: { lat: 21.6266, lng: 87.5074 },
  },
  // Rajasthan Destination
  {
    id: "dest_jodhpur",
    regionId: "IN-RJ",
    name: "Jodhpur",
    slug: "jodhpur",
    description:
      "The Blue City flanking the Thar Desert beneath the towering ramparts of Mehrangarh.",
    coordinates: { lat: 26.2389, lng: 73.0243 },
  },
  // Kerala Destination
  {
    id: "dest_munnar",
    regionId: "IN-KL",
    name: "Munnar",
    slug: "munnar",
    description:
      "Misty Western Ghats hill station enveloped in rolling high-altitude tea plantations.",
    coordinates: { lat: 10.0889, lng: 77.0595 },
  },
  // Ladakh Destination
  {
    id: "dest_nubra",
    regionId: "IN-LA",
    name: "Nubra Valley",
    slug: "nubra-valley",
    description:
      "Cold desert valley crossed by ancient silk routes, sand dunes, and high-altitude monasteries.",
    coordinates: { lat: 34.6863, lng: 77.5673 },
  },
];

export const SEED_PLACES = [
  // West Bengal -> Darjeeling
  {
    id: "place_tiger_hill",
    destinationId: "dest_darjeeling",
    name: "Tiger Hill",
    slug: "tiger-hill",
    description:
      "Renowned high-altitude summit offering dawn panoramas of Mount Kanchenjunga and Mount Everest.",
    latitude: 27.012,
    longitude: 88.261,
    address: "Senchal Forest, Darjeeling, West Bengal 734102",
    categorySlugs: ["mountain", "sunrise", "photography"],
  },
  {
    id: "place_batasia_loop",
    destinationId: "dest_darjeeling",
    name: "Batasia Loop",
    slug: "batasia-loop",
    description:
      "Spiral railway loop engineered in 1919 for the Darjeeling Himalayan Railway with landscaped war memorial gardens.",
    latitude: 27.0168,
    longitude: 88.2464,
    address: "Ghum, Darjeeling, West Bengal 734102",
    categorySlugs: ["mountain", "historical", "culture"],
  },
  // West Bengal -> Kolkata
  {
    id: "place_victoria_memorial",
    destinationId: "dest_kolkata",
    name: "Victoria Memorial",
    slug: "victoria-memorial",
    description:
      "Iconic white Makrana marble monument surrounded by lush gardens, reflecting imperial architecture and heritage art.",
    latitude: 22.5448,
    longitude: 88.3426,
    address: "1 Queen's Way, Maidan, Kolkata, West Bengal 700071",
    categorySlugs: ["historical", "culture", "photography"],
  },
  {
    id: "place_jorasanko_thakur_bari",
    destinationId: "dest_kolkata",
    name: "Jorasanko Thakur Bari",
    slug: "jorasanko-thakur-bari",
    description:
      "Ancestral 18th-century home of the Tagore family, birthplace of Nobel laureate Rabindranath Tagore.",
    latitude: 22.5852,
    longitude: 88.3592,
    address: "6/4 Dwarakanath Tagore Lane, Jorasanko, Kolkata, West Bengal 700007",
    categorySlugs: ["historical", "culture"],
  },
  // West Bengal -> Digha
  {
    id: "place_digha_beach",
    destinationId: "dest_digha",
    name: "Digha Beach",
    slug: "digha-beach",
    description:
      "Flat, firm shallow sand beach framed by casuarina plantations on the Bay of Bengal.",
    latitude: 21.6266,
    longitude: 87.5074,
    address: "Digha Coastal Road, Purba Medinipur, West Bengal 721428",
    categorySlugs: ["beach", "nature", "sunrise"],
  },
  {
    id: "place_mandarmani_beach",
    destinationId: "dest_digha",
    name: "Mandarmani Beach",
    slug: "mandarmani-beach",
    description:
      "Long secluded coastal strip famed for red ghost crabs and uninterrupted tidal expanses.",
    latitude: 21.6664,
    longitude: 87.7125,
    address: "Mandarmani, Purba Medinipur, West Bengal 721455",
    categorySlugs: ["beach", "nature", "adventure"],
  },
  // Rajasthan -> Jodhpur
  {
    id: "place_mehrangarh_fort",
    destinationId: "dest_jodhpur",
    name: "Mehrangarh Fort",
    slug: "mehrangarh-fort",
    description:
      "Colossal 15th-century cliffside fortress towering 400 feet above Jodhpur's blue old town.",
    latitude: 26.2978,
    longitude: 73.0185,
    address: "Fort Rd, Jodhpur, Rajasthan 342006",
    categorySlugs: ["historical", "photography", "culture"],
  },
  // Kerala -> Munnar
  {
    id: "place_kolukkumalai",
    destinationId: "dest_munnar",
    name: "Kolukkumalai Tea Estate",
    slug: "kolukkumalai-tea-estate",
    description:
      "The highest tea plantation in the world at nearly 8,000 feet, celebrated for panoramic sunrise cloud beds.",
    latitude: 10.0828,
    longitude: 77.2289,
    address: "Kottagudi, Bodinayakanur, Near Munnar, Kerala 625582",
    categorySlugs: ["mountain", "nature", "photography", "sunrise"],
  },
  // Ladakh -> Nubra Valley
  {
    id: "place_diskit_monastery",
    destinationId: "dest_nubra",
    name: "Diskit Monastery",
    slug: "diskit-monastery",
    description:
      "14th-century Tibetan Buddhist gompa presided over by a 106-foot statue of Jampa Buddha facing the Shyok River.",
    latitude: 34.5428,
    longitude: 77.5628,
    address: "Diskit, Nubra Valley, Ladakh 194401",
    categorySlugs: ["spiritual", "culture", "mountain", "photography"],
  },
];
