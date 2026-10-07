# OFFBEAT — PHASE 15 IMPLEMENTATION REPORT

## MEMORY & PERSONALIZATION

**Date:** October 8, 2026  
**Status:** READY / VERIFIED  
**Phase:** 15 — Memory & Personalization  
**Authoritative Gemini Model:** `gemini-3.8-flash`

---

## 1. Executive Summary

Phase 15 completes the cognitive loop of the OFFBEAT travel discovery platform:

```text
DISCOVER (Phases 1–7)
  ↓
EXPERIENCE & ITINERARY (Phases 8–10, 12, 13)
  ↓
TAKE HOME (Phase 14)
  ↓
MEMORY & PERSONALIZATION (Phase 15)
  ↓
RETURN VISIT ("OFFBEAT remembers how you travel")
```

The objective is to make OFFBEAT remember useful traveler preferences and interaction patterns so future discovery, alternative stop suggestions, daily itineraries, and take-home recommendations become progressively more tailored and intuitive.

OFFBEAT is **not** a social network, **not** an ad-targeting surveillance engine, and **not** an opaque deep-learning black box. Memory is built on a transparent, deterministic-first architecture where the traveler always has full visibility and control over what is remembered.

---

## 2. Phase Objective

Answer the traveler's expectation:

> _"OFFBEAT doesn't just treat every trip as a blank slate. It remembers how I travel."_

Key Objectives:

- Distinguish between **Explicit** choices ("You told OFFBEAT") and **Inferred** patterns ("OFFBEAT noticed").
- Guarantee that **current session intent always supersedes past memory**.
- Protect traveler privacy through strict data minimization: never infer or store health, medical, political, religious, financial, or sensitive personal attributes.
- Keep Gemini reasoning bounded as a consumer of memory context with zero persistent memory write authority.
- Provide clear user controls: view memories, inspect explanations, delete individual memories, clear all memory, or disable memory completely.

---

## 3. Memory Philosophy

Memory represents **useful travel behavior**, not personal profiling:

```text
YES (Travel-Specific Behavioral Signals):
- Travel style affinities (Mountains, Photography, Wildlife, Heritage)
- Experience nuances (Sunrise, Nature trails, Street food)
- Preferred daily pace (Relaxed, Balanced, Packed)
- Alternative stop mode biases (Lower Crowd, Hidden Gems)
- Take-home craft & culinary affinities (Single-Estate Tea, Handloom Weaves)

NO (Strictly Blocked / Out of Scope):
- No medical or health data
- No political or electoral stances
- No religious or creed observations
- No income, credit, or financial status
- No full surveillance browsing logs
```

---

## 4. Explicit vs Inferred Memory

Personalization distinguishes the confidence and attribution of memory signals:

1. **Explicit Memory (`source: "EXPLICIT"`):**
   - User directly selected tastes or settings in onboarding or taste setup.
   - Initial confidence: `HIGH`.
   - Decay rate: Extremely slow (90+ day half-life, never drops below floor).
   - Label: _"You told OFFBEAT"_.
   - Explanation: _"You directly selected Mountains in your travel preferences."_

2. **Inferred Memory (`source: "INFERRED" / "INTERACTION" / "ITINERARY"`):**
   - Derived from repeated actions (exploring viewpoints, selecting lower-crowd alternatives, generating relaxed itineraries).
   - Initial confidence: `MODERATE` or `LOW`.
   - Decay rate: 21-day half-life; requires ongoing corroboration to maintain strength.
   - Label: _"OFFBEAT noticed"_.
   - Explanation: _"Inferred from your repeated interest in scenic viewpoints across 3 journey choices."_

---

## 5. Memory Taxonomy

Taxonomy of 10 memory types ([`MemoryType`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/packages/shared/src/index.ts)):

1. `TASTE` — High-level travel taste (mountains, coastal, wildlife, heritage).
2. `EXPERIENCE` — Specific experience nuance (sunrise, photography, culinary).
3. `TIME_PREFERENCE` — Preferred diurnal slot (sunrise, day, golden hour, night).
4. `PACE` — Itinerary pacing preference (RELAXED, BALANCED, PACKED).
5. `CATEGORY_AFFINITY` — Affinity for place categories (scenic_viewpoint, heritage_kitchen).
6. `DESTINATION_AFFINITY` — Repeated exploration of specific geographical areas.
7. `PLACE_AFFINITY` — Repeated interest in specific landmarks or ecosystems.
8. `ALTERNATIVE_PREFERENCE` — Preferred alternative swap mode (e.g. LOWER_CROWD).
9. `TAKE_HOME_PREFERENCE` — Preferred take-home category (e.g. TEA_COFFEE, FOOD, HANDICRAFT).
10. `ITINERARY_PREFERENCE` — Preferred itinerary structure or start times.

---

## 6. Data Model

Persistent normalized schema in [`prisma/schema.prisma`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/prisma/schema.prisma):

```prisma
model TravelerMemory {
  id            String           @id @default(uuid())
  userId        String           @map("user_id")
  type          MemoryType
  key           String
  value         String
  source        MemorySource     @default(INFERRED)
  confidence    MemoryConfidence @default(MODERATE)
  weight        Float            @default(1.0)
  evidenceCount Int              @default(1) @map("evidence_count")
  lastUsedAt    DateTime?        @map("last_used_at")
  createdAt     DateTime         @default(now()) @map("created_at")
  updatedAt     DateTime         @updatedAt @map("updated_at")
  expiresAt     DateTime?        @map("expires_at")
  userVisible   Boolean          @default(true) @map("user_visible")

  user   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  events MemoryEvent[]

  @@unique([userId, type, key])
  @@index([userId])
  @@index([userId, type])
  @@index([userId, userVisible])
  @@map("traveler_memories")
}
```

---

## 7. Memory Events

Minimal event auditing model in [`MemoryEvent`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/prisma/schema.prisma):

```prisma
model MemoryEvent {
  id          String          @id @default(uuid())
  userId      String          @map("user_id")
  memoryId    String?         @map("memory_id")
  eventType   MemoryEventType @map("event_type")
  subjectType String?         @map("subject_type")
  subjectId   String?         @map("subject_id")
  signalKey   String          @map("signal_key")
  signalValue String          @map("signal_value")
  weightDelta Float           @default(0.0) @map("weight_delta")
  createdAt   DateTime        @default(now()) @map("created_at")

  user   User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  memory TravelerMemory? @relation(fields: [memoryId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
  @@map("memory_events")
}
```

Supported event types:

- `TASTE_SELECTED`, `EXPERIENCE_SELECTED`
- `PLACE_VIEWED`, `PLACE_EXPLORED`
- `ALTERNATIVE_SELECTED`
- `ITINERARY_CREATED`, `ITINERARY_STOP_KEPT`, `ITINERARY_STOP_SWAPPED`
- `TAKE_HOME_VIEWED`, `TAKE_HOME_SELECTED`
- `CATEGORY_SELECTED`

---

## 8. Weighting & Decay

Deterministic weight deltas ([`memory.types.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/memory/memory.types.ts)):

| Event Action             | Weight Delta | Default Source | Initial Confidence |
| :----------------------- | :----------- | :------------- | :----------------- |
| `TASTE_SELECTED`         | `+1.00`      | `EXPLICIT`     | `HIGH`             |
| `EXPERIENCE_SELECTED`    | `+1.00`      | `EXPLICIT`     | `HIGH`             |
| `ITINERARY_STOP_KEPT`    | `+0.75`      | `ITINERARY`    | `MODERATE`         |
| `ALTERNATIVE_SELECTED`   | `+0.70`      | `ALTERNATIVE`  | `MODERATE`         |
| `TAKE_HOME_SELECTED`     | `+0.60`      | `TAKE_HOME`    | `MODERATE`         |
| `ITINERARY_CREATED`      | `+0.60`      | `ITINERARY`    | `MODERATE`         |
| `PLACE_EXPLORED`         | `+0.35`      | `INTERACTION`  | `MODERATE`         |
| `ITINERARY_STOP_SWAPPED` | `-0.50`      | `ITINERARY`    | `LOW`              |

Bounded decay ([`MemoryRules.calculateDecayedWeight`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/memory/memory.rules.ts)):

- Inferred preferences decay with a 21-day half-life: `weight * Math.pow(0.5, elapsedDays / 21)`.
- Explicit preferences decay very slowly (90-day half-life) and never fall below `0.85`.
- Negative weights are bounded at `0.05` minimum; memory entries below `0.10` are pruned from active personalization.

---

## 9. Personalization Priority

```text
Current Explicit Context (Region, Day/Night, Constraints)
        >
Current Session Tastes (User's active search filters)
        >
Recent Explicit Memory (Saved user preferences)
        >
Recent Inferred Memory (Repeated journey interactions)
        >
Older Inferred Memory (Decaying background signals)
```

**Cardinal Rule**: A remembered preference never overrides explicit user intent. If a traveler with remembered "Nightlife" affinity searches for "Nature + Sunrise" in Darjeeling, the current session completely dictates results.

---

## 10. Discovery Integration

Integrated into [`DiscoveryScorer`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/discovery/discovery.scorer.ts):

- Bounded personalization adjustment: up to **+8 points max** added to candidate score.
- Applies when candidate categories match remembered category affinities, or non-conflicting explicit travel styles.
- Adds explainable transparent reason to `why`:
  - _"Matches your remembered preference for Scenic Viewpoint"_
  - _"Reflects your saved travel style (Mountains)"_
- Preserves the core scoring balance: current taste match (30%), experience match (30%), and category (15%) remain dominant.

---

## 11. Alternatives Integration

Integrated into [`AlternativesScorer`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/alternatives/alternatives.scorer.ts):

- When traveler memory exhibits an `alternativePreference` (e.g. `LOWER_CROWD`), candidates matching that mode receive a slight score adjustment (+0.05).
- If the traveler explicitly selects another mode, the user's manual selection is respected unconditionally.

---

## 12. Itinerary Integration

Integrated into [`ItineraryService`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/itinerary/itinerary.service.ts):

- If the traveler has not explicitly selected a pace, the itinerary engine defaults to their remembered pace (`RELAXED`, `BALANCED`, `PACKED`).
- Pacing defaults are stated transparently in the itinerary notes: _"Defaulted to your preferred pace (Relaxed) from travel history"_.

---

## 13. TAKE HOME Integration

Integrated into [`TakeHomeScorer`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/take-home/take-home.scorer.ts):

- When traveler memory reflects affinities for local product categories (`TEA_COFFEE`, `HANDICRAFT`, `FOOD`), matching take-home candidates receive a bounded taste affinity bonus (+0.15).
- Unrelated items are never hidden; diversity and GI authenticity are preserved.

---

## 14. Gemini Memory Boundary

Rigorous security and prompt isolation in [`gemini.prompts.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/gemini/gemini.prompts.ts) and [`gemini.guard.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/gemini/gemini.guard.ts):

1. Sanitized context enclosed in `<traveler_memory>` prompt tags.
2. System instruction Rule 11 forbids Gemini from:
   - Inferring sensitive attributes.
   - Claiming false certainty about inferred habits ("We know with 100% certainty").
   - Inventing historical traveler actions.
   - Attempting memory mutations.
3. Guardrails reject any model output that leaks pseudo-write commands or sensitive attributes.

---

## 15. Privacy & Data Minimization

- **Zero Sensitive Data**: Ingestion rejects keywords matching `health`, `medical`, `illness`, `politic`, `religion`, `sexuality`, `finance`, `salary`.
- **Identity Isolation**: Memory records are bound strictly to `userId`. IDOR attacks are prevented; User A cannot read, update, or delete User B's memories.
- **Data Minimization**: Raw query payloads, full HTTP requests, and IP addresses are never retained in traveler memory.

---

## 16. Memory Controls

Travelers have direct self-service controls:

- **Master Toggle**: Enable or pause memory anytime. When paused, no new memories are written and ranking is unpersonalized.
- **Inspect Signals**: View the exact list of remembered styles, confidence levels, weights, and explanation strings.
- **Individual Deletion**: `[Remove]` button on any single memory item immediately purges it.
- **Clear All**: Confirmation modal allows one-click wipe of all remembered travel signals.

---

## 17. Frontend UX

Rich, non-creepy UI implementation:

- **Personalization Indicator** ([`PersonalizationIndicator.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/memory/PersonalizationIndicator.tsx)): A subtle pill on Discovery showing _"Personalized for you"_ with an explainability popover.
- **Memory Item Card** ([`MemoryItem.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/memory/MemoryItem.tsx)): Visual breakdown of confidence badges, source attribution, weight bar, and remove button.
- **Memory List** ([`MemoryList.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/memory/MemoryList.tsx)): Filterable tabs for _All_, _You Told OFFBEAT_, and _OFFBEAT Noticed_.
- **Settings Panel** ([`MemorySettings.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/memory/MemorySettings.tsx)): Master switch, side-by-side privacy transparency guide, and danger-zone Clear All modal.
- **Dedicated Page** ([`MemoryPage.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/pages/Memory/MemoryPage.tsx)): Accessible at `/memory` and `/settings/personalization`.

---

## 18. API Contract

### Endpoints

```http
GET    /api/v1/me/memory             # Retrieve all memories with explanations
DELETE /api/v1/me/memory             # Clear all traveler memories
POST   /api/v1/me/memory/events      # Ingest travel interaction event
GET    /api/v1/me/memory/settings    # Get memory enabled state
PATCH  /api/v1/me/memory/settings    # Toggle memory enabled state
PATCH  /api/v1/me/memory/:memoryId   # Update visibility or weight
DELETE /api/v1/me/memory/:memoryId   # Delete specific memory item
GET    /api/v1/me/personalization    # Retrieve normalized personalization profile
```

---

## 19. Database Migration

Migration file created at:
[`prisma/migrations/20261008000000_memory_and_personalization/migration.sql`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/prisma/migrations/20261008000000_memory_and_personalization/migration.sql)

Created tables:

- `traveler_memories`
- `memory_events`
- `traveler_memory_settings`
- Enums: `MemoryType`, `MemorySource`, `MemoryConfidence`, `MemoryEventType`.

Prisma Client regenerated successfully via `pnpm prisma:generate`.

---

## 20. Tests

All unit and integration tests passing:

- [`memory.rules.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/memory.rules.test.ts) (6 tests): Sensitive signal blocking, deterministic weight decay, confidence rules, transparent explanations.
- [`memory.service.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/memory.service.test.ts) (6 tests): Event recording, sensitive signal rejection, setting toggle, individual deletion, clear all, Gemini context.
- [`gemini.memory.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/gemini.memory.test.ts) (6 tests): System instruction Rule 11, prompt section formatting, sensitive inference guard, certainty guard, write command guard.
- [`personalization.scorer.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/personalization.scorer.test.ts) (2 tests): Discovery personalization bonus and disabled-memory behavior.
- [`memory.api.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/integration/memory.api.test.ts) (6 tests): End-to-end HTTP tests, settings toggle, individual deletion, clear-all, and identity isolation between users.

---

## 21. Validation

Automated verification script [`scripts/verify-phase-15.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/scripts/verify-phase-15.ts):

- Executable via `pnpm validate:memory`.
- Validates all 23 criteria including module presence, shared contracts, database migrations, explicit/inferred distinction, evidence accumulation, decay, user isolation, engine integrations, Gemini boundaries, user controls, and zero secret leaks.

---

## 22. Known Limitations

- **Cross-Device Anonymous Identity**: In anonymous mode, traveler identity relies on the stable client header or demo session. Account linking is planned for future phases.
- **Decay Time Granularity**: Weight decay evaluates dynamically on retrieval based on elapsed days rather than running continuous background cron jobs, minimizing server load.

---

## 23. Final Status

All 23 criteria are met. The implementation is verified, typechecked, and fully functional across the entire stack.

**PHASE 15 STATUS: READY**
