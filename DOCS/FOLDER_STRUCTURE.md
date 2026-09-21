# OFFBEAT — FOLDER STRUCTURE

**Version:** 1.0
**Status:** Baseline Project Architecture
**Architecture:** Monorepo
**Frontend:** React + TypeScript + Vite
**Backend:** Node.js + Express + TypeScript
**Database:** PostgreSQL + Prisma
**State Management:** Zustand
**Validation:** Zod
**Styling:** Tailwind CSS
**External Intelligence:** SerpApi
**AI:** Gemini

---

# 1. ARCHITECTURE PHILOSOPHY

OFFBEAT uses a **domain-oriented monorepo architecture**.

The structure should make it immediately clear:

* Where a feature belongs
* Where business logic lives
* Where intelligence lives
* Where database logic lives
* Where API contracts live
* Where frontend presentation lives
* Where shared types belong

The primary principle is:

> **Organize code around what OFFBEAT does, not merely around what technology it uses.**

---

# 2. ROOT STRUCTURE

```text
OFFBEAT/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── shared/
│   ├── validation/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
└── ...
```

The repository uses **pnpm workspaces** to manage the monorepo.

---

# 3. APPLICATIONS

The `apps/` directory contains deployable applications.

```text
apps/
├── web/
└── api/
```

---

# 4. WEB APPLICATION

The `web` application contains the OFFBEAT user interface.

```text
apps/web/
│
├── public/
│
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

# 5. WEB APP — APP

The `app/` directory contains application-level configuration.

```text
app/
├── router.tsx
├── providers.tsx
├── constants.ts
└── config.ts
```

Responsibilities:

* Routing
* Global providers
* Application configuration
* Global constants

---

# 6. WEB APP — COMPONENTS

Reusable UI components live here.

```text
components/
├── ui/
├── map/
├── discovery/
├── place/
├── community/
├── itinerary/
├── take-home/
└── common/
```

Examples:

```text
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   └── Tabs.tsx
│
├── map/
│   ├── CountryMap.tsx
│   ├── RegionLayer.tsx
│   ├── RegionMarker.tsx
│   └── MapTransition.tsx
│
├── discovery/
│   ├── DiscoveryCard.tsx
│   ├── RecommendationCard.tsx
│   ├── TasteSelector.tsx
│   └── WhyOffbeat.tsx
```

---

# 7. MAP ARCHITECTURE

Because the map is one of OFFBEAT's defining experiences, it receives its own component domain.

```text
components/map/
│
├── CountryMap.tsx
├── RegionLayer.tsx
├── RegionGeometry.tsx
├── RegionHover.tsx
├── RegionSelection.tsx
├── RegionTransition.tsx
├── MapCamera.tsx
├── MapControls.tsx
└── MapLegend.tsx
```

The **State / UT rise-and-pop interaction** belongs here.

The implementation should follow:

```text
SELECT
   ↓
RISE
   ↓
FOCUS
   ↓
REVEAL
   ↓
EXPLORE
```

Map interaction logic should not be scattered throughout unrelated pages.

---

# 8. WEB APP — FEATURES

The `features/` directory contains feature-specific logic.

```text
features/
├── auth/
├── discovery/
├── geography/
├── travel-taste/
├── experience-taste/
├── places/
├── community/
├── alternatives/
├── itinerary/
├── take-home/
├── saved-places/
└── profile/
```

Each feature may contain:

```text
feature/
├── components/
├── hooks/
├── api.ts
├── types.ts
├── utils.ts
└── index.ts
```

The exact structure should remain lightweight.

---

# 9. DISCOVERY FEATURE

Discovery is the core frontend feature.

```text
features/discovery/
│
├── components/
│   ├── DiscoveryResults.tsx
│   ├── DiscoveryCard.tsx
│   ├── DiscoveryFilters.tsx
│   ├── DiscoveryContext.tsx
│   └── WhyOffbeat.tsx
│
├── hooks/
│   ├── useDiscovery.ts
│   └── useDiscoveryContext.ts
│
├── api.ts
├── types.ts
└── index.ts
```

---

# 10. TRAVEL TASTE FEATURE

```text
features/travel-taste/
├── components/
│   ├── TravelTasteSelector.tsx
│   └── TravelTasteCard.tsx
├── api.ts
├── types.ts
└── index.ts
```

---

# 11. EXPERIENCE TASTE FEATURE

```text
features/experience-taste/
├── components/
│   ├── ExperienceTasteSelector.tsx
│   └── ExperienceTasteCard.tsx
├── api.ts
├── types.ts
└── index.ts
```

---

# 12. COMMUNITY FEATURE

```text
features/community/
│
├── components/
│   ├── CommunityCard.tsx
│   ├── SubmissionForm.tsx
│   ├── VerificationBadge.tsx
│   ├── ConfidenceIndicator.tsx
│   └── EvidenceList.tsx
│
├── hooks/
│   ├── useCommunity.ts
│   └── useSubmission.ts
│
├── api.ts
├── types.ts
└── index.ts
```

---

# 13. ALTERNATIVE FEATURE

```text
features/alternatives/
├── components/
│   ├── AlternativePanel.tsx
│   ├── AlternativeCard.tsx
│   └── AlternativeModeSelector.tsx
├── hooks/
├── api.ts
├── types.ts
└── index.ts
```

This feature supports:

```text
REPLACEMENT
ENHANCEMENT
COMPLEMENTARY
NEARBY_DISCOVERY
TIMING_ALTERNATIVE
LOWER_CROWD
```

---

# 14. ITINERARY FEATURE

```text
features/itinerary/
│
├── components/
│   ├── ItineraryView.tsx
│   ├── ItineraryDay.tsx
│   ├── ItineraryItem.tsx
│   ├── ItineraryTimeline.tsx
│   └── OptimizationPanel.tsx
│
├── hooks/
│   ├── useItinerary.ts
│   └── useItineraryOptimization.ts
│
├── api.ts
├── types.ts
└── index.ts
```

---

# 15. TAKE HOME FEATURE

```text
features/take-home/
├── components/
│   ├── TakeHomeSection.tsx
│   ├── TakeHomeCard.tsx
│   └── TakeHomeCategory.tsx
├── api.ts
├── types.ts
└── index.ts
```

---

# 16. WEB APP — PAGES

Pages represent route-level screens.

```text
pages/
├── LandingPage.tsx
├── CountryPage.tsx
├── RegionPage.tsx
├── DiscoveryPage.tsx
├── PlacePage.tsx
├── AlternativePage.tsx
├── ItineraryPage.tsx
├── TakeHomePage.tsx
├── CommunityPage.tsx
├── SubmissionPage.tsx
├── ProfilePage.tsx
├── SavedPlacesPage.tsx
├── LoginPage.tsx
└── RegisterPage.tsx
```

Pages should primarily compose feature components.

They should not contain large amounts of business logic.

---

# 17. WEB APP — LAYOUTS

```text
layouts/
├── MainLayout.tsx
├── DiscoveryLayout.tsx
├── MapLayout.tsx
└── AuthLayout.tsx
```

---

# 18. WEB APP — SERVICES

Frontend API communication belongs here.

```text
services/
├── api/
│   ├── client.ts
│   ├── auth.ts
│   ├── discovery.ts
│   ├── geography.ts
│   ├── places.ts
│   ├── community.ts
│   ├── alternatives.ts
│   ├── itinerary.ts
│   ├── take-home.ts
│   └── profile.ts
│
└── storage/
    └── localStorage.ts
```

The frontend communicates with the backend through this layer.

---

# 19. WEB APP — STATE MANAGEMENT

Zustand stores belong in:

```text
stores/
├── authStore.ts
├── discoveryStore.ts
├── mapStore.ts
├── preferenceStore.ts
├── itineraryStore.ts
└── uiStore.ts
```

State should be kept minimal.

Server data should not automatically become global client state unless there is a real need.

---

# 20. WEB APP — HOOKS

Reusable frontend hooks:

```text
hooks/
├── useAuth.ts
├── useDebounce.ts
├── useMediaQuery.ts
├── useMap.ts
└── useToast.ts
```

Feature-specific hooks remain inside their feature folders.

---

# 21. WEB APP — TYPES

```text
types/
├── api.ts
├── place.ts
├── destination.ts
├── community.ts
├── itinerary.ts
└── user.ts
```

Shared types that are genuinely used across applications should eventually move into `packages/shared`.

---

# 22. WEB APP — UTILS

```text
utils/
├── formatters.ts
├── dates.ts
├── geo.ts
├── confidence.ts
└── helpers.ts
```

Utilities should remain generic.

Domain-specific logic belongs inside the relevant feature.

---

# 23. API APPLICATION

The backend is organized around domain modules.

```text
apps/api/
│
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── modules/
│   ├── integrations/
│   ├── lib/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
│
├── .env.example
├── package.json
└── tsconfig.json
```

---

# 24. BACKEND MODULE ARCHITECTURE

The primary backend domain structure:

```text
modules/
├── auth/
├── users/
├── geography/
├── places/
├── discovery/
├── community/
├── verification/
├── confidence/
├── crowd/
├── time/
├── recommendations/
├── alternatives/
├── itinerary/
├── take-home/
└── memory/
```

This is the core of the backend architecture.

---

# 25. MODULE INTERNAL STRUCTURE

Each backend domain should follow a consistent pattern.

Example:

```text
modules/discovery/
│
├── discovery.controller.ts
├── discovery.service.ts
├── discovery.repository.ts
├── discovery.schema.ts
├── discovery.types.ts
├── discovery.routes.ts
└── index.ts
```

Not every module needs every file.

The structure should grow according to complexity.

---

# 26. CONTROLLER

Controllers handle HTTP concerns.

Responsibilities:

* Read request
* Validate input
* Call service
* Format response
* Return HTTP status

Controllers should NOT contain the core business logic.

---

# 27. SERVICE

Services contain domain logic.

Example:

```text
discovery.service.ts
```

Responsible for orchestrating:

```text
Intent
Data Retrieval
Community
Confidence
Time
Crowd
AI
Recommendation
```

The service should not directly contain Express-specific logic.

---

# 28. REPOSITORY

Repositories handle database access.

Example:

```text
place.repository.ts
```

Responsibilities:

* Query PostgreSQL
* Create records
* Update records
* Retrieve relations
* Handle database-specific operations

Business decisions should remain in services.

---

# 29. SCHEMA

Schemas contain Zod validation.

Example:

```text
discovery.schema.ts
```

Used for:

* Request validation
* Query validation
* Parameter validation
* AI output validation where appropriate

---

# 30. BACKEND INTELLIGENCE MODULES

The intelligence architecture becomes:

```text
modules/
│
├── discovery/
├── confidence/
├── crowd/
├── time/
├── recommendations/
├── alternatives/
├── verification/
└── memory/
```

These are reusable services rather than one giant AI function.

---

# 31. AI ORCHESTRATION

Gemini integration should have its own infrastructure boundary.

```text
integrations/
├── serpapi/
│   ├── serpapi.client.ts
│   ├── serpapi.types.ts
│   ├── serpapi.mapper.ts
│   └── index.ts
│
└── gemini/
    ├── gemini.client.ts
    ├── gemini.types.ts
    ├── gemini.schemas.ts
    ├── gemini.prompts.ts
    └── index.ts
```

Gemini must not be imported directly throughout the application.

Instead:

```text
Domain Service
      ↓
AI Orchestrator
      ↓
Gemini Integration
```

---

# 32. SERPAPI INTEGRATION

All SerpApi communication remains isolated:

```text
integrations/serpapi/
├── serpapi.client.ts
├── serpapi.types.ts
├── serpapi.mapper.ts
└── index.ts
```

This prevents SerpApi-specific response structures from leaking into the domain.

---

# 33. CONFIGURATION

```text
config/
├── env.ts
├── database.ts
├── ai.ts
├── serpapi.ts
└── cors.ts
```

Environment variables should be parsed and validated at application startup.

---

# 34. MIDDLEWARE

```text
middleware/
├── auth.middleware.ts
├── error.middleware.ts
├── request-id.middleware.ts
├── rate-limit.middleware.ts
├── validation.middleware.ts
└── logger.middleware.ts
```

---

# 35. ROUTES

Routes should only connect HTTP paths to controllers.

```text
routes/
├── auth.routes.ts
├── profile.routes.ts
├── geography.routes.ts
├── place.routes.ts
├── discovery.routes.ts
├── community.routes.ts
├── recommendation.routes.ts
├── alternative.routes.ts
├── itinerary.routes.ts
├── take-home.routes.ts
└── saved-place.routes.ts
```

Routes should remain thin.

---

# 36. DATABASE STRUCTURE

Prisma remains at repository root:

```text
prisma/
│
├── schema.prisma
├── seed.ts
└── migrations/
```

The Prisma schema represents:

```text
User
Profile
TravelTaste
ExperienceTaste
Country
Region
Destination
Place
PlaceCategory
CommunitySubmission
SubmissionEvidence
SubmissionSupport
SubmissionReport
VerificationRecord
ConfidenceRecord
CrowdObservation
TimeObservation
Itinerary
ItineraryItem
TakeHomeItem
SavedPlace
Recommendation
ExternalPlaceReference
SearchCache
```

---

# 37. SHARED PACKAGES

Shared code belongs in:

```text
packages/
├── shared/
├── validation/
└── config/
```

### `shared`

Common types and constants.

### `validation`

Reusable Zod schemas where sharing them between frontend and backend is beneficial.

### `config`

Shared configuration conventions and constants where genuinely required.

Do not turn `packages/` into a dumping ground.

---

# 38. DOCUMENTATION

All project documentation belongs in:

```text
docs/
│
├── PRD.md
├── TRD.md
├── SSD.md
├── UI-UX.md
├── BACKEND-FLOW.md
├── DBD.md
├── MEMORY.md
├── API-SPECS.md
└── FOLDER-STRUCTURE.md
```

This creates a direct connection between the documentation and implementation.

---

# 39. COMPLETE REPOSITORY TREE

The resulting OFFBEAT architecture:

```text
OFFBEAT/
│
├── apps/
│   │
│   ├── web/
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       ├── assets/
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   ├── map/
│   │       │   ├── discovery/
│   │       │   ├── place/
│   │       │   ├── community/
│   │       │   ├── itinerary/
│   │       │   └── take-home/
│   │       │
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   ├── discovery/
│   │       │   ├── geography/
│   │       │   ├── travel-taste/
│   │       │   ├── experience-taste/
│   │       │   ├── places/
│   │       │   ├── community/
│   │       │   ├── alternatives/
│   │       │   ├── itinerary/
│   │       │   ├── take-home/
│   │       │   ├── saved-places/
│   │       │   └── profile/
│   │       │
│   │       ├── hooks/
│   │       ├── layouts/
│   │       ├── lib/
│   │       ├── pages/
│   │       ├── services/
│   │       ├── stores/
│   │       ├── types/
│   │       ├── utils/
│   │       ├── App.tsx
│   │       ├── main.tsx
│   │       └── index.css
│   │
│   └── api/
│       └── src/
│           ├── config/
│           ├── middleware/
│           ├── routes/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── geography/
│           │   ├── places/
│           │   ├── discovery/
│           │   ├── community/
│           │   ├── verification/
│           │   ├── confidence/
│           │   ├── crowd/
│           │   ├── time/
│           │   ├── recommendations/
│           │   ├── alternatives/
│           │   ├── itinerary/
│           │   ├── take-home/
│           │   └── memory/
│           │
│           ├── integrations/
│           │   ├── serpapi/
│           │   └── gemini/
│           │
│           ├── lib/
│           ├── utils/
│           ├── app.ts
│           └── server.ts
│
├── packages/
│   ├── shared/
│   ├── validation/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── SSD.md
│   ├── UI-UX.md
│   ├── BACKEND-FLOW.md
│   ├── DBD.md
│   ├── MEMORY.md
│   ├── API-SPECS.md
│   └── FOLDER-STRUCTURE.md
│
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

# 40. DEPENDENCY DIRECTION

The architecture should follow a predictable dependency direction:

```text
FRONTEND
   ↓
API
   ↓
CONTROLLERS
   ↓
DOMAIN SERVICES
   ↓
REPOSITORIES / INTELLIGENCE
   ↓
DATABASE / EXTERNAL INTEGRATIONS
```

External integrations should never leak upward.

For example:

```text
React
  ❌ → SerpApi

React
  ❌ → Gemini

Discovery Service
  ❌ → React

Place Repository
  ❌ → Gemini
```

Instead:

```text
React
 ↓
API
 ↓
Discovery Service
 ↓
AI / SerpApi / Repository
```

---

# 41. CORE ARCHITECTURAL RULES

### Rule 1 — Frontend owns presentation.

### Rule 2 — Backend owns business logic.

### Rule 3 — Services own domain behaviour.

### Rule 4 — Repositories own database access.

### Rule 5 — Integrations own external providers.

### Rule 6 — Gemini is accessed through the AI integration boundary.

### Rule 7 — SerpApi is accessed through the external-data boundary.

### Rule 8 — Shared packages contain only genuinely shared code.

### Rule 9 — Pages compose features; they do not become business-logic containers.

### Rule 10 — Intelligence services remain reusable.

---

# 42. FEATURE OWNERSHIP PRINCIPLE

If a piece of code answers:

> **“What does this feature do?”**

It belongs in the feature/domain.

If it answers:

> **“How does the application communicate with something external?”**

It belongs in integrations/services.

If it answers:

> **“How does the UI look?”**

It belongs in components.

If it answers:

> **“How is data stored?”**

It belongs in repositories/Prisma.

This keeps the project understandable as it grows.

---

# 43. OFFBEAT FOLDER STRUCTURE NORTH STAR

The folder structure should make it possible for a developer to answer three questions immediately:

### 1. Where does this feature live?

**Domain / Feature**

### 2. Where does its data come from?

**Repository / Integration**

### 3. Where does its UI live?

**Component / Page**

If those answers are obvious, the architecture is working.

---

# 44. FINAL FOLDER STRUCTURE DEFINITION

> **OFFBEAT uses a domain-oriented monorepo architecture in which the React frontend, Express backend, reusable intelligence services, database layer, external integrations, shared packages, and project documentation are clearly separated while remaining organized around the actual capabilities of the product.**

The architecture is designed to keep OFFBEAT:

**modular → understandable → reusable → scalable → hackathon-friendly.**

---
