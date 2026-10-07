# OFFBEAT — PHASE 14 IMPLEMENTATION REPORT

## TAKE HOME (LOCAL SPECIALTIES & ARTISANAL DISCOVERY)

**Date:** October 7, 2026  
**Status:** READY / VERIFIED  
**Phase:** 14 — Take Home  
**Authoritative Gemini Model:** `gemini-3.8-flash`

---

## 1. Executive Summary

Phase 14 completes the overarching product philosophy of the OFFBEAT travel discovery platform:

```text
DISCOVER (Phases 1–7)
  ↓
EXPERIENCE (Phases 8–10, 12, 13)
  ↓
TAKE HOME (Phase 14)
```

The objective is to answer the traveler's question:

> _"What should I take home from this place?"_

OFFBEAT does **not** become an e-commerce marketplace: there is no shopping cart, no checkout, no payment gateway, no seller onboarding, and no marketplace logistics. Instead, TAKE HOME is a pure discovery, curation, and intelligence experience focused on:

- Local specialties with protected or distinct Geographical Indication (e.g. Darjeeling first flush tea)
- Indigenous handicrafts, Buddhist carvings, and tribal weaves
- Regional culinary products and traditional confectioneries
- Memorable gifts and practical local mountain finds
- Community-endorsed artisans and cooperatives

**Truthfulness First**:

- Deterministic systems establish the factual ground truth.
- Gemini never invents products, shops, prices, availability, or authenticity claims.
- If a price is unknown, it remains truthfully unknown rather than hallucinated.
- All real-world discovery locations originate from curated internal knowledge or verified Google Maps via SerpApi.

---

## 2. Phase Objective

The core objective of Phase 14 is delivering the complete judge-facing journey:

```text
INDIA
  ↓
WEST BENGAL
  ↓
DARJEELING
  ↓
DISCOVER (Tiger Hill / Batasia Loop)
  ↓
BUILD MY DAY (Itinerary Engine)
  ↓
BEFORE YOU LEAVE — TAKE HOME
  ↓
"What is this place known for?"
  ↓
Categories & Filters (Tea, Crafts, Textiles, Food, Gifts)
  ↓
Local Finds (Darjeeling First Flush Tea, Tibetan Crafts, Churpi)
  ↓
Why It Is Worth Taking Home (Provenance & GI status)
  ↓
Where to Find It (Nathmulls, Happy Valley, Tibetan Refugee Centre)
  ↓
Community & Confidence Signals (High Confidence, Verified Endorsements)
  ↓
Find an Alternative (Phase 12 Integration)
```

The traveler feels:

> _"OFFBEAT doesn't just tell me where to go. It also tells me what is actually worth bringing home."_

---

## 3. TAKE HOME Philosophy

A TAKE HOME recommendation answers five fundamental questions:

1. **WHAT?** Genuinely local specialty (not mass-produced souvenir trinkets).
2. **WHY?** Cultural, agricultural, or artisan link to the destination.
3. **WHERE?** Verified estate, cooperative, or generational market stall.
4. **FOR WHOM?** Practical context (For Myself, Gift, Family, Friends, Collector).
5. **HOW CONFIDENT ARE WE?** Strict confidence score and community corroboration.

Unsupported claims such as _"Best tea in Darjeeling"_ are avoided in favor of evidence-backed claims like _"A globally recognized Himalayan specialty with unique Geographical Indication (GI) status."_

---

## 4. Architecture

The pipeline follows OFFBEAT's deterministic-first intelligence pattern:

```text
User / Place / Destination
         ↓
Take Home Request
         ↓
Candidate Collection ([take-home.candidate-collector.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/take-home/take-home.candidate-collector.ts))
         ↓
Normalization & Deduplication
         ↓
Local Relevance Scoring ([take-home.scorer.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/take-home/take-home.scorer.ts))
         ↓
Community + Confidence Enrichment (Phases 8 & 9)
         ↓
Where-to-Find Resolution (Internal + SerpApi Google Maps)
         ↓
Gemini 3.8 Flash Reasoning ([gemini.service.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/gemini/gemini.service.ts))
         ↓
Structured Zod Validation ([gemini.schemas.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/gemini/gemini.schemas.ts))
         ↓
Candidate & Source Allowlist Guard ([gemini.guard.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/gemini/gemini.guard.ts))
         ↓
Deterministic Fallback Guard (Timeout / Outage / Guard Violation)
         ↓
TAKE HOME UI ([TakeHomePage.tsx](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/pages/TakeHome/TakeHomePage.tsx))
```

---

## 5. Data Model

Shared contracts defined in [`packages/shared/src/index.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/packages/shared/src/index.ts):

```typescript
export interface TakeHomeItemDto {
  id: string;
  name: string;
  category: TakeHomeCategory;
  categories?: TakeHomeCategory[];
  destinationId?: string;
  destinationName?: string;
  regionId?: string;
  description?: string;
  whyTakeHome: string;
  localRelevance: TakeHomeLocalRelevance;
  goodFor: TakeHomeGoodFor[];
  budget?: TakeHomeBudget;
  source: "INTERNAL" | "COMMUNITY" | "SERPAPI" | "COMBINED";
  confidence?: {
    score?: number;
    evidenceStrength?: EvidenceStrength;
    status?: string;
  };
  community?: {
    submissionCount?: number;
    helpfulCount?: number;
    verifiedCount?: number;
    status?: string;
    supportCount?: number;
    quote?: string;
  };
  placesToFind: TakeHomeSourceDto[];
  alternatives?: TakeHomeAlternativeDto[];
  imageUrl?: string;
  sourceUrl?: string;
  score?: number;
}
```

---

## 6. Categories

Structured taxonomy of 12 categories:

- `TEA_COFFEE` — High-altitude single-estate teas and local roasts
- `FOOD` — Regional agricultural products, preserved cheeses, coastal cashews
- `SPICES` — Highland green cardamom, Malabar black pepper, wild herbs
- `SWEETS` — Regional confections (Nolen Gur Sandesh, Rosogolla)
- `HANDICRAFT` — Traditional woodcarvings, conch shell crafts, brass castings
- `TEXTILE` — Handloom Tant & Baluchari silk, Changthangi Pashmina, Marwar Bandhani
- `ART` — Kalighat Patachitra folk paintings, Buddhist thangkas
- `CULTURAL_GOOD` — Sacred and ritual craft items
- `BEAUTY_WELLNESS` — Wild seabuckthorn nectar and herbal essentials
- `LOCAL_PRODUCT` — Regional utility goods
- `GIFT` — Curated gift sets
- `OTHER` — Specialized regional finds

---

## 7. Candidate Generation

[`TakeHomeCandidateCollector`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/take-home/take-home.candidate-collector.ts):

- Resolves destinations flexibly by canonical ID (`dest_darjeeling`), URL slug (`darjeeling`), or city name (`Darjeeling`).
- Resolves contextual destination when a place ID (`place_tiger_hill`) is the entry point.
- Loads grounded canonical seed definitions ([`take-home.seed-data.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/take-home/take-home.seed-data.ts)) covering Darjeeling, Kolkata, Digha, Jodhpur, Munnar, and Nubra Valley.
- Enriches candidates with live community submissions from Phase 8.

---

## 8. Local Relevance Scoring

Deterministic multi-signal scoring in [`TakeHomeScorer`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/modules/take-home/take-home.scorer.ts):

| Signal                    | Weight  | Logic                                                                                                |
| :------------------------ | :------ | :--------------------------------------------------------------------------------------------------- |
| **Local Relevance**       | **30%** | `SIGNATURE` (1.0), `STRONGLY_ASSOCIATED` (0.85), `LOCAL` (0.70), `REGIONAL` (0.55), `UNKNOWN` (0.35) |
| **Community Support**     | **20%** | Verified status (0.9–0.95) + traveler support bonus (min(support * 0.04, 0.15))                      |
| **Confidence**            | **15%** | Authoritative confidence score from Phase 9                                                          |
| **Destination Relation**  | **15%** | Exact destination match (1.0) vs regional match (0.6)                                                |
| **Taste / Context Match** | **10%** | Affinity matching user travel/experience taste (Food -> Tea/Sweets; Culture -> Crafts/Weaves)        |
| **Source Completeness**   | **10%** | 2+ places to find (1.0), 1 place (0.75), 0 places (0.30)                                             |

---

## 9. Community Integration

Reuses Phase 8 Community Intelligence directly:

- Queries `communityService.listSubmissions` for submission types `LOCAL_SPECIALTY`, `TAKE_HOME`, `LOCAL_BUSINESS`, `RESTAURANT`, and `TRAVEL_TIP`.
- Corroborates canonical items with real traveler notes, photos, and confirmation counts.
- Displays community endorsement badges and quote snippets truthfully.

---

## 10. Confidence Integration

Reuses Phase 9 Confidence & Verification Engine directly:

- `EvidenceStrength` (`HIGH`, `MODERATE`, `EMERGING`, `CONTESTED`).
- Verification status (`COMMUNITY_VERIFIED`, `COMMUNITY_SUPPORTED`, `OFFICIAL_CURATED`).
- Never fabricates percentage metrics.

---

## 11. SerpApi Integration

Reuses Phase 6 SerpApi integration:

- Engine: `google_maps` via [`SerpApiService.searchPlaces`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.service.ts).
- Sanitized targeted queries: e.g. `"Darjeeling First Flush Tea shop store"`.
- Single-flight request coalescing and 24-hour TTL caching via `SerpApiCache`.
- Bounded calls (maximum 2 distinct external searches per candidate generation run).

---

## 12. Where-to-Find Resolution

Every Take Home item resolves to concrete real-world discovery locations:

- Canonical boutiques (e.g. _Nathmulls Tea Boutique_, _Happy Valley Tea Estate Outlet_, _Tibetan Refugee Self-Help Centre_).
- Normalized Google Maps entries with address, coordinates, star ratings, and review counts.
- Never invents an address or business.

---

## 13. Gemini Reasoning

Gemini 3.8 Flash acts as an analytical curator:

- Input: approved destination context, user tastes, approved item candidates, and approved where-to-find locations.
- Task: Rank approved candidates, generate personalized rationale explaining cultural significance, and identify the primary signature specialty.
- Explicit constraints: Never invent items, shops, prices, or origin stories.

---

## 14. Allowlist / Guards

Rigorous two-phase guardrail enforcement in [`gemini.guard.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/gemini/gemini.guard.ts):

1. **Item & Source Allowlist Guard**:
   Every `selectedItemId`, `primaryItemId`, and `suggestedSourceId` must exist in the deterministically approved candidate set.
2. **Business Truthfulness Guards**:
   - Fabricated prices (e.g. ₹500, $10) are blocked.
   - Unsupported authenticity guarantees (e.g. "100% authentic", "guaranteed authentic") are blocked.
   - Duplicate item IDs are blocked.

Any guard violation immediately drops AI output and activates deterministic fallback.

---

## 15. Deterministic Fallback

Automatic graceful fallback in [`GeminiService.generateDeterministicTakeHomeFallback`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/gemini/gemini.service.ts):

- Activates on Gemini timeout, 429, 503, invalid JSON, or guard rejection.
- Returns `source: "DETERMINISTIC"`, `fallback: true`.
- Generates truthful grounded explanations based on local relevance tier and Geographical Indication facts.

---

## 16. Frontend UX

Implemented with rich modern aesthetics:

- **Hero**: [`TakeHomeHero.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/take-home/TakeHomeHero.tsx) with dark gradient styling, destination switcher, and intelligence source indicators.
- **Category & Gift Filter Strip**: [`TakeHomeCategoryStrip.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/take-home/TakeHomeCategoryStrip.tsx) featuring mobile-friendly horizontal scrolling pills and gift target buttons.
- **Card Grid**: [`TakeHomeItemCard.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/take-home/TakeHomeItemCard.tsx) with glowing relevance badges, "Why Take This Home" callout boxes, and good-for tags.
- **Why OFFBEAT Recommends This**: [`TakeHomeWhyPanel.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/take-home/TakeHomeWhyPanel.tsx) explainability card.
- **Where to Find Modal**: [`WhereToFindModal.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/take-home/WhereToFindModal.tsx) displaying verified real-world shops with external map links.
- **State Management**: [`useTakeHomeStore`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/stores/takeHomeStore.ts).

---

## 17. Map Integration

- Where to find locations display real geographic coordinates.
- Each verified store entry includes an external map action button linking directly to Google Maps navigation at the exact latitude/longitude.

---

## 18. Itinerary Integration

Integrated into Phase 13 Itinerary timeline:

- At the conclusion of the daily itinerary in [`ItineraryPage.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/pages/Itinerary/ItineraryPage.tsx), a dedicated **"BEFORE YOU LEAVE — TAKE HOME FROM DARJEELING"** callout links directly to the Take Home discovery page.
- Establishes the complete product loop: `Discover → Experience → Itinerary → Take Home`.

---

## 19. Alternatives

Reuses Phase 12 Alternative architecture:

- Every Take Home item can provide alternative local options (e.g., Darjeeling First Flush Tea -> Tibetan Handcrafted Curios or Himalayan Yak Churpi).
- Interactive modal in [`TakeHomeAlternativesModal.tsx`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Frontend/src/features/take-home/TakeHomeAlternativesModal.tsx).

---

## 20. API Contract

### Primary Endpoint

```http
GET /api/v1/take-home/:destinationId
```

**Query Parameters:**

- `category`: TakeHomeCategory (optional)
- `travelTaste`: string[] (optional)
- `experienceTaste`: string[] (optional)
- `giftFor`: TakeHomeGoodFor (optional)
- `budget`: TakeHomeBudget (optional)
- `verifiedOnly`: boolean (optional)

### Contextual Place Endpoint

```http
GET /api/v1/places/:placeId/take-home
```

Resolves place's parent destination and returns contextual take-home items.

---

## 21. Tests

All 55 test files and **319/319 unit & integration tests** pass:

- [`take-home.scorer.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/take-home.scorer.test.ts) (5 tests): relevance tiers, community bonuses, taste matching, gift filtering.
- [`take-home.candidate-collector.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/take-home.candidate-collector.test.ts) (4 tests): destination resolution, place-level entry, community enrichment, SerpApi normalization.
- [`gemini.take-home.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/gemini.take-home.test.ts) (6 tests): Zod schema validation, allowlist enforcement, price/authenticity guard blocks, fallback.
- [`take-home.service.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/take-home.service.test.ts) (4 tests): orchestration, place endpoint, empty candidate guard, exception fallback.
- [`take-home.test.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/integration/take-home.test.ts) (6 tests): 200 responses, category filters, gift filters, verifiedOnly filter, contextual place endpoint, empty state.

---

## 22. Validation

Automated validation script [`scripts/verify-phase-14.ts`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/scripts/verify-phase-14.ts):

- Executable via `pnpm validate:take-home`.
- Validates all 19 criteria including modules, shared contracts, routes, deterministic scoring, community & confidence integration, SerpApi normalization, allowlist guards, truthfulness guards, itinerary integration, and zero key leaks.

---

## 23. Known Limitations

- **No Online Checkout**: By design, OFFBEAT does not process credit cards, cart orders, or parcel shipping. Users are directed to verified brick-and-mortar stores, estates, and artisan workshops.
- **Physical Availability**: Seasonal flush teas (such as First Flush in March/April) may have seasonal estate batch variance.

---

## 24. Final Status

```text
PHASE 14 STATUS: READY

TAKE HOME API:
PASS

Destination retrieval:
PASS

Place retrieval:
PASS

Category system:
PASS

Deterministic scoring:
PASS

Community:
PASS

Confidence:
PASS

SerpApi:
PASS

Where-to-find:
PASS

Gemini:
PASS

Allowlist / guards:
PASS

Fallback:
PASS

Itinerary integration:
PASS

Frontend:
PASS

Map:
PASS

Tests:
319 / 319 passed

Typecheck:
PASS

Build:
PASS

Validation:
PASS
```
