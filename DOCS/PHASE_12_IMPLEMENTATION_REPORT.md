# OFFBEAT — PHASE 12 IMPLEMENTATION REPORT
## FIND AN ALTERNATIVE + GEMINI CONFIGURATION FIX

**Date:** October 7, 2026  
**Status:** READY / VERIFIED  
**Phase:** 12 — Find An Alternative  
**Authoritative Gemini Model:** `gemini-3.8-flash`  

---

## 1. Executive Summary

Phase 12 delivers OFFBEAT's signature hackathon feature: **FIND AN ALTERNATIVE**.

The feature fundamentally rejects the naive premise that an "alternative" simply means replacing a destination. Instead, OFFBEAT understands traveler intent across six multidimensional strategies:
1. `REPLACEMENT` — true substitute matching vibe and terrain
2. `ENHANCEMENT` — a pairing stop that elevates the primary journey (e.g. Keep Tiger Hill, add Batasia Loop)
3. `COMPLEMENTARY` — a cultural/heritage counterpart for journey balance
4. `NEARBY_DISCOVERY` — hyper-local hidden gems in close spatial proximity
5. `TIMING_ALTERNATIVE` — optimal daylight, sunrise, or golden-hour window without replacing the stop
6. `LOWER_CROWD` — low-density tranquil alternatives supported by real crowd curves

Crucially, **Gemini is NOT a candidate generator**. Candidates are deterministically generated and bounded by OFFBEAT data layers (canonical places + Google Maps SerpApi integration) and enriched with Community Intelligence (Phase 8), Confidence (Phase 9), Time Windows (Phase 10), and Crowd Levels (Phase 10). Gemini 3.8 Flash reasons exclusively over a strictly guarded, allowlisted candidate set, with deterministic fallback protecting all responses against API timeouts or demand spikes.

Additionally, this phase successfully executed the **Mandatory Phase 11 Gemini Configuration Fix**, reconciling all environment variables, runtime clients, validation suites, and documentation to a single authoritative model: `gemini-3.8-flash`.

---

## 2. Phase Objective

- Implement end-to-end intelligent alternative discovery for any OFFBEAT place.
- Provide a judge-facing, responsive web UX on the Place Details page with visual spatial vector mapping.
- Reconcile the Gemini configuration disparity identified in Phase 11.
- Enforce strict allowlists to prevent travel hallucination.
- Guarantee deterministic fallback when upstream AI providers encounter rate limits or outages.
- Maintain total abstraction layer integrity and prevent API key exposure to frontend code.

---

## 3. Gemini Configuration Fix

### The Inconsistency
In Phase 11, the primary environment was configured to `gemini-3.8-flash`, while validation scripts contained fallback cascades attempting `gemini-3.5-flash` and `gemini-3.7-flash`. This produced configuration divergence between documented, configured, and runtime models.

### Authoritative Reconciliation
1. **Single Source of Truth**:
   ```env
   GEMINI_MODEL=gemini-3.8-flash
   ```
2. **Runtime Unification**:
   - `Backend/src/integrations/gemini/gemini.config.ts`: Loads strictly from `env.GEMINI_MODEL || "gemini-3.8-flash"`.
   - `Backend/src/integrations/gemini/gemini.client.ts`: Uses `this.config.model` exclusively without hardcoded strings.
   - `Backend/src/integrations/gemini/gemini.service.ts`: Logs and tracks `this.config.model`.
   - `scripts/verify-phase-11.ts`: Removed all silent model fallbacks. Strictly asserts `geminiConfig.model === process.env.GEMINI_MODEL`.
   - `scripts/verify-phase-12.ts`: Asserts authoritative model match.
   - `.env.example`: Updated to declare `GEMINI_MODEL=gemini-3.8-flash`.
   - `DOCS/PHASE_11_IMPLEMENTATION_REPORT.md`: Updated to document `gemini-3.8-flash`.

### Runtime & Fallback Behavior
When `gemini-3.8-flash` encounters HTTP 503 high demand spikes or network timeouts, the system gracefully logs a transient warning, invokes bounded exponential backoff retries, and seamlessly activates the `DETERMINISTIC` fallback pipeline (`source: "DETERMINISTIC"`), ensuring zero user-facing errors.

---

## 4. Architecture

```text
User Action ("FIND AN ALTERNATIVE")
  ↓
GET /api/v1/places/:placeId/alternatives?mode=...
  ↓
AlternativesService (Orchestrator)
  ↓
Deterministic Candidate Generation (Pre-Gemini)
  ├─ Internal Canonical Places (PlacesRepository)
  └─ External Live Places (SerpApi Google Maps Engine)
  ↓
Candidate Filtering & Deduplication
  ├─ Strictly excludes Original Place (by ID, slug, and name variants)
  └─ Normalizes names and removes duplicate entries
  ↓
Deterministic Multi-Signal Enrichment
  ├─ Community Signals (Phase 8: submissions, helpful, verified)
  ├─ Confidence Authority (Phase 9: score, evidenceStrength)
  ├─ Time Intelligence (Phase 10: timeFit, recommended windows)
  └─ Crowd Intelligence (Phase 10: crowdLevel, crowdFit)
  ↓
Deterministic Multi-Mode Scoring (AlternativesScorer)
  ↓
Bounded Top-5 Candidate Allowlist
  ↓
Gemini 3.8 Flash Reasoning (ReasoningProvider)
  ├─ <untrusted_community_content> Injection Boundary
  ├─ Zod Schema Validation (AlternativeReasoningOutput)
  ├─ Candidate Allowlist Verification (Rejects any hallucinated IDs)
  └─ Business Rule Guards
  ↓ (Fallback on timeout / error / 503)
Deterministic Synthesis Fallback
  ↓
Response Contract (AlternativeRecommendationResponse)
  ↓
Frontend UI Experience
  ├─ Original Place Anchor Banner (Context Preserved)
  ├─ 6-Mode Strategy Switcher
  ├─ Spatial Map Relationship Vectors
  └─ Alternative Cards ("WHY OFFBEAT CHOSE THIS")
```

---

## 5. Alternative Modes

| Mode | Semantic Meaning | Must-Visit Behavior | Scorer Priority |
|---|---|---|---|
| `REPLACEMENT` | True substitute matching atmosphere | Discouraged for high-value places; seeks equivalent mountain/cultural alternatives | Category (35%), Taste (25%), Proximity (20%), Confidence (10%), Time (10%) |
| `ENHANCEMENT` | Add a nearby stop elevating the journey | Recommended for must-visits (e.g. Keep Tiger Hill + Batasia Loop) | Proximity (35%), Taste (25%), Time (15%), Community (15%), Confidence (10%) |
| `COMPLEMENTARY` | Distinct cultural or heritage counterpart | Encouraged for journey diversity in the same destination | Proximity (35%), Diversity bonus (25%), Taste (20%), Confidence (10%), Community (10%) |
| `NEARBY_DISCOVERY` | Hidden gems in close spatial radius | Prioritizes proximity and local discovery | Proximity (40%), Community (25%), Taste (20%), Confidence (15%) |
| `TIMING_ALTERNATIVE` | Optimal daylight/sunrise timing window | Focuses on when to visit rather than replacing | Time Fit (45%), Operating Hours (25%), Taste (15%), Confidence (15%) |
| `LOWER_CROWD` | Low-density tranquil alternatives | Avoids peak surge periods; honors crowd curves | Crowd Fit (40%), Proximity (25%), Taste (15%), Confidence (10%), Time (10%) |

---

## 6. Candidate Generation

Implemented in `Backend/src/modules/alternatives/alternatives.generator.ts`:
1. **Internal Canonical Places**: Queries `PlacesRepository` within the destination and wider region matching categories.
2. **External SerpApi**: Uses `SerpApiService.searchPlaces` with engine `google_maps`, querying localized radius terms. Wrapped in resilient try/catch so external provider unavailability never halts internal generation.
3. **Strict Exclusion**: Rejects candidates if `id === originalId`, `slug === originalSlug`, or `normalizedName.includes(normalizedOriginalName)` (e.g. catching "Tiger Hill Sunrise Point").
4. **Deduplication**: Retains highest-fidelity representation by normalized place title.

---

## 7. Similarity & Alternative Scoring

Implemented in `Backend/src/modules/alternatives/alternatives.scorer.ts`:
- Jaccard category similarity against original place.
- Travel & experience taste overlap scoring.
- Geographic proximity using Haversine spherical distance.
- Mode-specific weighting matrices.
- Dynamic generation of truthful "Trade-off" warnings (e.g., extra transit distance or off-peak viewing).
- Generates pairing relationship labels (e.g., `"Pairs naturally with Tiger Hill in Darjeeling"`).

---

## 8. Community Intelligence Integration

- Reuses `CommunityService` (Phase 8).
- Retrieves verified submission count, helpful signal count, and evidence counts.
- Untrusted community submission text is passed to prompts strictly wrapped inside `<untrusted_community_content>` XML fences.
- Zero fabrication: If no community signals exist, community badges are omitted.

---

## 9. Confidence Integration

- Reuses `ConfidenceEngine` (Phase 9) as the sole authority.
- No secondary confidence scoring is invented.
- Passed as `ConfidenceSummaryDto` (`evidenceStrength`, `score`, `status`).

---

## 10. Time Intelligence Integration

- Reuses `TimeService` (Phase 10).
- Calculates `timeFit` (`GOOD`, `PARTIAL`, `CONFLICT`, `UNKNOWN`) based on daylight requirements, opening hours, and traveler's preferred window (`DAY` vs `NIGHT`).
- Hard time conflicts cannot be overridden by AI reasoning.

---

## 11. Crowd Intelligence Integration

- Reuses `CrowdService` (Phase 10).
- Evaluates crowd conditions (`LOW`, `MODERATE`, `HIGH`, `VERY_HIGH`, `UNKNOWN`).
- Maps crowd fit into `GOOD`, `PARTIAL`, `UNKNOWN`.
- Never converts `UNKNOWN` into `LOW`. If evidence is missing, it explicitly reports `UNKNOWN`.

---

## 12. Gemini Reasoning Integration

- Implemented via `ReasoningProvider.reasonAboutAlternative` in `Backend/src/integrations/gemini/gemini.client.ts`.
- Bounded input: Receives top 5 deterministic candidates only.
- Guided prompt instructs Gemini to act as an expert travel strategist explaining the relationship, why the candidate matches traveler taste, and identifying real-world trade-offs.

---

## 13. Allowlist & Hallucination Guard

- Implemented in `Backend/src/integrations/gemini/gemini.guard.ts`.
- `validateAlternativeCandidateAllowlist`: Rejects any candidate ID generated by AI that was not present in the deterministic top-5 allowlist.
- `checkAlternativeBusinessGuards`: Ensures the AI output does not suggest the original place as its own alternative, validates explanation length, and validates mode consistency.
- Any violation triggers an immediate fallback to deterministic synthesis.

---

## 14. Fallback Behavior

- Tested and verified: When Gemini is disabled, times out, throws a 503 error, or returns unparseable JSON, `GeminiService.generateDeterministicAlternativeFallback` generates:
  - Ranked candidates based on deterministic scores.
  - Transparent attribution badge (`OFFBEAT Reasoned` vs `Gemini Reasoned`).
  - Explicit flag `fallback: true`.
  - Truthful explanation synthesized from category, taste, and destination metrics.

---

## 15. Frontend UX

- **Place Details CTA**: Added high-visibility `[ FIND AN ALTERNATIVE ]` card on the Place Details page, plus an inline header button.
- **Original Place Banner**: Prominently anchors "You were considering: [Tiger Hill] (Darjeeling)" with strategy advice explaining why to keep or replace.
- **Mode Selector**: 6 interactive chips with icons, labels, taglines, and active state rings.
- **Visual Spatial Vector Map** (`AlternativesMap.tsx`): Displays radar grid showing the original place beacon (gold) connected by directional dashed discovery vectors to alternative candidate markers (emerald/blue/amber).
- **Alternative Cards** (`AlternativeCard.tsx`):
  - Top recommendation banner ribbon with attribution badge (`Gemini Reasoned` vs `OFFBEAT Reasoned`).
  - **WHY OFFBEAT CHOSE THIS** accented panel.
  - Real-world trade-off callouts.
  - Time fit, crowd fit, confidence, and community verified badges.
  - `[ EXPLORE ]` CTA button navigating to Place Details.
- **State Management**: Dedicated Zustand store `useAlternativesStore` in `Frontend/src/stores/alternativesStore.ts`.

---

## 16. API Contract

### Request
```http
GET /api/v1/places/:placeId/alternatives?mode=ENHANCEMENT&travelTaste=scenic&dayNight=DAY
```

### Response
```json
{
  "success": true,
  "data": {
    "originalPlace": {
      "id": "place_tiger_hill",
      "name": "Tiger Hill",
      "destination": "Darjeeling",
      "category": "Mountain"
    },
    "mode": "ENHANCEMENT",
    "alternatives": [
      {
        "placeId": "place_batasia_loop",
        "name": "Batasia Loop",
        "destination": "Darjeeling",
        "category": "Scenic Rail",
        "source": "INTERNAL",
        "why": "A scenic rail viewpoint that pairs naturally with Tiger Hill...",
        "timeFit": "GOOD",
        "crowdFit": "GOOD",
        "relationshipContext": "Pairs naturally with Tiger Hill in Darjeeling",
        "confidence": { "score": 0.9, "evidenceStrength": "HIGH" },
        "community": { "submissionCount": 3, "verifiedCount": 2 }
      }
    ],
    "reasoning": {
      "source": "GEMINI",
      "explanation": "Batasia Loop offers a compelling complementary stop...",
      "selectedCandidateIds": ["place_batasia_loop"],
      "primaryCandidateId": "place_batasia_loop",
      "mode": "ENHANCEMENT"
    },
    "fallback": false,
    "totalCandidatesEvaluated": 12
  }
}
```

---

## 17. Tests

45 test files and 269 tests passing (100% success rate):
- `Backend/tests/unit/alternatives.generator.test.ts` (3/3 tests)
- `Backend/tests/unit/alternatives.scorer.test.ts` (6/6 tests covering all 6 modes)
- `Backend/tests/unit/alternatives.service.test.ts` (4/4 tests covering pipeline and fallback)
- `Backend/tests/unit/gemini.alternatives.test.ts` (6/6 tests covering Zod schema, allowlist, and prompts)
- `Backend/tests/integration/alternatives.test.ts` (5/5 tests covering HTTP endpoints, 404s, query parameters)

---

## 18. Validation Results

1. `pnpm validate:alternatives` — **PASS (Exit 0)**:
   - 23 architecture files verified.
   - Authoritative model `gemini-3.8-flash` verified.
   - All 6 modes verified.
   - Original place exclusion verified.
   - Deduplication verified.
   - Gemini allowlist verified.
   - Fallback pipeline verified.
   - Signal preservation verified.
   - Untrusted prompt boundaries verified.
   - Zero API key exposure to frontend verified.
2. `pnpm test` — **PASS (45/45 test files, 269/269 tests)**.
3. `pnpm typecheck` — **PASS (Exit 0)** across `packages/shared`, `Backend`, and `Frontend`.
4. `pnpm build` — **PASS (Exit 0)**:
   - Backend compiled (`tsc`).
   - Frontend bundled (`tsc --noEmit && vite build`).

---

## 19. Known Limitations

- **Gemini Public Free-Tier Load**: Google's `gemini-3.8-flash` endpoint intermittently returns HTTP 503 during global demand spikes. The system handles this gracefully via bounded exponential backoff retries and instant deterministic fallback without breaking the user experience.
- **External Geo-Coordinates**: When external candidates from SerpApi lack precise geocodes, the spatial vector map automatically computes a localized polar projection relative to the destination anchor so visualization remains informative.

---

## 20. Final Status

```text
PHASE 12 STATUS: READY

Gemini configuration:
PASS (Authoritative model: gemini-3.8-flash)

Alternative modes:
6/6 (REPLACEMENT, ENHANCEMENT, COMPLEMENTARY, NEARBY_DISCOVERY, TIMING_ALTERNATIVE, LOWER_CROWD)

Backend:
PASS

Frontend:
PASS

Gemini reasoning:
PASS

Fallback:
PASS

Tests:
269 / 269 passed (45 test files)

Typecheck:
PASS (packages/shared, Backend, Frontend)

Build:
PASS (Backend, Frontend)

Validation:
PASS (validate:alternatives Exit 0)
```
