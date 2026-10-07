# OFFBEAT — PHASE 13 IMPLEMENTATION REPORT

## ITINERARY ENGINE (DAY_TRIP + MULTI_DAY)

**Date:** October 7, 2026  
**Status:** READY / VERIFIED  
**Phase:** 13 — Itinerary Engine  
**Authoritative Gemini Model:** `gemini-3.8-flash`

---

## 1. Executive Summary

Phase 13 marks a fundamental transformation in the OFFBEAT travel discovery platform. It elevates OFFBEAT from answering:

> _"Here are places you may like."_

into answering:

> _"Here is the best way for YOU to experience these places."_

The Itinerary Engine creates human-centered, realistic travel days that optimize for traveler experience rather than raw place count. By uniting **Taste Profiling** (Phase 3), **Geographic Topology & Route Optimization** (Phase 5/13), **SerpApi Google Maps Directions** (Phase 6/13), **Community Intelligence** (Phase 8), **Confidence Scoring** (Phase 9), **Time & Crowd Intelligence** (Phase 10), and **Gemini 3.8 Flash Reasoning** (Phase 11) with **Find an Alternative Stop Swapping** (Phase 12), OFFBEAT creates itineraries that feel like an expert local concierge crafted them.

Crucially:

- **Deterministic-First Architecture**: AI never hallucinates places, opening hours, coordinates, or travel durations.
- **Backtracking Reduction**: Geographically ordered stop sequences with intelligent geographic routing.
- **Time Feasibility & Crowd Matching**: Hard operating windows, day/night contexts, and crowd curves evaluated before routing.
- **Midday Free Time**: Built-in unhurried windows for lunch and local spontaneous exploration.
- **Bounded Gemini Allowlist & Hard Constraint Guard**: Strict Zod output validation; any violation automatically triggers seamless deterministic fallback.
- **Stop Swapping via Phase 12 Alternatives**: Travelers can inspect any stop and instantly swap it for a curated alternative without losing context.
- **Zero API Key Exposure**: All SerpApi and Gemini credentials stay securely backend-contained.

---

## 2. Phase Objective

The core objective of Phase 13 is delivering the judge-facing hackathon demo flow:

```text
Discover Places (Phase 7)
       ↓
Explore Place Details
       ↓
Find Alternative (Phase 12)
       ↓
[ BUILD MY DAY ]
       ↓
OFFBEAT Generates Intelligent Itinerary
       ↓
Geographically Sensible Sequence & Reduced Backtracking
       ↓
Operating Windows & Crowd Density Respected
       ↓
Midday Free-Time Window Inserted
       ↓
"WHY OFFBEAT BUILT THIS DAY" Explainability
       ↓
Interactive Timeline & Journey Map
       ↓
[ SWAP STOP ] via Phase 12 Alternatives Engine
```

---

## 3. Architecture

The Itinerary Engine employs a multi-tiered deterministic-first pipeline:

```text
User Taste & Time Context
          ↓
POST /api/v1/itineraries
          ↓
Candidate Collection (Internal Places + Discovery + Must-Visits + Selected Alternatives)
          ↓
Candidate Enrichment (TimeFit, CrowdFit, Community Signals, Confidence Summary)
          ↓
Route Optimization (Heuristic Anchor Selection + Backtracking Reduction + SerpApi Directions)
          ↓
Deterministic Scheduling (Operating Hours + Pace Buffers + Midday Lunch Window)
          ↓
Bounded Approved Candidate Allowlist (Top 5–8)
          ↓
Gemini 3.8 Flash Narrative Reasoning & Sequence Refinement
          ↓
Structured Output Zod Validation + Hard Constraint Business Guards
          ↓
Accept AI Reasoning  OR  Seamless Deterministic Fallback (fallback: true)
          ↓
In-Memory Storage / Retrieval (GET /api/v1/itineraries/:itineraryId)
          ↓
Frontend Responsive Timeline & Journey Map View
```

Gemini acts strictly as an analytical reasoning and narrative layer. It cannot invent candidates, override hard time conflicts, or bypass geographic routing.

---

## 4. Itinerary Data Model

The shared contracts (`@offbeat/shared`) define strongly validated TypeScript types:

- **`CreateItineraryRequestDto`**:

  ```ts
  type CreateItineraryRequestDto = {
    country?: string;
    regionId: string;
    destinationId?: string | null;
    travelTaste?: string[];
    experienceTaste?: string[];
    dayNight?: "DAY" | "NIGHT" | "ANY";
    preferredStartTime?: string | null;
    preferredEndTime?: string | null;
    durationDays?: number;
    pace?: "RELAXED" | "BALANCED" | "PACKED";
    mustVisitPlaceIds?: string[];
    selectedAlternativePlaceIds?: string[];
    avoidPlaceIds?: string[];
    intent?: "EXPLORE" | "PHOTOGRAPHY" | "FOOD" | "NATURE" | "CULTURE" | "MIXED";
  };
  ```

- **`ItineraryResponseDto`**:

  ```ts
  type ItineraryResponseDto = {
    id: string;
    title: string;
    destination: string;
    regionId: string;
    durationDays: number;
    pace: "RELAXED" | "BALANCED" | "PACKED";
    days: ItineraryDayDto[];
    summary: string;
    reasoning?: ItineraryReasoningDto;
    source: "GEMINI" | "DETERMINISTIC";
    fallback: boolean;
    createdAt: string;
  };
  ```

- **`ItineraryStopDto`**:
  ```ts
  type ItineraryStopDto = {
    placeId?: string;
    externalId?: string;
    name: string;
    destination?: string;
    category?: string;
    arrivalTime: string;
    departureTime: string;
    durationMinutes: number;
    travelFromPreviousMinutes: number;
    timeFit: "GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN";
    crowdFit: "GOOD" | "PARTIAL" | "UNKNOWN";
    confidence?: ConfidenceSummaryDto;
    community?: CommunitySummaryDto;
    why: string;
    isFreeTime?: boolean;
    location?: GeoLocation;
  };
  ```

---

## 5. Candidate Generation

The `ItineraryCandidateCollector` harvests candidates deterministically:

1. **Internal Places**: Reads canonical destination places from `PlacesRepository`.
2. **User Explicit Signals**:
   - `mustVisitPlaceIds`: Prioritized and locked into the candidate pool.
   - `selectedAlternativePlaceIds`: Injected directly from Phase 12 discovery.
   - `avoidPlaceIds`: Strictly excluded prior to ranking.
3. **Multi-Signal Enrichment**: Each candidate is annotated with:
   - Taste alignment score against user's travel and experience preferences.
   - Phase 10 Time Intelligence (operating hours, recommended windows, `timeFit`).
   - Phase 10 Crowd Intelligence (density curve, `crowdFit`).
   - Phase 9 Confidence Summary (evidence strength, verified score).
   - Phase 8 Community Signals (submission count, helpful count, verified badges).

---

## 6. Geographic Optimization

A core failure mode of naive itinerary generators is "zig-zagging" back and forth across a city or valley. The `ItineraryRouter` eliminates backtracking through a robust spatial heuristic:

1. **Spatial Anchor Selection**:
   - Identifies time-critical or must-visit places (e.g. dawn sunrise points like Tiger Hill).
   - Starts at the most geographically sensible morning anchor.
2. **Greedy Nearest Feasible Neighbor**:
   - Computes spatial distance via Haversine formula and SerpApi route vectors.
   - Applies a category diversity penalty to avoid clustering identical place types (e.g., Mountain followed by Mountain).
   - Chooses the nearest feasible high-value stop.
3. **Route Continuity**: Connects stops into a smooth spatial arc, reducing total travel duration.

---

## 7. Time Intelligence

Reuses Phase 10 as the sole temporal authority:

- **Hard Opening Hours**: Checks start and end operating hours. If a place opens at 09:00, arrival cannot be scheduled at 06:00 without registering a conflict.
- **Preferred Windows**: Sunrise viewpoints (e.g. Tiger Hill) are targeted for dawn arrival (~06:00–07:00).
- **Time Fit Status**:
  - `GOOD`: Stop visit falls squarely within recommended conditions.
  - `PARTIAL`: Stop is open, but lighting/weather/timing is suboptimal.
  - `CONFLICT`: Stop is closed or time sequence is impossible.
  - `UNKNOWN`: Place operates without published opening hour constraints (e.g., public viewpoint).
- AI is forbidden from overriding hard time conflicts.

---

## 8. Crowd Intelligence

Reuses Phase 10 Crowd Curves:

- Analyzes hourly crowd density (`LOW`, `MODERATE`, `HIGH`, `VERY_HIGH`, `UNKNOWN`).
- Prioritizes `LOW` or `MODERATE` windows for tranquil or photography-oriented traveler intents.
- Flags high-density peak periods transparently in stop metadata.
- Preserves `UNKNOWN` truthfully without fabricating crowd levels for unverified places.

---

## 9. Community Intelligence

Reuses Phase 8 Community Submissions:

- Incorporates local tips, confirmed observations, and community evidence.
- Highlights community verification badges directly on stop cards.
- Untrusted traveler text is safely isolated behind prompt injection boundaries `<traveler_notes>` before passing to Gemini.

---

## 10. Confidence Integration

Reuses Phase 9 Confidence Scores:

- Employs confidence scores to rank internal canonical places above unverified third-party candidates.
- Surfaces `STRONG` or `MODERATE` evidence indicators on stop details.
- Avoids misleading percentage promises; presents factual verification states (`VERIFIED`, `COMMUNITY_BACKED`).

---

## 11. Pace Logic

OFFBEAT offers three distinct pacing modes:

| Pace           | Target Stops / Day | Dwell Duration Multiplier | Transit Buffer |     Free Time Allotment      |
| :------------- | :----------------: | :-----------------------: | :------------: | :--------------------------: |
| **`RELAXED`**  |       2 – 3        |   1.3× (longer visits)    |    20 mins     | 60 mins lunch + local stroll |
| **`BALANCED`** |       3 – 4        |  1.0× (standard visits)   |    15 mins     |   45–60 mins lunch window    |
| **`PACKED`**   |       4 – 5        |   0.85× (brisk visits)    |    10 mins     |   30–45 mins lunch window    |

**Midday Free Time Guarantee**: The scheduler detects transition through midday (11:30–14:30) and automatically schedules an unhurried "Lunch & Local Exploration" stop. OFFBEAT never artificially packs every single minute.

---

## 12. Gemini Reasoning

Gemini 3.8 Flash acts as an analytical synthesizer and narrator:

- **Input Context**: Bounded candidate allowlist (Top 5–8 approved candidates), draft schedule, user tastes, crowd curves, confidence notes.
- **Permissions**:
  - Reorder stops if it improves narrative flow without violating time or route constraints.
  - Generate an insightful, human-sounding "WHY OFFBEAT BUILT THIS DAY" explanation.
  - Identify trade-offs and suggest meaningful local context.
- **Prohibitions**:
  - CANNOT invent places or new IDs.
  - CANNOT hallucinate opening hours or travel times.
  - CANNOT override hard time conflicts.

---

## 13. Hard Constraint Guard

Prior to accepting any Gemini itinerary output, `Backend/src/integrations/gemini/gemini.guard.ts` executes a 5-point verification check:

1. **Allowlist Integrity**: Every returned place ID must exist in the approved candidate set (`validateItineraryCandidateAllowlist`).
2. **No Duplicate Places**: No place ID can appear more than once in the itinerary.
3. **Exclusion Enforcement**: No place in `avoidPlaceIds` can appear.
4. **Must-Visit Preservation**: User-specified must-visit places must be scheduled.
5. **Duration Consistency**: Total days generated must match requested duration.

Any failure immediately rejects the AI output and triggers deterministic fallback.

---

## 14. Deterministic Fallback

If Gemini encounters:

- Request timeout (>10000ms)
- HTTP 429 Quota Exhaustion / Rate Limits
- HTTP 503 Upstream Outage
- Malformed JSON or Zod Schema Mismatch
- Allowlist or Constraint Guard Rejection

The engine immediately activates `generateDeterministicItineraryFallback`:

- Sets `source: "DETERMINISTIC"` and `fallback: true`.
- Emits fully grounded, deterministic rationale explaining the sequence, morning anchor, and transit efficiency.
- User experience is never interrupted.

---

## 15. Frontend UX

A judge-facing UI built in Vanilla CSS and modern design aesthetics:

- **`[ BUILD MY DAY ]` CTA Buttons**: Embedded across Place Details and Alternatives pages.
- **Itinerary Builder (`ItineraryBuilder.tsx`)**:
  - Location and destination selector with taste chips.
  - Pacing selector (`Relaxed`, `Balanced`, `Packed`).
  - Active time window selectors (`Preferred Start` and `Preferred End`).
  - Day/Night preference toggle (`DAY`, `NIGHT`, `ANY`).
- **Hero & Summary Banner**: Displays destination header, total duration, pace badge, and fallback transparency indicator.
- **"WHY OFFBEAT BUILT THIS DAY" Section**: Highlights taste synergy, chronological wisdom, and trade-offs.

---

## 16. Map / Timeline

- **Interactive Timeline (`ItineraryTimeline.tsx` & `ItineraryStopCard.tsx`)**:
  - Clean chronological display with arrival and departure timestamps.
  - Transit badges between stops showing travel time and route mode.
  - Free time lunch cards with distinct styling.
  - Progressive disclosure of time fit, crowd density, and community tips.
- **Spatial Journey Map (`ItineraryMap.tsx`)**:
  - Custom SVG journey visualization plotting stop coordinates with numbered pins (`01`, `02`, `03`).
  - Directional vector lines connecting consecutive stops with transit time markers.
  - Interactive pin selection highlighting corresponding timeline cards.
  - Responsive design with collapsible mobile toggle (`[ SHOW MAP ]` / `[ HIDE MAP ]`).

---

## 17. Alternatives Integration (Stop Swapping)

The Stop Swap feature seamlessly reuses Phase 12:

1. User clicks `[ SWAP ]` on any itinerary stop card.
2. `SwapStopModal.tsx` opens, pre-configured with the stop's identifier and traveler taste context.
3. Calls `/api/v1/places/:placeId/alternatives` across the 6 alternative modes (`REPLACEMENT`, `ENHANCEMENT`, `COMPLEMENTARY`, `NEARBY_DISCOVERY`, `TIMING_ALTERNATIVE`, `LOWER_CROWD`).
4. User selects their preferred replacement.
5. `itineraryStore.swapStop()` replaces the stop and automatically triggers schedule recalculation.

---

## 18. API Contract

### `POST /api/v1/itineraries`

Generates an itinerary based on user preferences and constraints.

- **Headers**: `Content-Type: application/json`, `X-Request-Id: optional`
- **Request Body**: Validated `CreateItineraryRequestDto`
- **Response**: `200 OK` with standard OFFBEAT envelope `{ success: true, data: ItineraryResponseDto }`

### `GET /api/v1/itineraries/:itineraryId`

Retrieves a previously generated itinerary from in-memory storage.

- **Response**: `200 OK` with `ItineraryResponseDto` or `404 Not Found`

---

## 19. Tests

Comprehensive test coverage across unit, integration, and mock suites:

- **50 / 50 test files passing**
- **293 / 293 total tests passing**
- Key Phase 13 test files:
  - `Backend/tests/unit/itinerary.scheduler.test.ts`: Operating hours, dwell times, midday free time.
  - `Backend/tests/unit/itinerary.router.test.ts`: Backtracking reduction, spatial distance, anchor sorting.
  - `Backend/tests/unit/itinerary.service.test.ts`: End-to-end generation, allowlist validation, fallback triggers.
  - `Backend/tests/unit/gemini.itinerary.test.ts`: AI reasoning prompts, Zod output parsing, allowlist checks.
  - `Backend/tests/integration/itinerary.test.ts`: Full HTTP endpoint testing (`POST` and `GET`).

---

## 20. Validation

All automated verification commands execute cleanly with exit code 0:

```bash
pnpm validate:itinerary  # 12 / 12 Phase 13 verification criteria PASS
pnpm test                # 293 / 293 tests PASS
pnpm typecheck           # Shared, Backend, Frontend typecheck PASS
pnpm build               # Production bundle compilation PASS
pnpm check               # All 13 validation suites, ESLint, and Prettier PASS
```

---

## 21. Known Limitations

1. **Multi-Day Advanced Real-World Complexities**: While multi-day generation is fully supported structurally by the data model and scheduler, multi-day hotel check-in/luggage optimization is simplified for hackathon stability.
2. **SerpApi Directions Quotas**: SerpApi directions are requested only for selected transitions to avoid burning API credits, with accurate Haversine distance heuristics serving as instant fallback.
3. **In-Memory Storage**: Itineraries are persisted in an in-memory repository suitable for development and hackathon evaluation; database persistence can be enabled in a future phase.

---

## 22. Final Status

Phase 13 is **READY / VERIFIED**.

- Core Itinerary API: **PASS**
- Deterministic Scheduling & Free Time: **PASS**
- Geographic Routing & Backtracking Reduction: **PASS**
- Time & Crowd Intelligence Integration: **PASS**
- Community & Confidence Signal Preservation: **PASS**
- Phase 12 Alternatives Stop Swapping: **PASS**
- Gemini 3.8 Flash Reasoning & Allowlist Guard: **PASS**
- Deterministic Fallback: **PASS**
- Frontend Builder, Timeline, and Journey Map: **PASS**
- All Monorepo Checks (Test, Typecheck, Build, Check): **PASS**
