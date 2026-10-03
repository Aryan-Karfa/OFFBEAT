# OFFBEAT — PHASE 8 IMPLEMENTATION REPORT

## Community Intelligence — Hackathon Fast-Track

**Milestone:** Phase 8 — Community Intelligence  
**Status:** READY & VERIFIED  
**Date:** October 2026  
**Workspace:** OFFBEAT Monorepo (`Backend`, `Frontend`, `packages/shared`, `prisma`)

---

### 1. Objective

Phase 8 elevates OFFBEAT beyond the basic question of _"What places exist?"_ to address the fundamental human inquiry:

> **"What have travelers discovered that could make this experience better?"**

By establishing a first-class **Community Knowledge Layer**, OFFBEAT empowers travelers to contribute observations, local tips, hidden viewpoints, crowd timing insights, and photography angles. These contributions are persisted, supported, reported, and woven directly into discovery results and place detail views.

The Phase 8 human contribution loop is fully operational:

```text
TRAVELER
   ↓
DISCOVERY
   ↓
CONTRIBUTION
   ↓
OFFBEAT KNOWLEDGE
   ↓
FUTURE DISCOVERY
```

---

### 2. Strict Phase Boundaries & Non-Goals

In accordance with the hackathon fast-track prompt and architectural discipline:

- **IN-SCOPE (Phase 8):**
  - Real database persistence for `CommunitySubmission`, `SubmissionEvidence`, `SubmissionSupport`, `SubmissionReport`.
  - Unique support constraints to prevent duplicate voting.
  - Deterministic duplicate submission protection.
  - Complete REST APIs for submissions, listing with filters/pagination, support, and reporting.
  - Rich contribution modal supporting place-context and stand-alone sharing.
  - Direct integration into Discovery Cards (signals & highlights) and Place Details.
  - Source distinction: `OFFBEAT CANONICAL`, `SERPAPI`, `OFFBEAT COMMUNITY`.
  - Human wording: _"12 travelers found this useful"_, _"5 travelers confirmed this"_.
  - Full automated unit, integration, and end-to-end regression test suites.
- **DEFERRED (Phase 9+):**
  - ❌ No Verification Engine or automated trust scoring.
  - ❌ No Confidence Engine or mathematical confidence metrics (e.g. `Trust: 92%` or `Verified: true` are strictly forbidden).
  - ❌ No Gemini interpretation or LLM-based hallucinated reviews.
  - ❌ No advanced time or crowd intelligence algorithms.
  - ❌ No heavy moderation dashboards or complex social networks.

---

### 3. Community Domain Model & Database Schema

The domain model implemented in `prisma/schema.prisma` adheres directly to the OFFBEAT Database Design (DBD):

```prisma
model CommunitySubmission {
  id            String             @id @default(uuid())
  userId        String
  placeId       String?
  destinationId String?
  type          SubmissionType
  title         String
  content       String
  status        SubmissionStatus   @default(PENDING)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  user          User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  place         Place?             @relation(fields: [placeId], references: [id], onDelete: SetNull)
  destination   Destination?       @relation(fields: [destinationId], references: [id], onDelete: SetNull)
  evidence      SubmissionEvidence[]
  supports      SubmissionSupport[]
  reports       SubmissionReport[]

  @@index([placeId])
  @@index([destinationId])
  @@index([userId])
  @@index([type])
  @@index([status])
}

model SubmissionEvidence {
  id                String             @id @default(uuid())
  submissionId      String
  type              EvidenceType
  source            String?
  content           String?
  mediaUrl          String?
  externalReference String?
  metadata          Json?
  createdAt         DateTime           @default(now())

  submission        CommunitySubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  @@index([submissionId])
}

model SubmissionSupport {
  id           String              @id @default(uuid())
  submissionId String
  userId       String
  type         SupportType         @default(USEFUL)
  createdAt    DateTime            @default(now())

  submission   CommunitySubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([submissionId, userId, type])
  @@index([submissionId])
  @@index([userId])
}

model SubmissionReport {
  id           String              @id @default(uuid())
  submissionId String
  userId       String
  reason       ReportReason
  description  String?
  status       ReportStatus        @default(PENDING)
  createdAt    DateTime            @default(now())
  resolvedAt   DateTime?

  submission   CommunitySubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([submissionId])
  @@index([userId])
  @@index([status])
}
```

#### Taxonomy & Enums

- **`SubmissionType`:** `HIDDEN_PLACE`, `LOCAL_BUSINESS`, `RESTAURANT`, `PHOTO_SPOT`, `BEST_TIME`, `CROWD_TIP`, `TRAVEL_TIP`, `LOCAL_SPECIALTY`, `TAKE_HOME`, `EXPERIENCE`, `ALTERNATIVE`, `OTHER`
- **`SubmissionStatus`:** `PENDING`, `SUPPORTED`, `VERIFIED`, `REJECTED`
- **`EvidenceType`:** `PHOTO`, `TEXT`, `EXTERNAL_REFERENCE`
- **`SupportType`:** `AGREE`, `USEFUL`, `CONFIRM`
- **`ReportReason`:** `INCORRECT`, `OUTDATED`, `DUPLICATE`, `SPAM`, `MISLEADING`, `INAPPROPRIATE`, `OTHER`
- **`ReportStatus`:** `PENDING`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`

---

### 4. Architecture & Module Structure

The backend community module is isolated within `Backend/src/modules/community/`:

```text
Backend/src/modules/community/
├── community.controller.ts    # Request envelope, params/body extraction, status codes
├── community.service.ts       # Business rules, deduplication, support logic, DTO mapping
├── community.repository.ts    # Prisma access, in-memory seed fallback, bounded queries
├── community.schema.ts        # Zod validation schemas for all requests and filters
├── community.types.ts         # Internal types & DTO definitions
├── community.routes.ts        # Express router mounted at /api/v1/community
└── index.ts                   # Clean module exports
```

#### Architectural Separation of Concerns

1. **Controller**: Strictly extracts context, invokes service methods, and returns `@offbeat/shared` envelopes (`sendSuccess`). Never touches Prisma.
2. **Service**: Enforces duplicate submission prevention, support conflict checks (throws `ConflictError` on repeated votes), aggregates community signals without N+1 queries, and derives human highlights.
3. **Repository**: Handles database queries, foreign key joins, and seeded in-memory fallback when running in offline or test mode.

---

### 5. API Endpoints & Contracts

All endpoints are prefixed with `/api/v1/community`.

#### 1. Create Submission

- **Method:** `POST /api/v1/community/submissions`
- **Auth:** Authenticated or demo-safe authorized user context.
- **Request Body:**
  ```json
  {
    "placeId": "place_tiger_hill",
    "destinationId": "dest_darjeeling",
    "type": "PHOTO_SPOT",
    "title": "Quieter ridge viewpoint beyond main pavilion",
    "content": "Walk 5 minutes along the left-side unpaved ridge trail away from the main observation tower for completely unobstructed Kanchenjunga sunrise frames.",
    "evidence": [
      {
        "type": "PHOTO",
        "mediaUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa"
      }
    ]
  }
  ```
- **Response:** `201 Created` with full `CommunitySubmissionDto`.

#### 2. List Submissions

- **Method:** `GET /api/v1/community/submissions`
- **Query Parameters:** `placeId`, `destinationId`, `type`, `status`, `page`, `limit`
- **Response:** Paginated list with aggregates:
  ```json
  {
    "items": [...],
    "pagination": { "page": 1, "limit": 10, "total": 3, "totalPages": 1, "hasMore": false }
  }
  ```

#### 3. Submission Detail

- **Method:** `GET /api/v1/community/submissions/:submissionId`
- **Response:** Detailed submission including author, place metadata, attached evidence, and support summary.

#### 4. Support Submission

- **Method:** `POST /api/v1/community/submissions/:submissionId/support`
- **Request Body:** `{ "type": "USEFUL" }` (`AGREE`, `USEFUL`, or `CONFIRM`)
- **Response:** `201 Created` on new support; `409 Conflict` if the user has already supported this submission with this type.

#### 5. Report Submission

- **Method:** `POST /api/v1/community/submissions/:submissionId/report`
- **Request Body:** `{ "reason": "OUTDATED", "description": "The trail is temporarily closed." }`
- **Response:** `201 Created`.

---

### 6. Integration With Places and Discovery

Community knowledge is not an isolated silo; it enriches both Place Details and the Discovery Engine:

1. **Place Details (`GET /api/v1/places/:id`)**:
   - `places.service.ts` queries `communityService.getPlaceCommunitySignals(place.id)`.
   - Attaches `community: { submissionCount, supportCount, confirmCount, usefulCount, highlights }` to `PlaceDetailDto`.
2. **Discovery Engine (`POST /api/v1/discover`)**:
   - For every discovery candidate with a canonical internal `place.id`, `discovery.service.ts` queries aggregate community signals in batch.
   - Highlights (e.g. _"Arrive 30 minutes before first light"_, _"Small path behind main viewpoint"_) render directly on Discovery Cards.
3. **Source Transparency**:
   - UI clearly delineates between `OFFBEAT CANONICAL` facts, `SERPAPI` live web results, and `OFFBEAT COMMUNITY` human observations.

---

### 7. Frontend User Experience

The frontend implementation introduces dedicated components and integrated flows:

- **`ContributeModal.tsx`**:
  - Context-aware contribution modal with quick-select category pills (`Hidden Place`, `Photo Spot`, `Best Time`, `Crowd Tip`, etc.).
  - Title, description, and optional evidence URL input with real-time validation.
  - Automatically captures `placeId` and `destinationId` when invoked from a place page or discovery card.
- **`CommunityCard.tsx`**:
  - Displays submission category badge, traveler avatar, timestamp, title, and descriptive advice.
  - Renders attached photo evidence gracefully.
  - Interactive support buttons (`👍 Useful` and `✓ Confirm`) that update counts immediately and prevent double-clicks.
  - Inline lightweight reporting modal with structured reasons.
- **`CommunitySection.tsx`**:
  - Placed seamlessly inside `PlacePage.tsx`.
  - Renders active community discoveries, aggregated traveler counts, and an empty state (_"No community discoveries yet. Be the first traveler to share something useful about this place."_).
- **`DiscoveryCard.tsx`**:
  - Renders community signal badges (`Community: 3 discoveries · 14 helpful tips`) and curated top highlights right below _"Why Offbeat Discovered This"_.
- **`CommunityPage.tsx` (`/community`)**:
  - Living feed of traveler discoveries across destinations with category filter chips, search, and a direct contribution button.

---

### 8. Seed Demo Community Data

Deterministic seed data is provided for immediate hackathon demonstration:

- **Tiger Hill (`place_tiger_hill`, Darjeeling)**:
  - `BEST_TIME`: _"Arrive at least 30 minutes before first light for peaceful viewing and unhurried positioning."_ (12 useful, 8 confirmed)
  - `PHOTO_SPOT`: _"Take the small unpaved ridge path 100 meters behind the main tower for unobstructed Kanchenjunga framing."_ (9 useful, 5 confirmed)
  - `CROWD_TIP`: _"Shared jeeps depart town simultaneously; booking a private taxi 20 minutes earlier avoids the parking gridlock."_ (6 useful, 4 confirmed)
- **Batasia Loop (`place_batasia_loop`, Darjeeling)**:
  - `PHOTO_SPOT`: _"Stand on the inner garden circle just as the toy train engine clears the memorial for the iconic steam shot."_ (7 useful, 3 confirmed)
- **Victoria Memorial (`place_victoria_memorial`, Kolkata)**:
  - `BEST_TIME`: _"Visit the north gardens during the golden hour around 4:45 PM when water reflections are calmest."_ (11 useful, 7 confirmed)

---

### 9. Verification & Automated Test Coverage

The Phase 8 test suite covers all unit, integration, and cross-module discovery contracts:

```text
Test Suites: 30 passed, 30 total
Tests:       178 passed, 178 total
Snapshots:   0 total
Time:        ~12 s
```

#### Test Breakdown:

- **`community.schema.test.ts`**:
  - Validates submission payload bounds (trimming, title 3–150 chars, content 10–2000 chars).
  - Validates all 12 submission taxonomy types.
  - Validates URL structure for evidence photos.
  - Validates support type enums and report reasons.
- **`community.service.test.ts`**:
  - Tests submission creation and deterministic duplicate protection (same user + place + type + normalized title).
  - Tests support creation and throws `ConflictError` on duplicate support.
  - Tests report creation and validation.
  - Tests community signals aggregation and highlight selection.
- **`community.test.ts` (API Integration)**:
  - `POST /api/v1/community/submissions` (success and validation failures).
  - `GET /api/v1/community/submissions` (filtering by place, destination, type).
  - `GET /api/v1/community/submissions/:id` (404 and detail DTO).
  - `POST /api/v1/community/submissions/:id/support` (201 created and 409 conflict).
  - `POST /api/v1/community/submissions/:id/report` (201 created).
- **`scripts/verify-phase-8.ts` (`pnpm validate:community`)**:
  - Deterministic script verifying backend repository, support uniqueness, reporting, discovery highlights, and place signals.
  - Executed and passed 100%.

---

### 10. Monorepo Quality Gates

All monorepo quality checks pass completely:

- `pnpm check`:
  - `verify` ✅ PASS
  - `validate:geography` ✅ PASS
  - `validate:serpapi` ✅ PASS
  - `validate:discovery` ✅ PASS
  - `validate:community` ✅ PASS
  - `lint` ✅ PASS (zero lint errors)
  - `format:check` ✅ PASS
- `pnpm typecheck` ✅ PASS (zero TypeScript errors)
- `pnpm build` ✅ PASS (all frontend and backend packages built successfully)

---

### 11. Final Status Matrix

```text
Phase 0  Foundation & Monorepo          ✅ VERIFIED
Phase 1  Geographic Engine              ✅ VERIFIED
Phase 2  Interactive Map Experience     ✅ VERIFIED
Phase 3  Traveler Taste Engine          ✅ VERIFIED
Phase 4  Foundational Domain & API      ✅ VERIFIED
Phase 5  Geography & Place Domain       ✅ VERIFIED
Phase 6  SerpApi Intelligence Layer     ✅ VERIFIED
Phase 7  Discovery Engine               ✅ READY & VERIFIED
Phase 8  Community Intelligence         ✅ READY & VERIFIED
```
