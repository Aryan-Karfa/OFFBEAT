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

# Monorepo Structure

```text
OFFBEAT/
├── Frontend/
├── Backend/
├── packages/
├── prisma/
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

The project is divided into two primary application layers:

* **Frontend** — User interface, interaction, state management, map experience, and presentation.
* **Backend** — API, business logic, intelligence engines, database access, external integrations, and AI orchestration.

Shared code belongs inside `packages/`.

---

# 2. Frontend

```text
Frontend/
├── public/
│   └── ...
│
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   └── config/
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── map/
│   │   ├── discovery/
│   │   ├── place/
│   │   ├── community/
│   │   ├── itinerary/
│   │   └── take-home/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── discovery/
│   │   ├── geography/
│   │   ├── travel-taste/
│   │   ├── experience-taste/
│   │   ├── places/
│   │   ├── community/
│   │   ├── alternatives/
│   │   ├── itinerary/
│   │   ├── take-home/
│   │   ├── saved-places/
│   │   └── profile/
│   │
│   ├── hooks/
│   │
│   ├── layouts/
│   │
│   ├── lib/
│   │
│   ├── pages/
│   │   ├── Landing/
│   │   ├── Country/
│   │   ├── Region/
│   │   ├── TravelTaste/
│   │   ├── ExperienceTaste/
│   │   ├── Discovery/
│   │   ├── Place/
│   │   ├── Alternatives/
│   │   ├── Itinerary/
│   │   ├── TakeHome/
│   │   ├── Community/
│   │   └── Profile/
│   │
│   ├── services/
│   │
│   ├── stores/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## 2.1 Frontend Responsibilities

The Frontend is responsible for:

* User interface
* Navigation
* Page composition
* Map interaction
* State/region selection
* Travel Taste selection
* Experience Taste selection
* Discovery presentation
* Place exploration
* Community interaction
* Itinerary interaction
* TAKE HOME presentation
* Animations and transitions
* Responsive design
* Accessibility
* Client-side state

The Frontend **must not** directly access:

* PostgreSQL
* Prisma
* SerpApi
* Gemini API
* Backend secrets
* Backend business logic

All application intelligence is accessed through the Backend API.

---

# 3. Backend

```text
Backend/
├── src/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── app.config.ts
│   │   └── database.config.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── geography/
│   │   ├── places/
│   │   ├── discovery/
│   │   ├── community/
│   │   ├── verification/
│   │   ├── confidence/
│   │   ├── crowd/
│   │   ├── time/
│   │   ├── recommendations/
│   │   ├── alternatives/
│   │   ├── itinerary/
│   │   ├── take-home/
│   │   └── memory/
│   │
│   ├── intelligence/
│   │   ├── intent/
│   │   ├── discovery/
│   │   ├── normalization/
│   │   ├── community/
│   │   ├── verification/
│   │   ├── confidence/
│   │   ├── crowd/
│   │   ├── time/
│   │   ├── recommendation/
│   │   ├── alternative/
│   │   ├── itinerary/
│   │   ├── take-home/
│   │   └── memory/
│   │
│   ├── integrations/
│   │   ├── serpapi/
│   │   │   ├── serpapi.client.ts
│   │   │   ├── serpapi.adapter.ts
│   │   │   └── serpapi.types.ts
│   │   │
│   │   └── gemini/
│   │       ├── gemini.client.ts
│   │       ├── gemini.orchestrator.ts
│   │       └── gemini.types.ts
│   │
│   ├── lib/
│   │   ├── logger/
│   │   ├── cache/
│   │   ├── errors/
│   │   └── http/
│   │
│   ├── utils/
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

# 4. Backend Module Structure

Each domain module follows a consistent structure where required:

```text
module/
├── module.controller.ts
├── module.service.ts
├── module.repository.ts
├── module.schema.ts
├── module.types.ts
├── module.routes.ts
└── index.ts
```

Not every module is required to contain every file.

### Responsibilities

**Controller**

* Receives HTTP requests
* Validates request flow
* Calls the appropriate service
* Returns API responses

**Service**

* Owns domain-level business logic
* Coordinates repositories and intelligence services

**Repository**

* Owns database access
* Uses Prisma

**Schema**

* Zod request/response validation

**Types**

* Module-specific TypeScript types

**Routes**

* Defines HTTP endpoints

---

# 5. Backend Intelligence Layer

The Intelligence Layer contains reusable decision-making services.

```text
intelligence/
├── intent/
├── discovery/
├── normalization/
├── community/
├── verification/
├── confidence/
├── crowd/
├── time/
├── recommendation/
├── alternative/
├── itinerary/
├── take-home/
└── memory/
```

The primary intelligence pipeline is:

```text
User Context
      ↓
Intent Engine
      ↓
Data Retrieval
      ↓
Data Normalization
      ↓
Community Intelligence
      ↓
Confidence Engine
      ↓
Gemini Reasoning
      ↓
Recommendation Engine
      ↓
Response
```

The Backend controls the evidence and context available to Gemini.

Gemini does not directly control:

* Database state
* Authorization
* User permissions
* Internal IDs
* Final database writes
* Backend security decisions

---

# 6. External Integrations

External providers are isolated from the rest of the application.

```text
integrations/
├── serpapi/
│   ├── serpapi.client.ts
│   ├── serpapi.adapter.ts
│   └── serpapi.types.ts
│
└── gemini/
    ├── gemini.client.ts
    ├── gemini.orchestrator.ts
    └── gemini.types.ts
```

### SerpApi

Responsible for retrieving external travel/search intelligence.

```text
SerpApi
   ↓
Adapter
   ↓
Raw Response
   ↓
Normalizer
   ↓
OFFBEAT Internal Data
```

Raw SerpApi schemas must not leak into the Frontend.

### Gemini

Responsible for reasoning over backend-approved context.

```text
Backend Evidence
      ↓
Context Builder
      ↓
Gemini
      ↓
Structured Output
      ↓
Zod Validation
      ↓
Business Rules
      ↓
OFFBEAT Result
```

The Gemini model must remain configurable through environment configuration.

---

# 7. Database

```text
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

The database layer contains persistent application and knowledge data.

Major entities include:

* User
* Profile
* TravelTaste
* ExperienceTaste
* Country
* Region
* Destination
* Place
* PlaceCategory
* CommunitySubmission
* SubmissionEvidence
* SubmissionSupport
* SubmissionReport
* VerificationRecord
* ConfidenceRecord
* CrowdObservation
* TimeObservation
* Itinerary
* ItineraryItem
* TakeHomeItem
* SavedPlace
* Recommendation
* ExternalPlaceReference
* SearchCache

---

# 8. Shared Packages

```text
packages/
├── shared/
├── validation/
└── config/
```

### `shared/`

Genuinely shared TypeScript types, constants, and utilities.

### `validation/`

Shared request/response schemas where frontend and backend genuinely need the same validation contract.

### `config/`

Shared configuration conventions that do not expose secrets.

Shared packages should remain intentionally small.

---

# 9. Documentation

```text
docs/
├── PRD.md
├── TRD.md
├── SSD.md
├── UI_UX.md
├── BACKEND_FLOW.md
├── DBD.md
├── MEMORY.md
├── API_SPECS.md
└── FOLDER_STRUCTURE.md
```

The documentation acts as the project's development source of truth.

---

# 10. Dependency Direction

The intended dependency direction is:

```text
                    ┌──────────────┐
                    │   Frontend   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   REST API   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Controllers  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Services   │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌───────────────┐        ┌────────────────┐
      │ Intelligence  │        │  Repositories  │
      └───────┬───────┘        └───────┬────────┘
              │                         │
       ┌──────┴──────┐                  ▼
       ▼             ▼            ┌────────────┐
   SerpApi        Gemini          │ PostgreSQL │
                                  └────────────┘
```

---

# 11. Architecture Rules

1. **Frontend owns presentation and interaction.**
2. **Backend owns business logic.**
3. **Services own domain behavior.**
4. **Repositories own database access.**
5. **Integrations own external providers.**
6. **Intelligence services remain reusable across modules.**
7. **SerpApi and Gemini remain isolated behind integration layers.**
8. **Frontend never accesses external provider APIs directly.**
9. **Frontend never accesses the database directly.**
10. **Secrets remain server-side.**
11. **Pages compose features; they do not contain business logic.**
12. **External provider schemas must not leak into the application layer.**
13. **AI output must be structured and validated before use.**
14. **Shared packages contain only genuinely shared code.**
15. **No feature should bypass the established dependency direction without a documented architectural reason.**

---

# 12. Development Principle

OFFBEAT will be developed as a **vertical system**, not as a collection of disconnected screens.

The first implementation slice should connect:

```text
Landing
   ↓
Country
   ↓
Interactive Map
   ↓
State / UT Selection
   ↓
Region Rises & Focuses
   ↓
Travel Taste
   ↓
Experience Taste
   ↓
Discovery
   ↓
Backend
```

This ensures the Frontend and Backend evolve together around the actual OFFBEAT experience rather than building isolated UI screens first.

---

# 13. Final Folder Structure Principle

> **Frontend presents the experience.**
> **Backend understands the experience.**
> **Intelligence reasons about the experience.**
> **Database remembers the experience.**
> **External APIs provide outside-world data.**
> **Gemini helps interpret it.**

OFFBEAT's folder structure should remain modular enough to evolve during development while staying faithful to the PRD, TRD, SSD, UI/UX Framework, Backend Flow, DBD, Memory, and API Specifications.