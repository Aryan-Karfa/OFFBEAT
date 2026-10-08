# OFFBEAT (v0.1.0)

> **Let's discover where you should go.**  
> A community-powered, taste-first travel discovery platform powered by deterministic geospatial intelligence, Google Gemini 3.8 Flash, and evidence-grounded traveler memory.

---

## 1. What OFFBEAT Is

Traditional travel platforms rely on search boxes that assume you already know your destination. But when travelers seek inspiration, search boxes fall flat.

**OFFBEAT is discovery-first, not search-first.**

Instead of pushing paid hotel ads or sponsored listings, OFFBEAT collects traveler taste, overlays spatial geography, gathers peer observations, and synthesizes tailored recommendations:

- **Discover:** Map-first vector exploration across India's 28 States & 8 Union Territories.
- **Understand:** Explicit "Why OFFBEAT Chose This" explanations with transparent confidence attribution.
- **Adapt:** Find smart alternatives across 6 strategic modes (Lower Crowd, Replacement, Nearby Discovery, etc.).
- **Plan:** Build temporally and geographically feasible 1-day or multi-day itineraries.
- **Connect:** Discover authentic regional artisan goods and local specialties via TAKE HOME.
- **Remember:** Private traveler memory that retains tastes across return sessions without third-party tracking.

---

## 2. Core Architecture

OFFBEAT is built as a modular monorepo cleanly separating shared domain contracts, backend intelligence services, and a responsive frontend exploration shell:

```text
OFFBEAT/
├── Frontend/           # React 19 + TypeScript + Vite + Tailwind CSS + Zustand
├── Backend/            # Node.js 22 + Express + TypeScript + Prisma ORM + PostgreSQL
├── packages/
│   └── shared/         # Universal DTOs, schemas, API contracts, and enums
├── prisma/             # Prisma schema, migrations, and canonical Indian seed data
├── scripts/            # Phase validation and verification suites (0 through 16)
└── DOCS/               # Architectural documents (PRD, TRD, SSD, DBD, Reports)
```

### The Closed-Loop Journey

```text
LANDING
  ↓
INTERACTIVE VECTOR MAP (28 States + 8 UTs)
  ↓
TRAVEL TASTE & EXPERIENCE TASTE FORMULATION
  ↓
MULTI-SIGNAL DISCOVERY ENGINE (Internal Places + SerpApi Normalization)
  ↓
PLACE DETAILS & COMMUNITY EVIDENCE VERIFICATION
  ↓
FIND AN ALTERNATIVE (6 Deterministic & AI-Assisted Modes)
  ↓
BUILD MY DAY (Geographic Itinerary Routing + Stop Swapping)
  ↓
TAKE HOME (Authentic Regional Specialties + Where-to-Find Coordinates)
  ↓
TRAVELER MEMORY & PERSONALIZATION (Explicit + Inferred Weight Decay)
  ↓
RETURN TO DISCOVERY (Personalized Discovery Affinity Boost)
```

---

## 3. Key Product Features

| Feature                       | Description                                                                                 | Architecture / Layer                   |
| ----------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Vector India Map**          | High-performance D3/TopoJSON projection of 28 states & 8 UTs with tiny territory indicators | Frontend / GeoJSON                     |
| **Taste Engine**              | Multi-dimensional macro travel styles + micro experience affinity collection                | `@offbeat/shared` / State Store        |
| **Discovery Engine**          | Multi-signal ranking balancing taste, geographic proximity, hours, and crowd fit            | Backend Scorer + Merger                |
| **Gemini Intelligence**       | Contextual reasoning and explanation synthesis using allowlisted candidates                 | `gemini-3.8-flash` via `@google/genai` |
| **Confidence & Verification** | Transparent evidence scoring (`HIGH`, `MODERATE`, `EXPERIMENTAL`) for crowd/time tips       | Confidence Engine                      |
| **Time & Crowd Signals**      | Operating window enforcement and peer-reported peak crowd avoidance                         | Spatio-Temporal Engine                 |
| **Find an Alternative**       | 6 strategic modes: Replacement, Lower Crowd, Nearby Discovery, Enhancement, etc.            | Alternatives Service                   |
| **Itinerary Builder**         | Day scheduling preventing zig-zagging transit with seamless stop swapping                   | Itinerary Scheduler & Router           |
| **TAKE HOME**                 | Regional specialty curation with verified local artisan buying locations                    | Take Home Service & Scorer             |
| **Traveler Memory**           | Private memory with explicit persistence floor, inferred half-life decay, and zero IDOR     | Memory Service & Rules                 |

---

## 4. Tech Stack

- **Frontend:** React 19, TypeScript 5.8, Vite, Tailwind CSS, Zustand, Lucide React, D3 Geo.
- **Backend:** Node.js 22+, Express 4.21, TypeScript, Prisma 6.4, Zod 3.24, Supertest.
- **Database:** PostgreSQL (with SQLite development fallback and Prisma Client).
- **AI Reasoning:** Google Gemini API (`gemini-3.8-flash`).
- **External Data:** SerpApi (Google Maps, Reviews, Photos, Local Engines).
- **Workspace Tooling:** pnpm 12, ESLint 10, Prettier 3, tsx.

---

## 5. Getting Started & Setup

### Prerequisites

- Node.js `22.0.0` or higher
- Corepack enabled (`corepack enable`)
- pnpm `12.6.0`

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Aryan-Karfa/OFFBEAT.git
cd OFFBEAT

# 2. Install monorepo dependencies
pnpm install

# 3. Generate Prisma client
pnpm prisma:generate

# 4. Optional: Seed canonical demo dataset
pnpm db:seed
```

---

## 6. Environment Variables

Create `.env` at repository root or inside `Backend/` (see `.env.example`):

```bash
# Application Ports
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/offbeat_dev?schema=public"

# AI Reasoning (Authoritative Model: gemini-3.8-flash)
GEMINI_API_KEY="" # Optional: If omitted, deterministic fallback activates automatically
GEMINI_MODEL=gemini-3.8-flash
GEMINI_TIMEOUT_MS=10000
GEMINI_MAX_RETRIES=2
GEMINI_ENABLED=true

# External Search Data
SERPAPI_API_KEY="" # Optional: If omitted, internal candidate database serves results
SERPAPI_ENGINE_MAPS=google_maps

# Security & CORS
JWT_SECRET="offbeat-dev-jwt-secret-do-not-use-in-production"
CORS_ORIGIN="http://localhost:5173"
```

Frontend public environment (`Frontend/.env`):

```bash
VITE_API_BASE_URL="http://localhost:5000/api/v1"
VITE_APP_ENV="development"
```

> **Security Guarantee:** No API keys or private credentials are exposed to frontend browser bundles.

---

## 7. Running Locally

```bash
# Run both Frontend and Backend concurrently:
pnpm dev

# Or run separately:
pnpm --filter backend dev    # Runs at http://localhost:5000
pnpm --filter frontend dev   # Runs at http://localhost:5173
```

---

## 8. Verification & Test Commands

Every development phase features automated verification scripts. You can run all checks with:

```bash
# Run complete test suite (60 test files, 347 tests):
pnpm test

# Run TypeScript typechecks across all packages:
pnpm typecheck

# Run production build:
pnpm build

# Run code style & lint:
pnpm lint
pnpm format:check

# Run Phase 16 hardening verification suite:
pnpm validate:hardening

# Run full cross-phase verification gate (Phases 0 through 16):
pnpm check
```

---

## 9. Flagship Demo Flow (Golden Journey)

For judges and evaluators, a comprehensive 3–5 minute walkthrough script is provided in [`DOCS/DEMO_SCRIPT.md`](file:///c:/Users/aryan/OneDrive/Desktop/PROJECT/OFFBEAT/DOCS/DEMO_SCRIPT.md):

1. **Start:** Open `http://localhost:5173/` → Click **[ START DISCOVERING ]**.
2. **Interactive Map:** Explore 28 States & 8 UTs → Select **West Bengal** (`IN-WB`).
3. **Taste:** Select **Mountains** + **Photography** → Experience **Sunrise** + **Nature**.
4. **Discovery:** See **Tiger Hill** recommended with 93% match, optimal 04:30–06:00 timing, and LOW crowd.
5. **Alternative:** Open **Find an Alternative** → Explore **Lower Crowd** (Batasia Loop) with tradeoff explanation.
6. **Itinerary:** Click **Build My Day** → Review optimal chronological schedule and swap stops seamlessly.
7. **Take Home:** Visit **Take Home** → View Single-Estate Darjeeling Tea with exact **Where-to-Find** coordinates.
8. **Memory:** Visit **Memory** → Inspect saved tastes, decay controls, and return to discovery for personalized boost.
9. **Reset:** Click **[ Reset Demo ]** in header to restore pristine state in 200ms.

---

## 10. Production Readiness & Deployment

- **SPA Refresh Safety:** Includes Netlify `_redirects`, Vercel rewrites, and Express HTML fallback so direct links (e.g. `/place/place_tiger_hill`) never 404 upon browser refresh.
- **Security Headers:** Server enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict Referrer Policies.
- **Rate Limiting:** Protects expensive endpoints with bounded 200 req/min limits with automatic test/health bypass.
- **React Error Boundaries:** Application and page boundaries intercept unexpected component errors and provide instant recovery buttons (`[ TRY AGAIN ]`, `[ BACK TO DISCOVERY ]`).
- **Resilience Under Provider Degradation:** If Gemini or SerpApi is unreachable or quota-limited, 100% deterministic fallback systems serve grounded recommendations without downtime.

---

## 11. Known Limitations & Roadmap

- **Geographic Coverage:** High-density candidate seeding is currently focused on flagship Indian benchmarks (West Bengal, Darjeeling, Ladakh, Kerala, Rajasthan); additional region catalog expansion is ongoing.
- **Live Flight / Transit Booking:** OFFBEAT deliberately focuses on discovery and itinerary synthesis rather than ticket booking.
- **Provider Quota:** In public free-tier environments, Gemini Flash and SerpApi may experience transient rate limits; OFFBEAT gracefully falls back to deterministic rule engines.

---

## 12. Team & Attribution

- **Project:** OFFBEAT Discovery Platform
- **Version:** v0.1.0 (Hackathon Release)
- **Built for:** Google Antigravity & GenAI Hackathon
