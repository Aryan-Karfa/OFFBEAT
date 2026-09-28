# OFFBEAT — Backend Foundation (@offbeat/backend)

The backend platform for OFFBEAT, providing the core API services, security boundaries, database access, and architectural scaffolding for future intelligence features.

---

## 1. Architectural Overview

The backend is built as a modular monolith in TypeScript:

```text
                  REST API (/api/v1)
                          │
                   Express Factory
                          │
           ┌──────────────┼──────────────┐
           │              │              │
        Routes        Middleware      Modules
           │              │              │
           └──────────────┼──────────────┘
                          │
                   Domain Services
                          │
                    Repositories
                          │
                     Prisma ORM
                          │
                     PostgreSQL
```

### Module Architecture (Controller → Service → Repository)

- **Controller**: Handles HTTP request parsing, status codes, and standardized response envelopes.
- **Service**: Coordinates business logic, input sanitization, and domain invariants.
- **Repository**: Direct database queries and persistence using the centralized Prisma Client.
- **Schema**: Zod schemas for request validation (query, params, body).
- **Routes**: Router definitions mounting endpoints with validation middleware.

---

## 2. Core Technologies

- **Runtime**: Node.js (>= 22.0.0)
- **Framework**: Express 4.x
- **Language**: TypeScript (Strict Mode)
- **Validation**: Zod 3.x
- **Database & ORM**: PostgreSQL with Prisma ORM 6.x
- **Testing**: Vitest with Supertest
- **Logging**: Structured JSON logging with automatic secret redaction

---

## 3. Environment Configuration

Copy the template from the root or Backend directory:

```bash
cp Backend/.env.example Backend/.env
```

### Environment Contract

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/offbeat_dev?schema=public
SERPAPI_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
JWT_SECRET=offbeat-dev-jwt-secret-do-not-use-in-production
CORS_ORIGIN=http://localhost:5173
```

All environment variables are parsed and validated with Zod on startup (`src/config/env.ts`). Invalid or out-of-range configurations trigger immediate, diagnostic startup errors. Secrets (e.g. `DATABASE_URL`, `JWT_SECRET`, API keys) are strictly redacted from logs.

---

## 4. Local Database Setup

OFFBEAT uses PostgreSQL with Prisma ORM.

### Running PostgreSQL Locally with Docker:

```bash
docker run --name offbeat-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=offbeat_dev \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Generate Prisma Client:

```bash
pnpm prisma:generate
```

### Run Migrations:

```bash
pnpm --filter @offbeat/backend run prisma:migrate
```

### Seed Initial Foundation:

```bash
pnpm db:seed
```

The seed script (`prisma/seed.ts`) is **idempotent** and creates a baseline demo user (`traveler@offbeat.internal`) and profile. Re-running it will safely update or preserve existing records without duplicates.

---

## 5. Development & Scripts

From the repository root or `Backend/` directory:

| Command                                              | Description                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `pnpm --filter @offbeat/backend dev`                 | Start development server with live reload (`tsx watch`) on port 5000 |
| `pnpm --filter @offbeat/backend build`               | Compile TypeScript to `dist/`                                        |
| `pnpm --filter @offbeat/backend start`               | Run compiled production build                                        |
| `pnpm --filter @offbeat/backend test`                | Execute unit, integration, and e2e test suites                       |
| `pnpm --filter @offbeat/backend typecheck`           | Run TypeScript typechecking without emit                             |
| `pnpm --filter @offbeat/backend lint`                | Run ESLint                                                           |
| `pnpm --filter @offbeat/backend run prisma:generate` | Generate Prisma Client from `prisma/schema.prisma`                   |

---

## 6. API Response Contracts

### Standard Success Envelope (`200`, `201`):

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "offbeat-backend",
    "version": "0.1.0",
    "environment": "development",
    "uptimeSeconds": 42,
    "timestamp": "2026-09-28T20:00:00.000Z"
  },
  "meta": {
    "requestId": "req_8c52d8e41bf146a482cf10",
    "timestamp": "2026-09-28T20:00:00.000Z"
  }
}
```

### Standard Error Envelope (`400`, `401`, `403`, `404`, `409`, `429`, `500`):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload or parameters",
    "details": [
      {
        "field": "email",
        "message": "Valid email address is required"
      }
    ]
  },
  "meta": {
    "requestId": "req_8c52d8e41bf146a482cf10",
    "timestamp": "2026-09-28T20:00:00.000Z"
  }
}
```

### Health Check Endpoint:

`GET /api/v1/health`

- Fast, deterministic, and free of external network dependencies.
- Includes response header `X-Request-ID`.

---

## 7. Security Baseline

- **Secrets Server-Side**: External API keys (`SERPAPI_API_KEY`, `GEMINI_API_KEY`), database credentials, and JWT secrets never leak to the client or frontend bundle.
- **Log Redaction**: Automatic contextual filtering of database URLs, passwords, authorization tokens, and API keys.
- **Controlled CORS**: Restricts cross-origin requests to configured frontend origins (`CORS_ORIGIN`).
- **Payload Limits**: Strict 10MB JSON and URL-encoded body limits prevent resource exhaustion attacks.
- **Internal Masking**: Database constraint errors and unhandled exceptions are converted to sanitized application errors; raw SQL queries, stack traces, and database internals are never returned in production responses.
