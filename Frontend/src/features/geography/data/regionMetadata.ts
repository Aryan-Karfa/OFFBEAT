import type { DestinationPreview } from "../../../types/geography";

export interface RegionEditorialMetadata {
  id: string; // Matching ISO 3166-2:IN e.g. "IN-WB"
  tagline: string;
  description: string;
  tags: string[];
  discoveryCount: number;
  highlight: string;
  destinations: DestinationPreview[];
}

export const REGION_EDITORIAL_METADATA: Record<string, RegionEditorialMetadata> = {
  "IN-AN": {
    id: "IN-AN",
    tagline: "Archipelago of ancient rainforests & turquoise bays",
    description:
      "Emerald islands scattered in the Bay of Bengal. Untouched coral reefs, indigenous heritage, tranquil turtle nesting beaches, and bioluminescent night waters.",
    tags: ["Islands", "Coral Reefs", "Marine Life", "Rainforests", "Quiet Shores"],
    discoveryCount: 48,
    highlight:
      "Radhanagar secluded cove walks, Neil Island natural rock bridges, and Diglipur twin peaks.",
    destinations: [
      {
        id: "an-neil",
        name: "Neil Island (Shaheed Dweep)",
        type: "Island Haven",
        tagline: "Organic farms & coral walkways",
        highlight: "Natural coral bridges and quiet sunsets at Laxmanpur Beach.",
        discoveryCount: 18,
      },
      {
        id: "an-diglipur",
        name: "Diglipur",
        type: "Northern Frontier",
        tagline: "Twin islands & Saddle Peak trek",
        highlight: "Ross and Smith sandbar connection and turtle nesting at Kalipur.",
        discoveryCount: 16,
      },
      {
        id: "an-baratang",
        name: "Baratang",
        type: "Mangrove Passage",
        tagline: "Mud volcanoes & limestone caves",
        highlight: "Navigating dense mangrove tunnels by wooden boat.",
        discoveryCount: 14,
      },
    ],
  },
  "IN-AP": {
    id: "IN-AP",
    tagline: "Eastern Ghats misty coffee ridges & Coromandel coast",
    description:
      "Ancient Buddhist monastic ruins, tranquil Godavari delta estuaries, aromatic coffee hills in Araku, and remote temple architecture carved into river canyons.",
    tags: ["Eastern Ghats", "Coffee Valleys", "River Deltas", "Buddhist Ruins", "Living Craft"],
    discoveryCount: 78,
    highlight:
      "Borra Caves subterranean stalactites, Lambasinghi winter mist, and Lepakshi hanging pillars.",
    destinations: [
      {
        id: "ap-araku",
        name: "Araku Valley",
        type: "Coffee Highlands",
        tagline: "Indigenous plantations & valley trains",
        highlight: "Tribal coffee cooperatives and morning mist at Chaparai cascades.",
        discoveryCount: 26,
      },
      {
        id: "ap-lepakshi",
        name: "Lepakshi",
        type: "Sculptural Heritage",
        tagline: "Monolithic Nandi & Vijayanagara stone craft",
        highlight: "Carved musical pillars and the celestial ceiling frescoes of Veerabhadra.",
        discoveryCount: 24,
      },
      {
        id: "ap-maredumilli",
        name: "Maredumilli",
        type: "Forest Reserve",
        tagline: "Deep Eastern Ghats eco-trails",
        highlight: "Bamboo chicken culinary secrets and herbal medicinal groves.",
        discoveryCount: 18,
      },
    ],
  },
  "IN-AR": {
    id: "IN-AR",
    tagline: "Land of the Dawn-Lit Mountains & Eastern Himalayan frontiers",
    description:
      "India's wildest eastern frontier. Snow-capped passes, sacred Buddhist monasteries, primeval pine valleys, and diverse indigenous tribal hamlets living in harmony with nature.",
    tags: ["High Passes", "Alpine Lakes", "Monasteries", "Tribal Valleys", "Pristine Wilderness"],
    discoveryCount: 92,
    highlight:
      "Sela Pass high-altitude glacial lakes, Ziro Valley Apatani pine groves, and Mechuka valley solitude.",
    destinations: [
      {
        id: "ar-mechuka",
        name: "Mechuka (Menchukha)",
        type: "Remote Himalayan Valley",
        tagline: "Yargyap Chu river & Memba wooden hamlets",
        highlight: "Ancient Samten Yongcha gompa overlooking snow-clad peaks.",
        discoveryCount: 28,
      },
      {
        id: "ar-ziro",
        name: "Ziro Valley",
        type: "Apatani Cultural Basin",
        tagline: "Sustainable rice-fish paddy terraces",
        highlight: "Apatani bamboo architecture and sacred groves of Tarin.",
        discoveryCount: 34,
      },
      {
        id: "ar-tawang",
        name: "Tawang Hinterland",
        type: "High-Altitude Sanctuary",
        tagline: "17th-century monastery & prayer flag ridges",
        highlight: "Pangateng Tso lake and quiet meditation caves at Ani Gompa.",
        discoveryCount: 30,
      },
    ],
  },
  "IN-AS": {
    id: "IN-AS",
    tagline: "Brahmaputra riverine heartland & tea heritage hills",
    description:
      "The pulse of the Northeast. The sacred sandbanks of the world's largest river island Majuli, rhino conservation wetlands in Kaziranga, and lush heritage tea estates.",
    tags: ["Brahmaputra", "River Islands", "Wildlife Sanctuaries", "Tea Heritage", "Silk Weaving"],
    discoveryCount: 88,
    highlight:
      "Majuli neo-Vaishnavite sattras and mask-making, Haflong hill retreat, and Sualkuchi golden Muga silk looms.",
    destinations: [
      {
        id: "as-majuli",
        name: "Majuli Island",
        type: "Sacred River Island",
        tagline: "Living monastic sattras & clay mask craft",
        highlight:
          "Early morning cycling through Mishing tribal hamlets and birding at Kamalabari.",
        discoveryCount: 36,
      },
      {
        id: "as-haflong",
        name: "Haflong",
        type: "Hill Station Outpost",
        tagline: "Blue hills, hanging bridges & mist",
        highlight: "Orchid varieties of Jatinga valley and trekking to Borail peak.",
        discoveryCount: 22,
      },
      {
        id: "as-manas",
        name: "Manas Buffer Zone",
        type: "Sub-Himalayan Biosphere",
        tagline: "Wild buffalo & river safaris",
        highlight: "Bodo community-managed ecotourism and elephant grass wilderness.",
        discoveryCount: 20,
      },
    ],
  },
  "IN-BR": {
    id: "IN-BR",
    tagline: "Cradle of ancient empires, philosophy & spiritual dawn",
    description:
      "Where Buddha meditated and ancient scholars debated at Nalanda. Rich agricultural plains, legendary stupas, Mithila folk painting traditions, and historical riverside ghats.",
    tags: [
      "Ancient Universities",
      "Buddhist Circuit",
      "Mithila Art",
      "Sacred Heritage",
      "Ganges Plains",
    ],
    discoveryCount: 64,
    highlight:
      "Nalanda ruined monastery brick arches, Rajgir hot springs & peace pagoda, and Madhubani village art studios.",
    destinations: [
      {
        id: "br-rajgir",
        name: "Rajgir & Gridhakuta",
        type: "Ancient Valley Citadel",
        tagline: "Vulture Peak & cyclopean stone walls",
        highlight: "Walking the meditative paths of Bimbisara's ancient road.",
        discoveryCount: 24,
      },
      {
        id: "br-madhubani",
        name: "Madhubani & Jitwarpur",
        type: "Artisan Village",
        tagline: "Centuries of Mithila natural-dye canvas",
        highlight: "Direct interaction with master painters in household courtyards.",
        discoveryCount: 20,
      },
      {
        id: "br-vaishali",
        name: "Vaishali",
        type: "Historic Republic",
        tagline: "Ashokan lion pillar & ancient democracy",
        highlight: "Relic stupa and quiet mango orchards of Amrapali.",
        discoveryCount: 16,
      },
    ],
  },
  "IN-CH": {
    id: "IN-CH",
    tagline: "Modernist urban architecture at the Shivalik foothills",
    description:
      "Le Corbusier's open-hand dream city. Tree-lined pedestrian grids, modernist exposed concrete brutalism, and visionary folk sculptures at the Rock Garden.",
    tags: [
      "Modernist Architecture",
      "Urban Forestry",
      "Rock Garden",
      "Shivalik Foot",
      "Café Culture",
    ],
    discoveryCount: 38,
    highlight:
      "Capitol Complex architectural tours, Sukhna Lake early dawn silence, and Nek Chand's reclaimed mosaic labyrinth.",
    destinations: [
      {
        id: "ch-capitol",
        name: "Capitol Complex & Sector 1",
        type: "Architectural Landmark",
        tagline: "Le Corbusier's geometric masterpiece",
        highlight: "The Palace of Assembly and Open Hand monument against mountain skies.",
        discoveryCount: 18,
      },
      {
        id: "ch-sukhna",
        name: "Sukhna Reserve Forest",
        type: "Nature Sanctuary",
        tagline: "Migratory wetland trails",
        highlight: "Walking the Kansal forest bird trails at sunrise.",
        discoveryCount: 12,
      },
    ],
  },
  "IN-CT": {
    id: "IN-CT",
    tagline: "Tribal forests, roaring cataracts & hidden subterranean caves",
    description:
      "India's green heartland. Dense Sal forests of Bastar, the dramatic horseshoe fall of Chitrakote, tribal bell-metal craft, and ancient temple ruins overgrown with tropical vines.",
    tags: ["Waterfalls", "Tribal Craft", "Dense Forests", "Limestone Caves", "Ancient Temples"],
    discoveryCount: 68,
    highlight:
      "Chitrakote 'Niagara of India' monsoon spray, Bastar Dhokra metal casting, and Kanger Valley limestone caverns.",
    destinations: [
      {
        id: "ct-bastar",
        name: "Bastar & Jagdalpur",
        type: "Cultural Forest Heartland",
        tagline: "Haat bazaars, Dhokra craft & wooden totems",
        highlight: "Weekly tribal haat markets with Mahua brew and brass metal artisans.",
        discoveryCount: 28,
      },
      {
        id: "ct-chitrakote",
        name: "Chitrakote & Tirathgarh",
        type: "Waterfall Canyon",
        tagline: "Horseshoe cataract on Indravati river",
        highlight: "Coracle boat rides near the mist base and tiered forest falls.",
        discoveryCount: 22,
      },
      {
        id: "ct-mainpat",
        name: "Mainpat",
        type: "Highland Plateau",
        tagline: "The 'Shimla of Chhattisgarh' & Tibetan settlement",
        highlight: "Bouncing land phenomenon at Jaljali and Dhakpo Monastery.",
        discoveryCount: 16,
      },
    ],
  },
  "IN-DH": {
    id: "IN-DH",
    tagline: "Estuarine coves, Portuguese sea forts & tribal foothills",
    description:
      "A coastal and inland union territory blending Portuguese maritime fortifications, secluded Arabian Sea headlands, and lush Warli tribal forests along the Daman Ganga.",
    tags: ["Coastal Forts", "Warli Art", "Quiet Beaches", "Portuguese Enclaves", "Estuaries"],
    discoveryCount: 36,
    highlight:
      "Moti Daman fortress battlements, Dudhani lake waters, and Silvassa Warli painting studios.",
    destinations: [
      {
        id: "dh-daman",
        name: "Daman Coastal Old Town",
        type: "Maritime Heritage",
        tagline: "16th-century ramparts & black sand beaches",
        highlight: "St. Jerome Fort overlooking fishing dhows and Devka sunset strolls.",
        discoveryCount: 18,
      },
      {
        id: "dh-silvassa",
        name: "Silvassa & Dudhani",
        type: "Tribal Forest Reserve",
        tagline: "Madhuban reservoir & tribal heritage",
        highlight: "Shikara boat rides across calm backwaters and Warli village guilds.",
        discoveryCount: 14,
      },
    ],
  },
  "IN-DL": {
    id: "IN-DL",
    tagline: "Layered imperial capitals, Sufi shrines & culinary bazaars",
    description:
      "A city of seven ancient capitals. From Mehrauli's forgotten stepwells and Nizamuddin's evening qawwalis to the grand tree-lined avenues of Lutyens and vibrant old alleyway feasts.",
    tags: ["Imperial Ruins", "Sufi Culture", "Culinary Heritage", "Stepwells", "Old Bazaars"],
    discoveryCount: 110,
    highlight:
      "Agrasen ki Baoli subterranean echoes, Nizamuddin Dargah Thursday twilight music, and Mehrauli Archaeological Park.",
    destinations: [
      {
        id: "dl-mehrauli",
        name: "Mehrauli Archaeological Park",
        type: "Medieval Ruins Complex",
        tagline: "Jamali Kamali tomb & ancient baolis",
        highlight: "Quiet overgrown forest paths between Sultanate-era stone arches.",
        discoveryCount: 38,
      },
      {
        id: "dl-olddelhi",
        name: "Shahjahanabad Alleys",
        type: "Living Heritage Quarter",
        tagline: "Spices, havelis & secret culinary lanes",
        highlight: "Khari Baoli rooftop views and century-old jalebi workshops.",
        discoveryCount: 42,
      },
      {
        id: "dl-sunder",
        name: "Sunder Nursery & Humayun Environs",
        type: "Mughal Garden Oasis",
        tagline: "Restored pavilions & water gardens",
        highlight: "Weekend organic market beneath restored 16th-century domes.",
        discoveryCount: 26,
      },
    ],
  },
  "IN-GA": {
    id: "IN-GA",
    tagline: "Beyond the beaches · Backwater estuaries & spice hinterlands",
    description:
      "Look past the tourist shoreline. Discover sleepy Portuguese-Goan island villages, sacred forest groves, cascading Western Ghat waterfalls, and authentic feni distilleries.",
    tags: [
      "Backwater Islands",
      "Spice Plantations",
      "Portuguese Villas",
      "Ghat Waterfalls",
      "Coastal Ecology",
    ],
    discoveryCount: 104,
    highlight:
      "Divar Island cycling paths, Netravali bubbling bubble lake, and Dudhsagar railway trek.",
    destinations: [
      {
        id: "ga-divar",
        name: "Divar Island",
        type: "Estuarine River Island",
        tagline: "Car-ferry crossings, vintage villas & quiet lanes",
        highlight: "Cycling through Piedade village and visiting Our Lady of Compassion Church.",
        discoveryCount: 32,
      },
      {
        id: "ga-netravali",
        name: "Netravali Sanctuary",
        type: "Western Ghats Jungle",
        tagline: "Hidden cataracts, giant squirrels & spice farms",
        highlight: "Swimming beneath Savari falls and breathing wild cardamom groves.",
        discoveryCount: 24,
      },
      {
        id: "ga-chorao",
        name: "Chorão Island",
        type: "Mangrove Sanctuary",
        tagline: "Dr. Salim Ali bird sanctuary canals",
        highlight: "Canoeing through mangrove estuaries during winter migratory season.",
        discoveryCount: 22,
      },
    ],
  },
  "IN-GJ": {
    id: "IN-GJ",
    tagline: "White salt deserts, Asiatic lion valleys & stepwell architecture",
    description:
      "A land of stark contrasts. The infinite white crystal horizon of the Rann of Kutch, intricately carved stepwells, Asiatic lions in Gir, and centuries-old handloom communities.",
    tags: ["Salt Desert", "Stepwells", "Textile Weaving", "Lion Sanctuary", "Ancient Ports"],
    discoveryCount: 114,
    highlight:
      "Rani ki Vav subterranean sculptures, Great Rann moonlit silence, and Hodka Kutchi artisan huts.",
    destinations: [
      {
        id: "gj-kutch",
        name: "Banni & Kutch Hinterland",
        type: "Artisan Desert Basin",
        tagline: "Rogan art, mud mirror work & salt crusts",
        highlight: "Visiting Nirona village master artisans and Kala Dungar viewpoint.",
        discoveryCount: 44,
      },
      {
        id: "gj-patan",
        name: "Patan & Modhera",
        type: "Architectural Marvel",
        tagline: "11th-century Sun Temple & stepwell marvels",
        highlight: "Double Ikat Patola silk looms and astronomical symmetry at Modhera.",
        discoveryCount: 36,
      },
      {
        id: "gj-girnar",
        name: "Girnar & Junagadh",
        type: "Sacred Mountain Ridge",
        tagline: "10,000 stone steps & Jain summit shrines",
        highlight: "Dawn ascents up Mount Girnar above the cloud inversion line.",
        discoveryCount: 28,
      },
    ],
  },
  "IN-HP": {
    id: "IN-HP",
    tagline: "Cedar-scented valleys, high-altitude deserts & mountain passes",
    description:
      "From the gentle deodar forests of Kullu and Tirthan to the stark moonscapes of Spiti and Kinnaur. Traditional wooden Kath-Kuni architecture, alpine meadows, and Buddhist gompas.",
    tags: [
      "Alpine Valleys",
      "Trans-Himalaya",
      "High Passes",
      "Wooden Architecture",
      "Trout Streams",
    ],
    discoveryCount: 142,
    highlight:
      "Tirthan valley brown trout streams, Spiti Key Gompa morning prayers, and Kalpa apple orchard sunrises.",
    destinations: [
      {
        id: "hp-tirthan",
        name: "Tirthan Valley",
        type: "Himalayan Forest Sanctuary",
        tagline: "Great Himalayan National Park gateway",
        highlight: "Angling in crystal mountain streams and treks to Serolsar Lake.",
        discoveryCount: 46,
      },
      {
        id: "hp-spiti",
        name: "Spiti Valley Outposts",
        type: "High-Altitude Cold Desert",
        tagline: "Key Monastery & fossil villages of Langza",
        highlight: "Stargazing at Kibber (4200m) and crossing the Kunzum Pass.",
        discoveryCount: 52,
      },
      {
        id: "hp-barot",
        name: "Barot Valley",
        type: "Alpine Secret",
        tagline: "Uhl river rapids & historic funicular trolley",
        highlight: "Camping by cedar groves and trekking to Rajgundha valley.",
        discoveryCount: 24,
      },
    ],
  },
  "IN-HR": {
    id: "IN-HR",
    tagline: "Vedic battlefields, Shivalik foothills & heritage havelis",
    description:
      "Beyond modern industrial hubs lies ancient history. The archaeological mounds of Rakhigarhi from the Indus Valley era, the mango orchards of Pinjore, and quiet bird sanctuaries.",
    tags: [
      "Harappan Sites",
      "Mughal Gardens",
      "Bird Sanctuaries",
      "Shivalik Trails",
      "Rustic Farms",
    ],
    discoveryCount: 42,
    highlight:
      "Rakhigarhi Harappan excavations, Morni Hills pine trails, and Sultanpur migratory birdwatching.",
    destinations: [
      {
        id: "hr-morni",
        name: "Morni Hills",
        type: "Shivalik Outpost",
        tagline: "Haryana's lone hill retreat",
        highlight: "Tikkar Taal twin lakes and pine-scented forest trails.",
        discoveryCount: 18,
      },
      {
        id: "hr-rakhigarhi",
        name: "Rakhigarhi",
        type: "Ancient Bronze Age Metropolis",
        tagline: "One of the largest Indus Valley sites",
        highlight: "Walking ancient granaries and examining 5,000-year-old terracotta beads.",
        discoveryCount: 14,
      },
    ],
  },
  "IN-JH": {
    id: "IN-JH",
    tagline: "Land of deep Sal forests, sacred hills & thunderous cascades",
    description:
      "A rugged plateau carved by ancient rivers. Home to rich Santhal and Oraon tribal cultures, dense canopy reserves, sacred Jain summits at Parasnath, and dramatic waterfalls.",
    tags: ["Plateau Forests", "Sacred Summits", "Waterfalls", "Tribal Painting", "National Parks"],
    discoveryCount: 56,
    highlight:
      "Dassam and Hundru waterfalls, Parasnath Shikharji pilgrimage ridge, and Betla National Park elephant herds.",
    destinations: [
      {
        id: "jh-netarhat",
        name: "Netarhat",
        type: "Plateau Hill Station",
        tagline: "Queen of Chotanagpur & sunrise points",
        highlight: "Magnolia point sunsets and walking the pine forests.",
        discoveryCount: 22,
      },
      {
        id: "jh-parasnath",
        name: "Parasnath (Shikharji)",
        type: "Sacred Peak",
        tagline: "Highest mountain peak in Jharkhand",
        highlight: "Night treks through forest switchbacks to the white marble summit temples.",
        discoveryCount: 18,
      },
      {
        id: "jh-hazaribagh",
        name: "Hazaribagh Hinterland",
        type: "Forest Basin",
        tagline: "Sohrai and Khovar wall mural traditions",
        highlight: "Meeting indigenous village muralists in Padma and Isco rock art caves.",
        discoveryCount: 14,
      },
    ],
  },
  "IN-JK": {
    id: "IN-JK",
    tagline: "Alpine meadows, saffron plateaus & tranquil mountain lakes",
    description:
      "The crown jewel of the Himalayas. Quiet cedar valleys beyond Srinagar, Gurez's remote frontier beauty, saffron harvest fields in Pampore, and pine-fringed alpine tarns.",
    tags: [
      "Alpine Valleys",
      "Pine Meadows",
      "Glacial Streams",
      "Saffron Fields",
      "Wooden Architecture",
    ],
    discoveryCount: 118,
    highlight:
      "Gurez Valley Kishanganga river tranquility, Doodhpathri verdant meadows, and Aru valley trailheads.",
    destinations: [
      {
        id: "jk-gurez",
        name: "Gurez Valley",
        type: "Frontier Himalayan Basin",
        tagline: "Habba Khatoon peak & wooden Dardic hamlets",
        highlight: "Camping by the turquoise Kishanganga river under pyramidal peaks.",
        discoveryCount: 38,
      },
      {
        id: "jk-aru",
        name: "Aru Valley",
        type: "Alpine Meadow Gateway",
        tagline: "Gateway to Kolahoi glacier",
        highlight: "Quiet horseback rides through deodar woods and meadow homestays.",
        discoveryCount: 42,
      },
      {
        id: "jk-doodhpathri",
        name: "Doodhpathri",
        type: "Valley of Milk",
        tagline: "Rolling alpine grass & Shaliganga river",
        highlight: "Picnics on green turf without commercial tourist bustle.",
        discoveryCount: 26,
      },
    ],
  },
  "IN-KA": {
    id: "IN-KA",
    tagline: "Western Ghat rainforests, coffee estates & ancient stone empires",
    description:
      "A rich spectrum from the boulder-strewn ruins of Hampi to misty coffee estates in Coorg, dense rain-lashed rainforests of Agumbe, and pristine coastal fishing bays.",
    tags: [
      "Coffee Valleys",
      "Vijayanagara Ruins",
      "Rainforests",
      "Western Ghats",
      "Temple Architecture",
    ],
    discoveryCount: 136,
    highlight:
      "Anegundi rural boulder walking, Agumbe cobra rainforest research trails, and Badami cave temples.",
    destinations: [
      {
        id: "ka-anegundi",
        name: "Anegundi & Hampi Buffer",
        type: "Ancient Boulder Kingdom",
        tagline: "Older than Hampi · Rural artisan guilds",
        highlight: "Sanapur Lake bouldering, banana-fiber crafts, and Kishkindha mythic hilltops.",
        discoveryCount: 44,
      },
      {
        id: "ka-agumbe",
        name: "Agumbe Rainforest",
        type: "Biodiversity Hotspot",
        tagline: "Cherrapunji of the South & sunset points",
        highlight: "Barkana Falls monsoon cascades and king cobra conservation canopy walks.",
        discoveryCount: 32,
      },
      {
        id: "ka-badami",
        name: "Badami & Aihole",
        type: "Chalukya Rock-Cut Architecture",
        tagline: "Red sandstone cliff temples & Agastya lake",
        highlight: "Exploring cave temples early morning when the red sandstone glows.",
        discoveryCount: 34,
      },
    ],
  },
  "IN-KL": {
    id: "IN-KL",
    tagline: "Tropical backwater labyrinths, spice highlands & living traditions",
    description:
      "Where palm-fringed lagoons meet the tea-carpeted slopes of the Western Ghats. Ancient martial arts, Kathakali temple rituals, fragrant cardamom hills, and serene coastal cliffs.",
    tags: [
      "Backwaters",
      "Tea & Cardamom",
      "Coastal Cliffs",
      "Living Traditions",
      "Ayurvedic Forests",
    ],
    discoveryCount: 154,
    highlight:
      "Wayanad bamboo forest sanctuaries, Munroe Island canal canoes, and Varkala cliffside Arabian sunsets.",
    destinations: [
      {
        id: "kl-munroe",
        name: "Munroe Island",
        type: "Backwater Island",
        tagline: "Narrow canals & coir weaving hamlets",
        highlight: "Silent sunrise canoe journeys beneath arching mangrove roots.",
        discoveryCount: 42,
      },
      {
        id: "kl-wayanad",
        name: "Wayanad Highlands",
        type: "Rainforest Sanctuary",
        tagline: "Edakkal neolithic caves & mist ridges",
        highlight: "Trekking through Chembra peak heart-shaped lake and wild elephant trails.",
        discoveryCount: 48,
      },
      {
        id: "kl-marari",
        name: "Marari Coast",
        type: "Fishing Village",
        tagline: "Quiet shores & coir coconut groves",
        highlight: "Authentic coastal homestays and fresh sea catch cooked with Malabar tamarind.",
        discoveryCount: 32,
      },
    ],
  },
  "IN-LA": {
    id: "IN-LA",
    tagline: "High-altitude desert kingdoms & star-drenched nocturnal horizons",
    description:
      "The roof of the subcontinent. Stark barren mountain valleys, turquoise glacial lakes at 4,000m, ancient cliff-hanging Buddhist gompas, and the clearest night skies in Asia.",
    tags: [
      "High Desert",
      "Dark Sky Reserve",
      "Buddhist Gompas",
      "Glacial Lakes",
      "Ancient Silk Route",
    ],
    discoveryCount: 126,
    highlight:
      "Hanle Dark Sky Reserve stargazing, Turtuk Balti apricot orchards, and Zanskar frozen river gorge.",
    destinations: [
      {
        id: "la-hanle",
        name: "Hanle Valley",
        type: "Dark Sky Reserve",
        tagline: "Astronomical clarity at 4,500m",
        highlight: "Milky Way astrophotography and ancient 17th-century Hanle Gompa.",
        discoveryCount: 42,
      },
      {
        id: "la-turtuk",
        name: "Turtuk Village",
        type: "Balti Enclave",
        tagline: "Apricot orchards & northern frontier culture",
        highlight: "Centuries-old stone water canals and traditional Balti wooden houses.",
        discoveryCount: 36,
      },
      {
        id: "la-zanskar",
        name: "Zanskar Valley",
        type: "Remote Himalayan Citadel",
        tagline: "Phuktal monastery carved into the cliff",
        highlight: "Trekking the remote villages of Padum and crossing Shingo La.",
        discoveryCount: 38,
      },
    ],
  },
  "IN-LD": {
    id: "IN-LD",
    tagline: "Untouched coral atolls & emerald lagoons in the Arabian Sea",
    description:
      "Thirty-six tiny coral islands surrounded by crystalline turquoise lagoons. Fragile marine ecosystems, sea turtle sanctuaries, coconut palm groves, and quiet island life.",
    tags: ["Coral Atolls", "Lagoon Diving", "Sea Turtles", "Island Solitude", "Marine Sanctuary"],
    discoveryCount: 32,
    highlight:
      "Kadmat island coral garden snorkeling, Minicoy traditional tuna fishing, and Kalpeni lagoon reef walks.",
    destinations: [
      {
        id: "ld-kadmat",
        name: "Kadmat Island",
        type: "Coral Atoll",
        tagline: "Narrow sand strip & wide lagoons",
        highlight: "Scuba diving pristine coral walls with manta rays and reef sharks.",
        discoveryCount: 16,
      },
      {
        id: "ld-minicoy",
        name: "Minicoy",
        type: "Southernmost Atoll",
        tagline: "British lighthouse & Mahl culture",
        highlight: "Climbing the 1885 brick lighthouse for panoramic 360-degree atoll views.",
        discoveryCount: 12,
      },
    ],
  },
  "IN-MH": {
    id: "IN-MH",
    tagline: "Sahyadri basalt fortresses, Konkan beaches & cave masterpieces",
    description:
      "A powerhouse of nature and history. The rugged Western Ghats dotted with Shivaji's mountain forts, the ancient UNESCO caves of Ajanta and Ellora, and pristine Konkan coastal coves.",
    tags: ["Sahyadri Forts", "Basalt Gorges", "Cave Art", "Konkan Coast", "Monsoon Treks"],
    discoveryCount: 138,
    highlight:
      "Harishchandragad Konkan Kada vertical cliff drop, Ajanta rock-cut murals, and Velas turtle hatchlings.",
    destinations: [
      {
        id: "mh-konkan",
        name: "Guhagar & Velas",
        type: "Pristine Konkan Coast",
        tagline: "Betel nut plantations & Olive Ridley turtles",
        highlight: "Witnessing baby sea turtles scuttle into the Arabian dawn at Velas.",
        discoveryCount: 38,
      },
      {
        id: "mh-bhandardara",
        name: "Bhandardara & Sandhan Valley",
        type: "Sahyadri Canyon",
        tagline: "Valley of Shadows & Wilson Dam waterfalls",
        highlight: "Canyoneering through 200-foot deep rock fissures in Sandhan Valley.",
        discoveryCount: 42,
      },
      {
        id: "mh-lonar",
        name: "Lonar Crater Lake",
        type: "Meteorite Crater",
        tagline: "52,000-year-old hypervelocity impact lake",
        highlight: "Hiking the forested crater rim with ancient temple ruins.",
        discoveryCount: 26,
      },
    ],
  },
  "IN-ML": {
    id: "IN-ML",
    tagline: "Abode of clouds, living root bridges & crystal canyons",
    description:
      "Where rainforest clouds meet deep limestone gorges. Bioengineered living root bridges created over generations by Khasi elders, sacred groves, and crystalline riverbeds in Dawki.",
    tags: ["Living Root Bridges", "Cloud Forests", "Waterfalls", "Cave Systems", "Sacred Groves"],
    discoveryCount: 96,
    highlight:
      "Nongriat double-decker living root bridge, Mawphlang sacred forest silence, and Krem Liat Prah cave chambers.",
    destinations: [
      {
        id: "ml-nongriat",
        name: "Nongriat & Tyrna",
        type: "Bioengineered Rainforest",
        tagline: "Double-decker root bridges & turquoise pools",
        highlight: "Descending 3,500 stone steps into the subtropical canyon.",
        discoveryCount: 42,
      },
      {
        id: "ml-dawki",
        name: "Shnongpdeng & Umngot",
        type: "Crystal River Basin",
        tagline: "Boats that appear to float on air",
        highlight: "Kayaking down the transparent Umngot River over pebble beds.",
        discoveryCount: 32,
      },
      {
        id: "ml-kongthong",
        name: "Kongthong",
        type: "Whistling Village",
        tagline: "Jingrwai Iawbei musical name traditions",
        highlight:
          "Hearing villagers call each other across valley ridges with unique melodic tunes.",
        discoveryCount: 18,
      },
    ],
  },
  "IN-MN": {
    id: "IN-MN",
    tagline: "Jeweled valley of floating phumdis & polo heritage",
    description:
      "Surrounded by emerald hills, Manipur centers around sacred Loktak Lake with its unique circular floating biomass islands, rare Sangai brow-antlered deer, and rich martial dance traditions.",
    tags: ["Floating Lake", "Sangai Deer", "Handlooms", "Hills & Passes", "Martial Arts"],
    discoveryCount: 52,
    highlight:
      "Loktak Lake phumdi homestays, Keibul Lamjao floating national park, and Ukhrul Shirui lily ridges.",
    destinations: [
      {
        id: "mn-loktak",
        name: "Loktak Lake & Sendra",
        type: "Floating Freshwater Ecosystem",
        tagline: "Fishermen huts on moving circular biomass",
        highlight: "Canoe rides across phumdis at sunrise watching local fishermen cast nets.",
        discoveryCount: 26,
      },
      {
        id: "mn-ukhrul",
        name: "Ukhrul",
        type: "Tangkhul Naga Highlands",
        tagline: "Shirui Kashong peak & black pottery",
        highlight: "Exploring Longpi stone pottery craft workshops using serpentinite rock.",
        discoveryCount: 16,
      },
    ],
  },
  "IN-MP": {
    id: "IN-MP",
    tagline: "Tiger heartlands, Paleolithic rock shelters & sandstone citadels",
    description:
      "The geographic center of India. Untamed Sal forest tiger corridors, 30,000-year-old rock shelters of Bhimbetka, majestic ghost palaces of Mandu, and sacred riverside ghats in Maheshwar.",
    tags: ["Tiger Corridors", "Rock Art", "Medieval Citadels", "Sacred Rivers", "Handloom Weaving"],
    discoveryCount: 122,
    highlight:
      "Bhimbetka pre-historic cave art, Orchha riverside cenotaphs, and Mandu monsoon Jahaz Mahal.",
    destinations: [
      {
        id: "mp-orchha",
        name: "Orchha",
        type: "Bundela Riverside Kingdom",
        tagline: "Betwa river cenotaphs & mural palaces",
        highlight: "Kayaking past massive 16th-century stone chhatris at dusk.",
        discoveryCount: 40,
      },
      {
        id: "mp-mandu",
        name: "Mandu",
        type: "Romantic Ruined Citadel",
        tagline: "Afghan architecture & baobab trees",
        highlight: "Jahaz Mahal floating between two lakes during monsoon rains.",
        discoveryCount: 36,
      },
      {
        id: "mp-bhimbetka",
        name: "Bhimbetka & Bhojpur",
        type: "Paleolithic Canvas",
        tagline: "Auditorium cave paintings & colossal Shiva temple",
        highlight: "Tracing red and white ochre hunting scenes painted 30,000 years ago.",
        discoveryCount: 28,
      },
    ],
  },
  "IN-MZ": {
    id: "IN-MZ",
    tagline: "Blue mountain ridges, bamboo forests & misty valley hamlets",
    description:
      "A tranquil land of parallel north-south mountain folds. Verdant bamboo forests, the sacred peak of Phawngpui (Blue Mountain), dramatic cliff-side villages, and welcoming Mizo culture.",
    tags: ["Blue Mountains", "Bamboo Forests", "Cliff Villages", "Mizo Culture", "Remote Trails"],
    discoveryCount: 46,
    highlight:
      "Phawngpui Blue Mountain panoramic peak, Vantawng cascading falls, and Reiek Tlang cliffside ridge walks.",
    destinations: [
      {
        id: "mz-reiek",
        name: "Reiek Tlang",
        type: "Mountain Peak",
        tagline: "Dramatic cliff drop & traditional heritage village",
        highlight: "Morning ridge walks with views stretching across the plains of Bangladesh.",
        discoveryCount: 20,
      },
      {
        id: "mz-champhai",
        name: "Champhai & Rih Dil",
        type: "Eastern Border Valley",
        tagline: "Heart-shaped sacred lake & vineyard terraces",
        highlight: "Cycling through lush rice valleys near the Myanmar border.",
        discoveryCount: 16,
      },
    ],
  },
  "IN-NL": {
    id: "IN-NL",
    tagline: "Warrior ridge villages, rhododendron valleys & community conservation",
    description:
      "A rugged highland world of diverse Naga tribes. Pioneering community conservation models, the stunning high-altitude Dzukou Valley, and intricate wood carving traditions.",
    tags: ["High Valleys", "Naga Culture", "Community Forests", "Rhododendrons", "Wood Carving"],
    discoveryCount: 58,
    highlight:
      "Dzukou Valley bamboo grass flower carpets, Khonoma green village conservation, and Mon Konyak tattoo culture.",
    destinations: [
      {
        id: "nl-khonoma",
        name: "Khonoma",
        type: "Asia's First Green Village",
        tagline: "Angami tribal conservation & alder tree farming",
        highlight: "Walking stone-fortified village paths and listening to village elders.",
        discoveryCount: 24,
      },
      {
        id: "nl-dzukou",
        name: "Dzukou Valley",
        type: "Alpine Basin",
        tagline: "Rolling dwarf bamboo hills & seasonal lilies",
        highlight: "Trekking through mountain mist to sleep in wilderness cave shelters.",
        discoveryCount: 26,
      },
    ],
  },
  "IN-OD": {
    id: "IN-OD",
    tagline: "Temple spires, artisan heritage villages & brackish coastal lagoons",
    description:
      "Ancient Kalinga coast. The immense brackish waters of Chilika Lake with Irrawaddy dolphins, heritage pata chitra artisan villages, and monumental red sandstone temple architecture.",
    tags: ["Brackish Lagoons", "Artisan Villages", "Temple Architecture", "Dolphins", "Coastline"],
    discoveryCount: 94,
    highlight:
      "Chilika Lake Irrawaddy dolphin sightings, Raghurajpur master scroll painters, and Daringbadi pine plateau.",
    destinations: [
      {
        id: "od-raghurajpur",
        name: "Raghurajpur",
        type: "Heritage Artisan Hamlet",
        tagline: "Every house a living studio for Pattachitra art",
        highlight:
          "Watching master painters make brushes from squirrel hair and natural stone pigments.",
        discoveryCount: 34,
      },
      {
        id: "od-chilika",
        name: "Chilika Lagoon & Mangalajodi",
        type: "Wetland Haven",
        tagline: "Millions of migratory birds & Irrawaddy dolphins",
        highlight: "Silent punted boat safaris through reeds guided by reformed poachers.",
        discoveryCount: 36,
      },
      {
        id: "od-daringbadi",
        name: "Daringbadi",
        type: "Eastern Ghats Hill Station",
        tagline: "Kashmir of Odisha · Coffee & pepper gardens",
        highlight: "Trekking pine groves and visiting tribal turmeric cooperatives.",
        discoveryCount: 18,
      },
    ],
  },
  "IN-PB": {
    id: "IN-PB",
    tagline: "Golden temple waters, fertile five-river plains & rustic hospitality",
    description:
      "The land of the Five Rivers. Beyond the spiritual illumination of Amritsar lies rich agrarian heritage, heroic frontier history, vibrant phulkari embroidery, and legendary culinary generosity.",
    tags: [
      "Spiritual Sanctuaries",
      "Farm Stays",
      "Five Rivers",
      "Culinary Heritage",
      "Phulkari Weaving",
    ],
    discoveryCount: 72,
    highlight:
      "Golden Temple midnight Palki ceremony, Kila Raipur rustic sports, and Harike wetland bird sanctuaries.",
    destinations: [
      {
        id: "pb-amritsar",
        name: "Amritsar Old City",
        type: "Spiritual & Culinary Heart",
        tagline: "Golden Temple sanctum & century-old kulcha tandoors",
        highlight: "Early morning volunteering at the massive community Langar kitchen.",
        discoveryCount: 38,
      },
      {
        id: "pb-harike",
        name: "Harike Pattan Wetland",
        type: "River Confluence",
        tagline: "Confluence of Beas and Sutlej rivers",
        highlight: "Spotting Indus river dolphins and thousands of winter waterfowl.",
        discoveryCount: 18,
      },
    ],
  },
  "IN-PY": {
    id: "IN-PY",
    tagline: "French-colonial coastal promenades, spiritual communes & backwaters",
    description:
      "A coastal enclave where Gallic colonial villas with bougainvillea courtyards meet Tamil vernacular architecture, experimental townships, and quiet mangrove estuaries.",
    tags: [
      "French Colonial",
      "Coastal Promenade",
      "Auroville",
      "Spiritual Communities",
      "Mangroves",
    ],
    discoveryCount: 54,
    highlight:
      "White Town cycling beneath pastel mustard villas, Matrimandir peaceful silence, and Pichavaram mangrove boat trails.",
    destinations: [
      {
        id: "py-whitetown",
        name: "White Town (French Quarter)",
        type: "Heritage Quarter",
        tagline: "Cobblestone streets, chic bakeries & seaside promenade",
        highlight: "Early sunrise walks along Goubert Avenue overlooking the Bay of Bengal.",
        discoveryCount: 28,
      },
      {
        id: "py-auroville",
        name: "Auroville Environs",
        type: "Universal Township",
        tagline: "Sustainable architecture & reforestation forests",
        highlight: "Quiet inner chamber contemplation at the golden sphere Matrimandir.",
        discoveryCount: 18,
      },
    ],
  },
  "IN-RJ": {
    id: "IN-RJ",
    tagline: "Desert dunes, stepwells, leopard hills & painted havelis",
    description:
      "Venture past the crowded palaces of Jaipur. Discover the painted frescoes of Shekhawati, blue-walled alleys of Bundi, wild leopards roaming Granite boulders in Jawai, and quiet Thar desert outposts.",
    tags: ["Desert Outposts", "Painted Havelis", "Stepwells", "Leopard Hills", "Folk Music"],
    discoveryCount: 162,
    highlight:
      "Jawai leopard sightings among Rabari shepherds, Bundi stepwell geometric stairs, and Shekhawati open-air frescoes.",
    destinations: [
      {
        id: "rj-bundi",
        name: "Bundi",
        type: "Cobblestone Heritage Town",
        tagline: "Stepwells, blue alleyways & decaying royal frescoes",
        highlight: "Exploring Taragarh Fort's overgrown ramparts and Chitrashala palace murals.",
        discoveryCount: 44,
      },
      {
        id: "rj-jawai",
        name: "Jawai Bandh",
        type: "Granite Leopard Wilderness",
        tagline: "Wild leopards living peacefully with Rabari shepherds",
        highlight: "Dawn open-top 4x4 tracking of big cats resting on prehistoric granite kopjes.",
        discoveryCount: 48,
      },
      {
        id: "rj-shekhawati",
        name: "Shekhawati (Mandawa & Nawalgarh)",
        type: "Open-Air Art Gallery",
        tagline: "Intricate 19th-century merchant havelis",
        highlight: "Walking quiet desert towns where every mansion facade tells a painted story.",
        discoveryCount: 38,
      },
    ],
  },
  "IN-SK": {
    id: "IN-SK",
    tagline: "Kanchenjunga's sacred shadow, high alpine passes & rhododendron woods",
    description:
      "India's pristine Himalayan jewel. Fully organic mountain agriculture, sacred glacial lakes, rhododendron valleys, and centuries-old Tibetan Buddhist monasteries perched on mist-shrouded ridges.",
    tags: ["Kanchenjunga", "Organic Valleys", "Alpine Lakes", "Tibetan Monasteries", "High Passes"],
    discoveryCount: 106,
    highlight:
      "Dzongu Lepcha tribal reserve, Gurudongmar high glacial lake (5,400m), and Pelling monastery views of Kanchenjunga.",
    destinations: [
      {
        id: "sk-dzongu",
        name: "Dzongu Special Reserve",
        type: "Indigenous Lepcha Sanctuary",
        tagline: "Cane bridges, cardamom groves & mountain sacred lore",
        highlight: "Staying with Lepcha families in Tingvong and trekking to hidden waterfalls.",
        discoveryCount: 36,
      },
      {
        id: "sk-pelling",
        name: "Pelling & Yuksom",
        type: "Sacred Historical Capital",
        tagline: "First capital of Sikkim & ancient coronation stone",
        highlight: "Walking the silent deodar forest trail up to Pemayangtse Monastery.",
        discoveryCount: 38,
      },
      {
        id: "sk-yumthang",
        name: "Yumthang & Lachung",
        type: "Valley of Flowers",
        tagline: "Alpine hot springs & snow peaks",
        highlight: "Walking among 24 varieties of blooming rhododendrons in spring.",
        discoveryCount: 26,
      },
    ],
  },
  "IN-TG": {
    id: "IN-TG",
    tagline: "Deccan granite boulders, Kakatiya stone temples & pearl citadels",
    description:
      "A rugged Deccan plateau kingdom of balancing granite boulders, monolithic stepwells, Kakatiya floating brick architecture at Ramappa, and rich Hyderabadi culinary heritage.",
    tags: ["Deccan Plateau", "Kakatiya Heritage", "Granite Boulders", "Stepwells", "Handlooms"],
    discoveryCount: 84,
    highlight:
      "Ramappa Temple UNESCO floating bricks, Pochampally Ikat silk workshops, and Bhongir monolithic fort rock scramble.",
    destinations: [
      {
        id: "tg-warangal",
        name: "Warangal & Ramappa",
        type: "Medieval Kakatiya Empire",
        tagline: "Floating brick temple & thousand-pillar stone craft",
        highlight: "Marveling at the intricate black basalt bracket carvings of Ramappa.",
        discoveryCount: 34,
      },
      {
        id: "tg-pochampally",
        name: "Pochampally (Bhoodan)",
        type: "Ikat Silk Hub",
        tagline: "Rhythmic clack of handloom shuttles",
        highlight: "Witnessing complex tie-and-dye weaving processes in weaver courtyards.",
        discoveryCount: 24,
      },
    ],
  },
  "IN-TN": {
    id: "IN-TN",
    tagline: "Soaring Dravidian gopurams, Nilgiri tea clouds & Chettinad mansions",
    description:
      "Where 2,000 years of living Tamil culture thrive. Monolithic rock temples by the sea in Mamallapuram, aromatic Nilgiri mountain railways, and palatial baroque mansions in Chettinad.",
    tags: [
      "Dravidian Temples",
      "Nilgiri Mountains",
      "Chettinad Mansions",
      "Living Chola Heritage",
      "Classical Arts",
    ],
    discoveryCount: 146,
    highlight:
      "Chettinad mansion architectural walks, Ooty heritage toy train cog-railway, and Thanjavur Brihadisvara shadow marvels.",
    destinations: [
      {
        id: "tn-chettinad",
        name: "Chettinad (Kanadukathan)",
        type: "Palatial Village Heartland",
        tagline: "Burma teak, Italian marble & peppery culinary masterpieces",
        highlight:
          "Sleeping in restored 100-room mansions and tasting authentic Chettinad banana-leaf feasts.",
        discoveryCount: 52,
      },
      {
        id: "tn-nilgiris",
        name: "Kotagiri & Coonoor",
        type: "Nilgiri Mountain Sanctuary",
        tagline: "Quiet tea estates away from the crowds",
        highlight: "Hiking the Catherine Falls trails and riding the heritage mountain railway.",
        discoveryCount: 46,
      },
      {
        id: "tn-kumbakonam",
        name: "Kumbakonam & Thanjavur",
        type: "Chola Temple Hub",
        tagline: "Living Chola stone architecture & bronze casting",
        highlight: "Visiting master bronze casting sculptors working with lost-wax techniques.",
        discoveryCount: 38,
      },
    ],
  },
  "IN-TR": {
    id: "IN-TR",
    tagline: "Rock-carved cliff faces, water palaces & bamboo forests",
    description:
      "The jewel of the Barak-Surma valley border. The breathtaking water palace of Neermahal floating in Rudrasagar Lake, monumental rock-cut faces at Unakoti, and lush bamboo hill ranges.",
    tags: [
      "Rock Sculptures",
      "Water Palaces",
      "Bamboo Crafts",
      "Rubber Plantations",
      "Border Hills",
    ],
    discoveryCount: 44,
    highlight:
      "Unakoti colossal rock-cut bas-reliefs in the jungle, and Neermahal floating royal palace illuminated at night.",
    destinations: [
      {
        id: "tr-unakoti",
        name: "Unakoti",
        type: "Ancient Shaivite Rock Sanctuary",
        tagline: "Submerged stone faces carved into the jungle mountain",
        highlight:
          "Descending into the sacred gorge surrounded by hundreds of carved stone deities.",
        discoveryCount: 24,
      },
      {
        id: "tr-neermahal",
        name: "Neermahal & Melaghar",
        type: "Lake Palace Marvel",
        tagline: "Eastern India's only water palace",
        highlight: "Taking a motorized country boat across Rudrasagar lake at sunset.",
        discoveryCount: 16,
      },
    ],
  },
  "IN-UP": {
    id: "IN-UP",
    tagline: "Ganges river ghats, Mughal sandstone & legendary Awadhi cuisine",
    description:
      "The epic heartland of the Gangetic plain. From the eternal cremation and prayer ghats of Varanasi to the refined culinary court culture of Lucknow and medieval ruins of Bundelkhand.",
    tags: [
      "Ganges Ghats",
      "Awadhi Cuisine",
      "Mughal Architecture",
      "Silk Weaving",
      "Living Traditions",
    ],
    discoveryCount: 132,
    highlight:
      "Varanasi dawn rowing on the misty Ganges, Lucknow heritage chikan embroidery and kebabs, and Bateshwar river temples.",
    destinations: [
      {
        id: "up-varanasi",
        name: "Varanasi Ghats & Alleyways",
        type: "Eternal Spiritual Riverfront",
        tagline: "Subah-e-Banaras dawn chants & silk looms",
        highlight:
          "Early morning boat rides watching the ancient riverfront come alive with prayer.",
        discoveryCount: 52,
      },
      {
        id: "up-lucknow",
        name: "Lucknow Old City (Chowk)",
        type: "Awadhi Cultural Capital",
        tagline: "Rumi Darwaza, Galouti kebabs & Chikan artisans",
        highlight: "Culinary trails through narrow lanes discovering slow-cooked Dum Pukht pots.",
        discoveryCount: 42,
      },
      {
        id: "up-bateshwar",
        name: "Bateshwar & Chambal",
        type: "River Ravine Sanctuary",
        tagline: "101 white Shiva temples on the Yamuna curve",
        highlight: "Safari in the National Chambal Sanctuary spotting gharials and skimmers.",
        discoveryCount: 22,
      },
    ],
  },
  "IN-UT": {
    id: "IN-UT",
    tagline: "Himalayan pilgrim trails, bugyal meadows & sacred river origins",
    description:
      "The Land of the Gods (Devbhoomi). Glacial sources of the Ganges and Yamuna, sprawling high-altitude bugyal meadows, tranquil Kumaoni cedar forests, and remote oak ridge hamlets.",
    tags: [
      "High Meadows (Bugyals)",
      "Sacred Rivers",
      "Cedar Ridges",
      "Trekking Trails",
      "Remote Temples",
    ],
    discoveryCount: 134,
    highlight:
      "Dayara Bugyal rolling emerald meadows, Munsiyari Panchachuli mountain vistas, and Binsar forest silence.",
    destinations: [
      {
        id: "ut-munsiyari",
        name: "Munsiyari",
        type: "Eastern Kumaon Ridge",
        tagline: "Panchachuli peaks & Johar valley salt route",
        highlight: "Unmatched sunrise view of five snow-capped peaks from Khaliya top.",
        discoveryCount: 42,
      },
      {
        id: "ut-binsar",
        name: "Binsar Sanctuary",
        type: "Oak & Rhododendron Forest",
        tagline: "Panoramic 300km Himalayan snow view",
        highlight:
          "Walking silent forest trails from Zero Point overlooking Trishul and Nanda Devi.",
        discoveryCount: 38,
      },
      {
        id: "ut-chopta",
        name: "Chopta & Tungnath",
        type: "Alpine Ridge",
        tagline: "World's highest Shiva shrine & Chandrashila peak",
        highlight: "Dawn summit trek to Chandrashila for a 360-degree Himalayan amphitheater.",
        discoveryCount: 36,
      },
    ],
  },
  "IN-WB": {
    id: "IN-WB",
    tagline: "Himalayan tea ridges, terracotta temples & mangrove deltas",
    description:
      "A land stretching from snowbound Kanchenjunga peaks to the largest mangrove delta on Earth. Rich in colonial architecture, terracotta temples, handlooms, and timeless intellectual culture.",
    tags: ["Mountains", "Tea Estates", "Living Heritage", "Art & Literature", "Coastal Mangroves"],
    discoveryCount: 148,
    highlight:
      "Darjeeling toy train morning curves, Bishnupur terracotta temples, and heritage tea bungalows.",
    destinations: [
      {
        id: "wb-darjeeling",
        name: "Darjeeling",
        type: "Himalayan Hill Station",
        tagline: "Colonial tea estates & Kanchenjunga sunrises",
        highlight:
          "Heritage tea bungalows in Tukvar and quiet walking paths through cedar forests.",
        discoveryCount: 42,
      },
      {
        id: "wb-kalimpong",
        name: "Kalimpong",
        type: "Alpine Ridge",
        tagline: "Monasteries, nurseries & quiet valley outlooks",
        highlight: "Zang Dhok Palri Phodang monastery and rare Himalayan orchid nurseries.",
        discoveryCount: 28,
      },
      {
        id: "wb-bishnupur",
        name: "Bishnupur",
        type: "Heritage Town",
        tagline: "17th-century terracotta craftsmanship",
        highlight: "Malla dynasty brick temples and watching master Baluchari silk weavers.",
        discoveryCount: 34,
      },
      {
        id: "wb-sundarbans",
        name: "Sundarbans Delta",
        type: "Mangrove Biosphere",
        tagline: "Tidal creeks, mudflats & Royal Bengal tigers",
        highlight: "Wooden boat safaris through narrow estuarine creeks at Netidhopani.",
        discoveryCount: 26,
      },
    ],
  },
};
