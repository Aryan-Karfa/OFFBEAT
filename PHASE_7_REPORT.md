# OFFBEAT — PHASE 7 IMPLEMENTATION REPORT

## Discovery Engine — Hackathon Fast-Track

**Milestone:** Phase 7 — Discovery Engine  
**Status:** READY & VERIFIED  
**Date:** October 2026  
**Workspace:** OFFBEAT Monorepo (`Backend`, `Frontend`, `packages/shared`)

---

### 1. Objective

Phase 7 achieves the most critical functional milestone in OFFBEAT: delivering the complete, end-to-end journey from user intent capture to real place discovery.

Judges and travelers can enter the platform with only a vague idea of the experience they desire, navigate through **Region → Travel Taste → Experience Taste → Day / Night Rhythm**, press **DISCOVER**, and receive authentic, relevant places accompanied by product-level explanations of why each place matches their intent.

---

### 2. Discovery Architecture

The Discovery Engine coordinates data retrieval, candidate normalization, canonical deduplication, deterministic multi-signal ranking, explainability, and result diversity:

```text
               POST /api/v1/discover
                         │
                         ▼
               Discovery Controller
                         │ (Zod Validation)
                         ▼
               Discovery Service
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   Geography         SerpApi           Context
   Repository       Integration        Builder
  (Internal DB)   (Cache/External)   (Normalized)
        │                │
        │                ▼
        │        Normalized Places
        │                │
        └────────┬───────┘
                 ▼
         Candidate Merger
         (Canonical Match & Dedup)
                 ↓
       Deterministic Scorer
       (30% Travel, 30% Experience, 15% Category,
        10% Geo, 5% Day/Night, 5% Rating, 5% Completeness)
                 ↓
           Diversity Pass
         (Avoid Overcrowding)
                 ↓
         Pagination Window
                 ↓
       Discovery Response DTO
```

The Discovery Engine relies on an application-level abstraction that decouples external providers (SerpApi) from internal ranking, making it ready for later intelligence layers (Gemini reasoning, Community intelligence, Confidence engine).

---

### 3. DiscoveryContext

Frontend state is translated into a backend-owned normalized representation:

```typescript
export interface DiscoveryContextDto {
  country: string;
  regionId: string;
  region: string;
  destination?: string | null;
  travelTaste: string[];
  experienceTaste: string[];
  dayNight: "DAY" | "NIGHT" | "ANY";
  preferredTime?: string | null;
  placeType?: string | null;
  intent: DiscoveryIntent;
}
```

- Sanitizes and lowercases user tastes
- Strips duplicate tags
- Preserves temporal rhythm (`DAY` / `NIGHT` / `ANY`)
- Resolves country name automatically from region metadata

---

### 4. Intent Foundation

- Default Intent: `DISCOVER_PLACES`
- Architecture foundation supports extensible future intents:
  - `FIND_EXPERIENCE`
  - `FIND_ALTERNATIVE`
  - `FIND_LESS_CROWDED`

---

### 5. Retrieval Strategy

Dual-source retrieval is executed concurrently:

1. **Internal Candidate Places**: Retrieved from `placeRepository.findPlacesByRegion(regionId)` (via PostgreSQL or in-memory canonical seed data).
2. **External SerpApi Places**: Retrieved via `serpApiService.searchPlaces(context, { requestId })` using `SerpApiQueryBuilder`, leveraging 24-hour search cache and single-flight request coalescing.
3. **Controlled Query Volume**: Exactly 1 bounded external query per unique discovery request; zero arbitrary queries.

---

### 6. Candidate Model

Both internal places and external normalized places are translated into unified `DiscoveryCandidate` records:

```typescript
export interface DiscoveryCandidate {
  id: string;
  source: "INTERNAL" | "EXTERNAL" | "COMBINED";
  provider: "OFFBEAT" | "SERPAPI" | "COMBINED";
  name: string;
  slug?: string;
  destination: string;
  region: string;
  categories: string[];
  location: GeoLocation;
  address?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  openingHours?: string[] | null;
  sourceUrl?: string | null;
}
```

---

### 7. Ranking Algorithm

Deterministic, explainable scoring with centralized weight configuration in `discovery.config.ts`:

| Signal Dimension           | Weight  | Description                                                                           |
| :------------------------- | :-----: | :------------------------------------------------------------------------------------ |
| **Travel Taste Match**     | **30%** | Evaluates candidate against canonical aliases (mountains, photography, beaches, etc.) |
| **Experience Taste Match** | **30%** | Evaluates nuances (sunrise, peaceful, less crowded, astro sky, etc.)                  |
| **Category Relevance**     | **15%** | Evaluates thematic tourist/discovery taxonomy vs generic businesses                   |
| **Geographic Match**       | **10%** | Confirms candidate is within target region and destination                            |
| **Day / Night Match**      | **5%**  | Evaluates daytime or nocturnal suitability                                            |
| **Rating Signal**          | **5%**  | Supporting trust signal (normalized 3.0–5.0; does not overpower taste intent)         |
| **Data Completeness**      | **5%**  | Reward for verified coordinates, descriptions, hours, and photos                      |

Scores are normalized between 0 and 100.

---

### 8. Explainability

Every result produces 2 to 3 product-level explanations from deterministic matching signals:

- _"Strong match for your Mountains and Photography preferences"_
- _"Ideal fit for Sunrise and Peaceful experiences"_
- _"Located in Darjeeling, West Bengal"_
- _"Recommended for daylight exploration"_
- _"Highly rated by visitors (4.8 ★)"_

Generic copy (such as _"Recommended for you"_) is strictly forbidden and rejected.

---

### 9. Deduplication & Canonical Merging

- If an external SerpApi result matches an existing canonical OFFBEAT place (by exact name or normalized slug):
  - Preserves canonical internal Place identity (`id`, `name`, `slug`, `destination`).
  - Marks source as `COMBINED` and provider as `COMBINED`.
  - Enriches place with external ratings, review counts, opening hours, and photos.
- Non-matching external places are retained as `EXTERNAL`.
- Obvious duplicate external entries are deduplicated.

---

### 10. Result Diversity

A deterministic diversity pass runs after scoring:

- Prevents runs of 3+ consecutive items sharing the exact same primary category or destination when high-scoring alternatives exist within 12 score points.
- Interleaves diverse experiences (e.g. Mountain Viewpoint → Heritage Loop → Forest Sanctuary) without sacrificing top match relevance.

---

### 11. API Contract

`POST /api/v1/discover`

**Request Example:**

```json
{
  "regionId": "IN-WB",
  "travelTaste": ["mountains", "photography"],
  "experienceTaste": ["sunrise", "peaceful", "nature"],
  "dayNight": "DAY",
  "intent": "DISCOVER_PLACES",
  "page": 1,
  "limit": 12
}
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "context": {
      "country": "India",
      "regionId": "IN-WB",
      "region": "West Bengal",
      "travelTaste": ["mountains", "photography"],
      "experienceTaste": ["sunrise", "peaceful", "nature"],
      "dayNight": "DAY",
      "intent": "DISCOVER_PLACES"
    },
    "results": [
      {
        "place": {
          "id": "place_tiger_hill",
          "name": "Tiger Hill",
          "destination": "Darjeeling",
          "region": "West Bengal",
          "categories": ["Mountain", "Sunrise", "Photography"],
          "location": { "lat": 27.012, "lng": 88.261 }
        },
        "score": 77,
        "why": [
          "Strong match for your Mountains and Photography preferences",
          "Great for a Sunrise experience",
          "Located in Darjeeling, West Bengal"
        ],
        "source": { "type": "INTERNAL", "provider": "OFFBEAT" }
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 6, "totalPages": 1, "hasMore": false },
    "fallback": false,
    "notice": null
  },
  "meta": {
    "requestId": "req_...",
    "timestamp": "..."
  }
}
```

---

### 12. Frontend Flow

1. **Routing:** `/discovery` connected to `DiscoveryPage.tsx`.
2. **Context Persistence:** Consumes preferences from `useTasteStore` (persisted in `localStorage`).
3. **Card UI:**
   - Place image with fallback gradient cover
   - Score pill (`87% MATCH`)
   - Source transparency badge (`Verified + SerpApi`, `OFFBEAT Canonical`, or `SerpApi Live`)
   - **Why Offbeat Discovered This** explanation callout
   - Category chips, rating badge, and opening hours
   - Detail actions (`/place/:id`)
4. **Lifecycle States:**
   - Animated multi-stage loading (`DiscoveryLoading`)
   - Informative empty state (`DiscoveryEmpty`)
   - Non-blocking fallback banner when live external search is unavailable
   - Controlled pagination with "Load More Discoveries" button

---

### 13. Fallback Strategy

- **Partial Failure Resilience:** If SerpApi is unavailable (missing API key, rate limit, timeout, or network error), the system gracefully serves internal places, setting `fallback: true` and providing a user-friendly notice banner.
- The UI never crashes and traveler context is never lost.

---

### 14. Tests

- **Unit Tests:**
  - `tests/unit/discovery.schema.test.ts` (7 tests)
  - `tests/unit/discovery.scorer.test.ts` (4 tests)
  - `tests/unit/discovery.merger.test.ts` (3 tests)
  - `tests/unit/discovery.diversity.test.ts` (2 tests)
- **Integration Tests:**
  - `tests/integration/discovery.test.ts` (6 tests)
- **Total Suite:** 27 test files, **135 tests passing** (100% green).
- **Verification Script:** `tsx scripts/verify-phase-7.ts` validated.

---

### 15. Demo Scenario

- **Country:** India
- **Region:** West Bengal (`IN-WB`)
- **Travel Taste:** Mountains + Photography
- **Experience Taste:** Sunrise + Peaceful + Nature
- **Temporal Rhythm:** Daylight (`DAY`)
- **Result:** **Tiger Hill** in Darjeeling ranks as the #1 discovery with verified mountain/sunrise/photography tags and explainable matching signals.

---

### 16. Known Limitations

- Gemini reasoning and AI-generated syntheses are intentionally excluded (deferred to Phase 11).
- Time-of-day crowd predictions and live busyness are deferred to Phase 9 / 10.
- Community submissions and voting will be integrated in Phase 8.

---

### 17. Final Status

```text
Phase 0  Foundation & Monorepo          ✅ VERIFIED
Phase 1  Geographic Engine              ✅ VERIFIED
Phase 2  Interactive Map Experience     ✅ VERIFIED
Phase 3  Traveler Taste Engine          ✅ VERIFIED
Phase 4  Foundational Domain & API      ✅ VERIFIED
Phase 5  Geography & Place Domain       ✅ VERIFIED
Phase 6  SerpApi Intelligence Layer     ✅ VERIFIED
Phase 7  Discovery Engine               ✅ READY & VERIFIED
```
