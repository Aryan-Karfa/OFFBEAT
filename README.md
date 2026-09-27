# OFFBEAT

> **Let's discover where you should go.**

OFFBEAT is a community-powered travel discovery platform designed to combine traveler taste, geographic discovery, external travel data, community intelligence, confidence signals, AI reasoning, alternatives, itinerary planning, and TAKE HOME discoveries.

## Phase 0 status

Phase 0 establishes the engineering foundation only:

- Monorepo structure
- Frontend / Backend / packages / Prisma boundaries
- pnpm workspace
- Shared TypeScript baseline
- Environment templates
- ESLint + Prettier
- Git-ready repository
- Source-of-truth documentation under `DOCS/`
- Structural verification script

Feature implementation begins in later phases according to `DOCS/DEVELOPMENT_PHASES.md`.

## Repository map

```text
OFFBEAT/
├── Frontend/
├── Backend/
├── packages/
├── prisma/
├── DOCS/
├── scripts/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## Getting started

1. Install Node.js 22+.
2. Enable Corepack and activate the pinned pnpm version.
3. Install dependencies with `pnpm install`.
4. Run `pnpm verify` to validate the Phase 0 structure.
5. Run `pnpm lint` and `pnpm format:check` for engineering checks.

### Corepack

```bash
corepack enable
corepack prepare pnpm@12.6.0 --activate
pnpm --version
```

### Install

```bash
pnpm install
```

### Verify

```bash
pnpm verify
pnpm lint
pnpm format:check
```

## Documentation

The project specifications are intentionally copied into `DOCS/` so AI-assisted development tools and contributors can work from the same baseline:

- PRD
- TRD
- SSD
- DBD
- API Specs
- Backend Flow
- Memory Architecture
- UI/UX Framework
- Folder Structure
- Development Phases
