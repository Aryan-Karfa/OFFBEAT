# OFFBEAT — Phase 6 Implementation Report

**Status:** `READY`  
**Phase:** 6 (SerpApi Integration)  
**Date:** 2026-09-30  
**Version:** 1.0.0

---

## 1. Phase 6 Objective

Phase 6 connects OFFBEAT to real-world travel, location, and place data through **SerpApi** while strictly enforcing the architectural rule:

```text
SerpApi Schema ≠ OFFBEAT Schema
```

The integration acts as an external information layer for Phase 7 (Discovery Engine) without leaking provider-specific response structures into controllers, frontend bundles, or internal domain models.

---

## 2. SerpApi Architecture

The data pipeline guarantees complete isolation:

```text
                           OFFBEAT Domain / Service
                                      │
                                      ▼
                             SerpApiQueryBuilder
                        (Sanitization & Normalization)
                                      │
                                      ▼
                               SerpApiCache
                 (Deterministic Hashing & Single-Flight Coalescing)
                                      │
                          ┌───────────┴───────────┐
                       Hit│                       │Miss
                          ▼                       ▼
                   Normalized Data          SerpApiClient
                                        (Timeout, Retry, Backoff)
                                                  │
                                                  ▼
                                            SerpApi HTTP
                                      (https://serpapi.com/search)
                                                  │
                                                  ▼
                                            Raw Response
                                                  │
                                                  ▼
                                               Adapters
                                   (Search, Place, Reviews)
                                                  │
                                                  ▼
                                          SerpApiNormalizer
                                 (Coordinates, Categories, Nulls)
                                                  │
                                  ┌───────────────┴───────────────┐
                                  ▼                               ▼
                       NormalizedExternalPlace             SearchCache
                                  │                        (Persisted)
                                  ▼
                       ExternalPlaceReference
                             (Persisted)
```

Provider schemas and raw payloads are fully contained within [Backend/src/integrations/serpapi/](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/).

---

## 3. Query Builder

Implemented in [serpapi.query-builder.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.query-builder.ts):

- Translates high-level OFFBEAT context (`country`, `region`, `destination`, `travelTaste`, `experienceTaste`, `dayNight`, `placeType`, `coordinates`) into sanitized, deterministic Google Maps search queries.
- Normalizes terms: trims whitespace, removes duplicate tokens, cleans injection characters, and normalizes casing while preserving proper geographic names.
- Geographic context: formats coordinates into Google Maps `ll` search bias parameter (`@lat,lng,zoomz`) when available.
- Builds dedicated parameter sets for place details lookups (`place_id` / `data_id`) and place review lookups (`data_id` / `place_id`, `next_page_token`).

---

## 4. Supported SerpApi Engines

1. `google_maps` (`type=search`):
   - Local results extraction with query and optional `ll` coordinate bias.
2. `google_maps` (Place Details):
   - Structured place results lookup via `place_id` or `data_id`.
3. `google_maps_reviews`:
   - Paginated review extraction via `data_id` or `place_id` with `next_page_token`.

---

## 5. Adapters

Implemented in [serpapi.adapter.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.adapter.ts):

- **`GoogleMapsSearchAdapter`**: Extracts items from `local_results[]`, handling missing, empty, or partial arrays safely without throwing runtime errors.
- **`GoogleMapsPlaceAdapter`**: Extracts structured place details from `place_results`.
- **`GoogleMapsReviewsAdapter`**: Extracts review entries, place header information (`place_info`), and pagination token (`next_page_token`).

---

## 6. Normalization & Internal Contracts

Implemented in [serpapi.normalizer.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.normalizer.ts) and shared via `@offbeat/shared` in [packages/shared/src/index.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/packages/shared/src/index.ts):

### `NormalizedExternalPlace`

- `provider`: `"SERPAPI"`
- `externalId`: Canonical provider identifier (`place_id` or `data_id`)
- `placeId`: Internal linked place ID (if resolved)
- `name`: Clean place title
- `description`, `address`, `phone`, `website`, `thumbnailUrl`, `sourceUrl`
- `latitude`, `longitude`: Extracted from `gps_coordinates`
- `rating`: Float or `null` (never fake zeroes for missing ratings)
- `reviewCount`: Integer or `null`
- `categories`: Normalized list mapping aliases (e.g., "scenic viewpoint" -> "Photography", "historic site" -> "Historical", "mountain peak" -> "Mountain")
- `openingHours`: Structured array of string entries
- `rawMetadata`: Provider-specific metadata (`price`, `openState`, `dataId`, `rawTypes`)

### `NormalizedExternalReview` & `NormalizedExternalReviewsResult`

- Structured review list with author name, rating, text snippet, and publish timestamp.

---

## 7. ExternalPlaceReference

Implemented in [prisma/schema.prisma](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/prisma/schema.prisma) and synced via `SerpApiService.syncExternalPlaceReference`:

- Keeps internal `Place` independent of third-party IDs.
- Schema:
  - `id`: UUID primary key
  - `placeId`: Optional foreign key referencing `places(id)` with `onDelete: Cascade`
  - `provider`: Default `"SERPAPI"`
  - `externalId`: Provider identifier
  - `sourceUrl`: External link
  - `metadata`: Json storage for provider attributes
  - `lastSyncedAt`: Timestamp of latest sync
- Unique constraint on `[provider, externalId]` prevents duplicate provider bindings.
- Deterministic reconciliation matches existing internal places by name/slug without destructive overwrites.

---

## 8. SearchCache

Implemented in [prisma/schema.prisma](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/prisma/schema.prisma) and managed by [serpapi.cache.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.cache.ts):

- **Deterministic Key Hashing:** Serializes request parameters with recursively sorted keys and computes a SHA-256 hex digest.
- **Configurable TTLs:**
  - `placeMetadata`: 7 days (long)
  - `gpsCoordinates`: 7 days (long)
  - `categories`: 7 days (long)
  - `searchResults`: 24 hours (medium)
  - `reviews`: 24 hours (medium)
  - `openingHours`: 6 hours (short/medium)
  - `currentOpenState`: 15 minutes (very short)
- **Single-Flight Request Deduplication:** In-memory request coalescing map (`inFlightRequests`) ensures concurrent identical searches share a single outgoing HTTP call.
- **Dual-Layer Caching:** Fast in-memory caching combined with PostgreSQL `SearchCache` table persistence.

---

## 9. Retry & Timeout Strategy

Implemented in [serpapi.client.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.client.ts):

- **Timeout:** Configurable default of 8,000ms using native `AbortController`.
- **Bounded Retries:** Maximum 2 retries (total 3 attempts) for transient failures (network errors, timeouts, 5xx).
- **Exponential Backoff:** `backoff = baseMs * 2^attempt + jitter`.
- **Non-Retryable Bailout:** Immediately halts without retry on 401/403 (unauthorized/invalid key), 429 (rate limited), or 4xx client errors.

---

## 10. Error Handling & Classification

Implemented in [serpapi.errors.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.errors.ts):

- `SerpApiConfigurationError` (HTTP 500 / INTERNAL_ERROR): Missing or blank API key.
- `SerpApiAuthenticationError` (HTTP 502 / INTERNAL_ERROR): Invalid or unauthorized key.
- `SerpApiRateLimitError` (HTTP 429 / RATE_LIMITED): Quota exceeded.
- `SerpApiTimeoutError` (HTTP 504 / TIMEOUT): Request aborted.
- `SerpApiNetworkError` (HTTP 502 / BAD_GATEWAY): DNS / connection dropped.
- `SerpApiInvalidResponseError` (HTTP 502 / BAD_GATEWAY): Malformed JSON.
- `SerpApiProviderError` (HTTP 502 / BAD_GATEWAY): External provider error response.

All errors inherit from `AppError` and never leak API keys, sensitive tokens, or internal stack traces to callers.

---

## 11. Graceful Degradation

If SerpApi is unavailable or rate-limited:

1. Valid cached responses are served immediately.
2. If the provider call fails, `SerpApiService` checks `SerpApiCache.getStale()` to return stale cached results as a fallback before throwing.
3. Errors are captured and typed, ensuring the server process remains completely stable.

---

## 12. Tests & Validation

**All 22 test files and 113 tests passed cleanly (`pnpm test`):**

1. **Unit Tests:**
   - [serpapi.query-builder.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.query-builder.test.ts) (7 tests): query formatting, term deduplication, coordinate normalization, place details, reviews.
   - [serpapi.normalizer.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.normalizer.test.ts) (10 tests): local result normalization, null preservation, category mapping, search adapter, place adapter, reviews adapter.
   - [serpapi.cache.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.cache.test.ts) (7 tests): deterministic key generation across key orderings, category TTL lookup, in-memory caching, stale fallback, single-flight request deduplication.
   - [serpapi.client.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.client.test.ts) (7 tests): configuration error on missing key, successful 200 execution, 401 auth bailout without retry, 429 rate limit bailout, error payload parsing, 5xx retries with backoff.
   - [serpapi.errors.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.errors.test.ts) (8 tests): error inheritance, status codes, and error classifications.
2. **Integration Tests:**
   - [serpapi.integration.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/integration/serpapi.integration.test.ts) (10 tests): end-to-end search, cache hit verification, empty result handling, single-flight deduplication, place details, reviews with pagination, external reference sync, repeat sync update, stale fallback during outage, error propagation.
3. **Regression Integrity:**
   - All Phase 4 & Phase 5 tests (geography, places, users, health, errors, validation) continue passing with 100% success.

---

## 13. Live Verification

Created automated verification script at [scripts/verify-phase-6.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/scripts/verify-phase-6.ts), runnable via `pnpm validate:serpapi`:

- Verifies query builder construction with coordinates.
- Confirms SHA-256 cache key determinism.
- Validates place normalization and category aliasing.
- Verifies cache hit behavior (2 searches executed with exactly 1 provider call).
- Verifies `ExternalPlaceReference` synchronization.
- Inspects environment for live `SERPAPI_API_KEY`:
  - If present, executes real test search against Google Maps on SerpApi.
  - If absent, verifies offline/mocked pipeline with full test coverage.

---

## 14. Files Changed

### Added

- [Backend/src/integrations/serpapi/serpapi.config.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.config.ts)
- [Backend/src/integrations/serpapi/serpapi.types.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.types.ts)
- [Backend/src/integrations/serpapi/serpapi.errors.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.errors.ts)
- [Backend/src/integrations/serpapi/serpapi.query-builder.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.query-builder.ts)
- [Backend/src/integrations/serpapi/serpapi.normalizer.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.normalizer.ts)
- [Backend/src/integrations/serpapi/serpapi.adapter.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.adapter.ts)
- [Backend/src/integrations/serpapi/serpapi.cache.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.cache.ts)
- [Backend/src/integrations/serpapi/serpapi.client.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.client.ts)
- [Backend/src/integrations/serpapi/serpapi.service.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/serpapi.service.ts)
- [Backend/src/integrations/serpapi/index.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/src/integrations/serpapi/index.ts)
- [Backend/tests/unit/serpapi.query-builder.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.query-builder.test.ts)
- [Backend/tests/unit/serpapi.normalizer.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.normalizer.test.ts)
- [Backend/tests/unit/serpapi.cache.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.cache.test.ts)
- [Backend/tests/unit/serpapi.client.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.client.test.ts)
- [Backend/tests/unit/serpapi.errors.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/unit/serpapi.errors.test.ts)
- [Backend/tests/integration/serpapi.integration.test.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/Backend/tests/integration/serpapi.integration.test.ts)
- [scripts/verify-phase-6.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/scripts/verify-phase-6.ts)
- [prisma/migrations/20260930000000_serpapi_integration/migration.sql](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/prisma/migrations/20260930000000_serpapi_integration/migration.sql)

### Modified

- [prisma/schema.prisma](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/prisma/schema.prisma) (added `ExternalPlaceReference` and `SearchCache` models, linked to `Place`)
- [packages/shared/src/index.ts](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/packages/shared/src/index.ts) (added `NormalizedExternalPlace`, `NormalizedExternalReview`, `NormalizedExternalReviewsResult`, `ExternalPlaceReferenceDto`, `SearchQueryContext`)
- [package.json](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/package.json) (added `validate:serpapi` task to `check` pipeline)

---

## 15. Known Limitations

- **Phase Boundary Discipline:** In strict accordance with Phase 6 instructions, no public discovery endpoint (e.g., `POST /discover`) or recommendation scoring logic was introduced. This integration layer is fully isolated and prepared to be consumed by Phase 7 (Discovery Engine).
- **Semantic Entity Matching:** External place reference synchronization matches existing internal places using exact normalized slug or case-insensitive name. Fuzzy or LLM-assisted entity matching is reserved for later intelligence phases.

---

## 16. Final Status

**Status:** `READY`

OFFBEAT can now safely query real-world travel and place information through SerpApi, transform external responses into canonical OFFBEAT structures, maintain persistent external place relationships, eliminate duplicate calls via deterministic caching and single-flight request coalescing, and survive provider outages via graceful degradation — without any provider-specific schema leaking to the frontend.
