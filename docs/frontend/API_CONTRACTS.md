# API Contracts

> The single source of truth for every frontend↔backend contract: endpoints, request/response shapes, base configuration, and error handling. Per the root [`CLAUDE.md`](../../CLAUDE.md) rule and [FRONTEND_GUIDELINES.md § 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do), **no endpoint, schema, or environment variable may be added to frontend code (`src/services/`) unless it is defined here first.** This document is currently a template, not a populated contract — see [Overview](#overview).

## Table of Contents

- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Endpoints](#endpoints)
- [Request/Response Schemas](#requestresponse-schemas)
- [Error Handling](#error-handling)

## Overview

As of this writing, `backend/` contains no implementation (repository scaffolding only — see `PROJECT_STATE.md`'s status table, which marks Backend as 🟨 In Progress with "FastAPI project structure," "REST APIs," and "Database integration" still listed under Pending Tasks). **No backend API currently exists for the frontend to call.** The dashboard's data today comes entirely from static CSV files in `public/data/`, loaded client-side by `utils/csvLoader.ts` into `SimulationContext` — see [APP_STRUCTURE.md § 18](./APP_STRUCTURE.md#18-information-flow-through-the-application).

This document exists so that, per [AGENTS.md](../../AGENTS.md)'s documentation rule ("Whenever API changes: Update api.md"), the frontend team has a single place to define and review the contract *before* `src/services/` (currently scaffolded and empty — see [APP_STRUCTURE.md § 5](./APP_STRUCTURE.md#5-services)) is implemented against it. Every section below is intentionally a template with no invented content, in compliance with the root `CLAUDE.md` instruction to never invent APIs, database tables, or environment variables, and to leave a `TODO` rather than hallucinate.

**Process going forward:** when the backend (`backend/`, per `PROJECT_STATE.md`'s planned FastAPI service) defines a real endpoint, that endpoint is documented here — method, path, request shape, response shape, error cases — in the same change that adds the corresponding `src/services/*.ts` module consuming it. A `services/` module must never be written speculatively ahead of this document.

## Base Configuration

**TODO** — not yet defined. Once a backend exists, this section documents:

- The API base URL and how it's supplied (expected to be a Vite environment variable, e.g. `import.meta.env.VITE_API_BASE_URL` — but the actual variable name is not yet decided and must not be assumed or hardcoded anywhere in frontend code until it is defined here, per the root `CLAUDE.md` rule against inventing environment variables).
- The shared Axios instance configuration referenced in [APP_STRUCTURE.md § 5](./APP_STRUCTURE.md#5-services) (timeouts, default headers, interceptor behavior).
- Authentication scheme, if any (not yet decided — `PROJECT_STATE.md` does not currently describe an auth model for HELIOS).

## Endpoints

**TODO** — no endpoints are defined yet. Candidate resource domains implied by `PROJECT_STATE.md`'s Core Modules (Intent Engine, Network State Intelligence, Prediction Engine, Digital Twin, Decision Engine, Explainable AI) are **not** commitments — they are listed here only as a pointer to where future endpoint groups will likely map, once the backend team defines the actual contract:

| Likely future domain | Corresponding `PROJECT_STATE.md` module | Status |
|---|---|---|
| Network state / topology | Network State Intelligence | Not started |
| Predictions | Prediction Engine | Not started |
| Digital twin state | Digital Twin | Not started |
| Intent submission | Intent Engine | Not started |
| AI reasoning / explanations | Explainable AI | Not started |

No frontend code should assume any of the above will exist in this shape — this table records intent to watch for, not a schema to build against.

## Request/Response Schemas

**TODO** — no schemas are defined yet. When endpoints are added above, each gets a corresponding TypeScript interface in `src/types/` (per [APP_STRUCTURE.md § 11](./APP_STRUCTURE.md#11-types)) and its shape is documented here alongside the endpoint definition, not invented ahead of the backend's actual response shape.

## Error Handling

**TODO** — pending a real backend to define error response shapes against. Once defined, this section documents:

- Standard error response envelope (status codes, error body shape) returned by the FastAPI backend.
- How `services/` normalizes errors before they reach hooks/components, per [APP_STRUCTURE.md § 5](./APP_STRUCTURE.md#5-services) and the general error-handling rules in [FRONTEND_GUIDELINES.md § 18](./FRONTEND_GUIDELINES.md#18-error-handling).

---

## Related Documents

| Document | Relationship |
|---|---|
| [APP_STRUCTURE.md](./APP_STRUCTURE.md) | § 5 defines how `src/services/` will consume the contracts defined here |
| [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) | § 18 error-handling engineering rules; § 25 forbids inventing APIs ahead of this document |
| [AGENTS.md](../../AGENTS.md) | Repository-wide rule requiring this document to be updated whenever the API changes |
| `PROJECT_STATE.md` | Current backend status and the module breakdown this document's placeholder table references |
