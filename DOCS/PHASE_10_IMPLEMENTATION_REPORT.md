# OFFBEAT — PHASE 10 IMPLEMENTATION REPORT

**Phase:** Phase 10 — Time & Crowd Intelligence  
**Status:** COMPLETE & VERIFIED  
**Date:** October 4, 2026  
**Quality Gates Passed:** `pnpm test` (224/224 tests passing across 36 suites), `pnpm typecheck` (packages/shared, Backend, Frontend: 0 errors), `pnpm build` (Frontend & Backend: 0 errors), `pnpm lint` (0 errors, 0 warnings), `pnpm format:check` (100% compliant), `pnpm validate:time-crowd` (0 errors), `pnpm check` (All phases 0–10 verified).

---

## 1. Objective

Phase 10 answers the essential traveler question:

> **“Not only where should I go, but when should I go and what crowd conditions should I expect?”**

OFFBEAT deterministically correlates:

```text
PLACE + TIME + DAY + SEASON + USER EXPERIENCE + CROWD
```

producing two decoupled, transparent intelligence layers:

1. **Time Intelligence:** Factual Operating Hours + Available Windows + User Day/Night Intent + Community Timing Observations + Experience Context $\rightarrow$ Recommended Visiting Windows + Time Fit.
2. **Crowd Intelligence:** Destination Trends + Place Context + Time Window + Day Type + Season + Community Observations $\rightarrow$ Contextual Patterns + Crowd Fit (without statistical hallucination or arbitrary numeric percentages).

---

## 2. Architecture & Module Structure

Phase 10 extends the existing modular architecture under `Backend/src/modules/intelligence/`:

```text
Backend/src/modules/intelligence/
│
├── time/
│   ├── time.types.ts            # Type contracts & domain interfaces
│   ├── time.schema.ts           # Zod input validation schemas
│   ├── time.engine.ts           # Deterministic time evaluation & normalization engine
│   ├── time.explanations.ts     # Safe, non-dogmatic explanation generator
│   ├── time.repository.ts       # Database & in-memory observation access
│   ├── time.service.ts          # Orchestration, caching & fallback logic
│   └── time.index.ts            # Submodule exports
│
├── crowd/
│   ├── crowd.types.ts           # Type contracts & crowd level enums
│   ├── crowd.schema.ts          # Zod validation schemas
│   ├── crowd.engine.ts          # Contextual pattern aggregator & fit evaluator
│   ├── crowd.explanations.ts    # Explainability layer
│   ├── crowd.repository.ts      # Database & in-memory crowd persistence
│   ├── crowd.service.ts         # Service orchestration & destination context
│   └── crowd.index.ts           # Submodule exports
│
├── intelligence.controller.ts   # Express request handlers & envelopes
├── intelligence.routes.ts       # Route registrations (/places/:id/times, /crowd, etc.)
└── index.ts                     # Module barrel exports
```

### Core Separation of Concerns

- **Operating Facts vs Community Recommendations:** Operating hours from official records/Google Maps are strictly labeled as `source: "EXTERNAL"`. Positioning recommendations from travelers (e.g. "Arrive 30 minutes before first light") are strictly labeled as `source: "COMMUNITY"`. System fallbacks are labeled `source: "SYSTEM"`.
- **Zero Gemini / AI Dependency in Phase 10:** Phase 10 is 100% deterministic and rule-based. Gemini reasoning is strictly deferred to Phase 11.

---

## 3. Time Observation Model

Implemented in `prisma/schema.prisma` and applied via migration `20261003000000_time_and_crowd_intelligence`:

```prisma
enum TimeObservationType {
  OPENING_TIME
  CLOSING_TIME
  BEST_TIME
  SUNRISE_TIME
  SUNSET_TIME
  LOW_CROWD_TIME
  COMMUNITY_RECOMMENDED_TIME
}

enum ObservationSource {
  EXTERNAL
  COMMUNITY
  SYSTEM
}

enum DayType {
  WEEKDAY
  WEEKEND
  ANY
}

model TimeObservation {
  id          String              @id @default(cuid())
  placeId     String
  userId      String?
  type        TimeObservationType
  startTime   String
  endTime     String
  dayType     DayType             @default(ANY)
  observation String?
  source      ObservationSource   @default(COMMUNITY)
  confidence  Float?
  createdAt   DateTime            @default(now())
  expiresAt   DateTime?

  place Place @relation(fields: [placeId], references: [id], onDelete: Cascade)
  user  User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([placeId, type])
  @@index([placeId, expiresAt])
}
```

---

## 4. Crowd Observation Model

Implemented in `prisma/schema.prisma`:

```prisma
enum CrowdLevel {
  LOW
  MODERATE
  HIGH
  VERY_HIGH
  UNKNOWN
}

enum Season {
  SPRING
  SUMMER
  MONSOON
  AUTUMN
  WINTER
  ANY
  UNKNOWN
}

model CrowdObservation {
  id            String            @id @default(cuid())
  placeId       String?
  destinationId String?
  userId        String?
  level         CrowdLevel
  timeStart     String?
  timeEnd       String?
  dayType       DayType           @default(ANY)
  season        Season            @default(ANY)
  observation   String?
  source        ObservationSource @default(COMMUNITY)
  createdAt     DateTime          @default(now())
  expiresAt     DateTime?

  place       Place?       @relation(fields: [placeId], references: [id], onDelete: Cascade)
  destination Destination? @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  user        User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([placeId, dayType])
  @@index([destinationId, dayType])
  @@index([placeId, expiresAt])
}
```

---

## 5. Time Engine

Defined in `Backend/src/modules/intelligence/time/time.engine.ts`:

- **`parseOperatingHours(rawHours)`:** Normalizes provider text strings (e.g. `"Monday - Sunday: 4:00 AM – 6:00 PM"`, `"Wednesday: Closed"`, `"Open 24 hours"`, or comma-separated windows) into structured `OperatingWindowDto` entries formatted in 24-hour `HH:mm`.
- **`calculateTimeIntelligence(inputs)`:**
  1. Priority 1: Official operating windows (`source: "EXTERNAL"`).
  2. Priority 2: Unexpired community recommendations (`source: "COMMUNITY"`).
  3. Priority 3: Phase 8 approved community submissions (`BEST_TIME`).
  4. Priority 4: Day/Night fit evaluation (`evaluateTimeFit`).
  5. Priority 5: Safe human-readable explanation generation.
- **`evaluateTimeFit(userDayNight, preferredTime, operatingHours, recommendedTimes)`:**
  Categorizes fit into `GOOD`, `PARTIAL`, `CONFLICT`, or `UNKNOWN`. Evaluates time collisions (e.g., requesting `NIGHT` when a place only supports early morning dawn sunrise windows yields `CONFLICT`).

---

## 6. Crowd Engine

Defined in `Backend/src/modules/intelligence/crowd/crowd.engine.ts`:

- **`calculateCrowdIntelligence(inputs)` / `calculateCrowdContext(inputs)`:**
  1. Filters expired observations (`expiresAt > now`).
  2. Aggregates place-level observations into discrete patterns (e.g. `WEEKDAY 04:30-06:30 -> LOW`, `WEEKEND 08:00-10:00 -> HIGH`).
  3. Uses destination-level observations as contextual background if no place-specific data exists.
  4. Never averages contradictory crowd levels (`LOW + HIGH` does not fabricate a synthetic percentage like "74%").
  5. Returns `UNKNOWN` with `confidence: 0` if no evidence exists (zero fabrication).
- **`evaluateCrowdFit(level, tastes)`:**
  Evaluates compatibility: `LOWER_CROWD_MATCH` (for low crowd with peaceful/less-crowded preferences), `NEUTRAL`, `HIGHER_CROWD`, or `UNKNOWN`.

---

## 7. Opening-Hours Normalization

- SerpApi and normalized places supply raw strings in `Place.openingHours`.
- The parser extracts days, handles single ranges, comma-separated multiple windows, 24-hour schedules (`00:00 - 24:00`), and closed days (`closed: true, open: null, close: null`).
- Unstructured or missing data cleanly returns `Operating hours not publicly specified` without fabricating times.

---

## 8. Community Integration

- Seamlessly integrates with Phase 8 `CommunitySubmission` (`BEST_TIME`, `CROWD_TIP`) and Phase 9 verification.
- Phase 10 introduces dedicated endpoints for direct structured contributions:
  - `POST /api/v1/places/:placeId/time-observations`
  - `POST /api/v1/places/:placeId/crowd-observations`

---

## 9. Freshness & Expiry Rules

- Both `TimeObservation` and `CrowdObservation` contain nullable `expiresAt` timestamps.
- Observations where `expiresAt < now` are strictly excluded from runtime intelligence calculations.
- Expired records are retained in database history for auditability and seasonal trend analysis.

---

## 10. Conflict Handling

- Rather than averaging conflicting inputs into an artificial single number, the crowd engine groups by context:
  ```text
  Pattern A: Weekday early morning -> LOW
  Pattern B: Weekend morning -> HIGH
  ```
- Transparent explanations clearly communicate nuances:
  > _"Lower crowd reported during weekday (04:30-06:30). Expect higher visitor traffic during weekends (08:00-10:00)."_

---

## 11. API Changes

| Method | Path                                         | Description                                                                         | Status    |
| ------ | -------------------------------------------- | ----------------------------------------------------------------------------------- | --------- |
| `GET`  | `/api/v1/places/:placeId/times`              | Retrieves structured operating hours, recommended windows, signals, and explanation | 200 / 404 |
| `GET`  | `/api/v1/places/:placeId/crowd`              | Retrieves overall crowd level, contextual patterns, confidence, and explanation     | 200 / 404 |
| `POST` | `/api/v1/places/:placeId/time-observations`  | Records a structured traveler time observation                                      | 201 / 400 |
| `POST` | `/api/v1/places/:placeId/crowd-observations` | Records a structured traveler crowd observation                                     | 201 / 400 |
| `GET`  | `/api/v1/destinations/:destinationId/crowd`  | Retrieves destination-wide crowd patterns                                           | 200 / 404 |

---

## 12. Discovery Engine Integration

`discovery.service.ts` now enriches each candidate result item with:

- `bestTime`: `{ start, end, dayType, source, reason }`
- `crowd`: `{ level, context, source, observation }`
- `timeFit`: `"GOOD" | "PARTIAL" | "CONFLICT" | "UNKNOWN"`
- `crowdFit`: `"LOWER_CROWD_MATCH" | "NEUTRAL" | "HIGHER_CROWD" | "UNKNOWN"`

---

## 13. Place Detail Integration

`placeService.getPlaceById` enriches `PlaceDetailDto` with:

- `timeIntelligence: TimeIntelligenceDto`
- `crowdIntelligence: CrowdIntelligenceDto`

---

## 14. Frontend Changes

1. **`Frontend/src/services/placesService.ts`:**
   - Added `getPlaceTimes(placeId)` and `getPlaceCrowd(placeId)` client methods.
2. **`Frontend/src/features/intelligence/TimeIntelligenceSection.tsx`:**
   - Visual card rendering official operating hours with an `EXTERNAL` badge, community recommended experience windows with a `COMMUNITY` badge, and `timeFit` pills.
3. **`Frontend/src/features/intelligence/CrowdIntelligenceSection.tsx`:**
   - Visual card rendering overall crowd status badge (`LOW`, `MODERATE`, `HIGH`, `VERY_HIGH`), contextual day/time pattern breakdown, and source attribution.
4. **`Frontend/src/pages/Place/PlacePage.tsx`:**
   - Added a dedicated 2-column grid featuring `TimeIntelligenceSection` and `CrowdIntelligenceSection` between the hero header and community discoveries.
5. **`Frontend/src/features/discovery/components/DiscoveryCard.tsx`:**
   - Integrated lightweight Phase 10 preview chips for `Best Time` (clock icon + window + reason) and `Crowd` (users icon + contextual condition).

---

## 15. Seed / Demo Data

Deterministic in-memory and database seed records implemented for key benchmark destinations:

- **Tiger Hill (`place_tiger_hill`):**
  - Operating Hours: `Monday - Sunday: 4:00 AM – 6:00 PM`
  - Best Time: `04:30 – 05:30` (Sunrise positioning before first light, `COMMUNITY`)
  - Crowd Weekday: `04:30 – 06:30` -> `LOW` (`COMMUNITY`)
  - Crowd Weekend: `08:00 – 10:00` -> `HIGH` (Shared-jeep congestion, `COMMUNITY`)
- **Batasia Loop (`place_batasia_loop`):**
  - Best Time: `08:00 – 10:00` (Toy Train spiral photography, `COMMUNITY`)
  - Crowd: `08:00 – 10:00` -> `LOW` (`COMMUNITY`)
- **Victoria Memorial (`place_victoria_memorial`):**
  - Best Time: `16:30 – 17:45` (Golden hour marble illumination, `COMMUNITY`)
  - Crowd: `16:00 – 18:30` -> `MODERATE` (`COMMUNITY`)
- **Darjeeling Destination (`dest_darjeeling`):**
  - Destination Crowd: Weekend mornings -> `HIGH`

---

## 16. Testing Results

Ran full unit & integration test suite (`pnpm test`):

```text
Test Files  36 passed (36)
Tests       224 passed (224)
Duration    14.86s
```

Specific Phase 10 test suites:

- `Backend/tests/unit/time.engine.test.ts`: 7/7 tests passed.
- `Backend/tests/unit/crowd.engine.test.ts`: 5/5 tests passed.
- `Backend/tests/integration/intelligence.test.ts`: 7/7 tests passed.
- All regression tests across Phases 0–9 passed.

---

## 17. Quality-Gate Results

| Command                    | Result          | Details                                               |
| -------------------------- | --------------- | ----------------------------------------------------- |
| `pnpm typecheck`           | Passed (exit 0) | Shared, Backend, and Frontend all typechecked cleanly |
| `pnpm build`               | Passed (exit 0) | Frontend Vite bundle & Backend `dist` emitted cleanly |
| `pnpm lint`                | Passed (exit 0) | 0 errors, 0 warnings across monorepo                  |
| `pnpm format:check`        | Passed (exit 0) | All files formatted per Prettier configuration        |
| `pnpm validate:time-crowd` | Passed (exit 0) | Deterministic verification suite passed               |
| `pnpm check`               | Passed (exit 0) | All Phase 0–10 validation suites passed               |

---

## 18. Live HTTP Verification

Verified against live backend running on `http://localhost:5000/api/v1`:

1. **`GET /api/v1/places/place_tiger_hill/times`:**
   - Status: `200 OK`
   - Returned `operatingHours` (4:00 AM – 6:00 PM), `recommendedTimes` (04:30 – 05:30), `availableWindows`, `signals`, and `explanation`.
2. **`GET /api/v1/places/place_tiger_hill/crowd`:**
   - Status: `200 OK`
   - Returned `overall: "LOW"`, patterns for `WEEKDAY` (`LOW`) and `WEEKEND` (`HIGH`), `source: "COMMUNITY"`, `crowdFit: "LOWER_CROWD_MATCH"`.
3. **`POST /api/v1/discover` (Demo scenario: Darjeeling, Sunrise, Photography, Peaceful, Less Crowded):**
   - Status: `200 OK`
   - Tiger Hill returned with score 77, verified community highlights, `bestTime` (`04:30 – 05:30`), `crowd` (`LOW`, `WEEKDAY 04:30-06:30`), and `crowdFit` (`LOWER_CROWD_MATCH`).

---

## 19. Known Limitations

- Real-time IoT sensor telemetry is omitted by design (out of scope for hackathon).
- Seasonality is modeled deterministically from observation metadata rather than live multi-year meteorology data.
- User authentication falls back to demo traveler header `x-user-id` when JWT session is absent.

---

## 20. Deferred Phase 11+ Work

- **Phase 11 (Gemini Reasoning):** Will ingest this structured Phase 10 output (`operatingHours`, `recommendedTimes`, `patterns`, `timeFit`, `crowdFit`) alongside Phase 8/9 community signals for natural language synthesis.
- **Phase 12 (Alternative Engine):** Will consume `crowdFit: "HIGHER_CROWD"` to recommend less crowded offbeat alternatives.
- **Phase 13 (Dynamic Itinerary Engine):** Will sequence schedule slots based on `operatingHours` and `recommendedTimes`.

---

## 21. Final Status Matrix

| Requirement                                                                   | Status      |
| ----------------------------------------------------------------------------- | ----------- |
| TimeObservation model implemented                                             | Verified ✅ |
| CrowdObservation model implemented                                            | Verified ✅ |
| Time types & DTOs implemented                                                 | Verified ✅ |
| Crowd levels (`LOW`, `MODERATE`, `HIGH`, `VERY_HIGH`, `UNKNOWN`)              | Verified ✅ |
| Day type (`WEEKDAY`, `WEEKEND`, `ANY`)                                        | Verified ✅ |
| Season taxonomy                                                               | Verified ✅ |
| Time engine with deterministic priority                                       | Verified ✅ |
| Crowd engine with contextual patterns                                         | Verified ✅ |
| Operating hours normalization (12h/24h, closed, open 24h, multi-window)       | Verified ✅ |
| Community timing integrated                                                   | Verified ✅ |
| Community crowd observations integrated                                       | Verified ✅ |
| Observation freshness & expiry exclusion                                      | Verified ✅ |
| Conflict handling without statistical hallucination                           | Verified ✅ |
| `GET /places/:id/times` endpoint                                              | Verified ✅ |
| `GET /places/:id/crowd` endpoint                                              | Verified ✅ |
| `POST /places/:id/time-observations` endpoint                                 | Verified ✅ |
| `POST /places/:id/crowd-observations` endpoint                                | Verified ✅ |
| `GET /destinations/:id/crowd` endpoint                                        | Verified ✅ |
| Place Details API enriched                                                    | Verified ✅ |
| Discovery Engine enriched                                                     | Verified ✅ |
| Frontend Place Page When-to-Go UI                                             | Verified ✅ |
| Frontend Discovery Card chips                                                 | Verified ✅ |
| Benchmark demo data (Tiger Hill, Batasia Loop, Victoria Memorial)             | Verified ✅ |
| Zero Gemini / AI dependency in Phase 10                                       | Verified ✅ |
| Phase 0–9 backwards compatibility preserved                                   | Verified ✅ |
| Full unit/integration tests passing (224/224)                                 | Verified ✅ |
| Quality gates passing (`typecheck`, `build`, `lint`, `format:check`, `check`) | Verified ✅ |
| Live HTTP verification passing                                                | Verified ✅ |
