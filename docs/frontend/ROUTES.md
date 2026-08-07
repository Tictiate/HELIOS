# Routes

> The route map and navigation structure for the HELIOS frontend. [APP_STRUCTURE.md § 12](./APP_STRUCTURE.md#12-routing-organization) defines *where* routing code will live (`src/app/`, `src/routes/`, `src/pages/`) and the dependency shape; this document is the actual route table and navigation rules — and, today, a record of the fact that routing does not yet exist.

## Table of Contents

- [Overview](#overview)
- [Route Map](#route-map)
- [Route Guards](#route-guards)
- [Navigation Structure](#navigation-structure)

## Overview

**React Router is not yet installed** (`react-router-dom` is absent from `frontend/package.json`, despite being a finalized stack dependency per [FRONTEND_GUIDELINES.md § 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do)) and **no routing exists in the application today.** `App.tsx` renders exactly one implicit "route": the full operational dashboard described in [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md), unconditionally. `src/routes/` and `src/pages/` are scaffolded (empty, `.gitkeep` only).

This document records the current state (a single implicit route) and the routing structure `App.tsx` is expected to grow into per [APP_STRUCTURE.md § 12](./APP_STRUCTURE.md#12-routing-organization), without inventing routes ahead of an actual product decision to build them — per the root [`CLAUDE.md`](../../CLAUDE.md) instruction against inventing APIs/structure that doesn't exist yet, applied here to routes.

## Route Map

| Path | Page component | Status |
|---|---|---|
| `/` (implicit — the entire app) | `Dashboard` (defined inline in `App.tsx`, not yet extracted to `pages/DashboardPage.tsx`) | **Live.** The only screen that exists. |

No other paths are defined. When `react-router-dom` is introduced, the first concrete step is mechanical, not additive: wrap the existing `Dashboard` render in a `<BrowserRouter>` + a single `<Route path="/" element={<DashboardPage />} />`, with `Dashboard`'s current JSX moved verbatim into `src/pages/DashboardPage.tsx` — this is a refactor of the existing screen into the routing structure, not the addition of new screens. Any *additional* route beyond `/` (e.g. a settings page, or a dedicated Explainable AI view referenced speculatively in [APP_STRUCTURE.md § 19](./APP_STRUCTURE.md#19-future-scalability)) is future product scope, not committed here — do not scaffold page components for routes that have not been decided.

## Route Guards

None exist, because no routes exist. Once routing is introduced, [APP_STRUCTURE.md § 12](./APP_STRUCTURE.md#12-routing-organization) designates `src/routes/` as the home for any route guards (e.g. gating a future settings/auth-adjacent route). `PROJECT_STATE.md` does not currently describe an authentication or authorization model for HELIOS, so no guard logic should be written speculatively — if/when auth is decided, the guard contract is documented here alongside the route it protects.

## Navigation Structure

There is currently no navigation UI (no nav bar, no route links) because there is nowhere to navigate to — `Header` ([COMPONENT_LIBRARY.md § Layout Components](./COMPONENT_LIBRARY.md#layout-components)) contains search, filters, and simulation controls, not route navigation. Once a second route exists, this section documents:

- Where primary navigation lives in the UI (e.g. added to `Header`, or a new dedicated nav element).
- Whether selected-node state, active filters, or the current simulation tick should be reflected in the URL (see [FRONTEND_GUIDELINES.md § 14](./FRONTEND_GUIDELINES.md#14-state-management-rules), which already anticipates URL state as tier 3 of the state-ownership hierarchy, for exactly this future need — e.g. a shareable/bookmarkable link to a specific selected node).

Until a second route is actually built, this section stays a placeholder rather than a speculative design.

---

## Related Documents

| Document | Relationship |
|---|---|
| [APP_STRUCTURE.md](./APP_STRUCTURE.md) | § 12 defines where routing code lives and its dependency shape; § 20 defines the lazy-loading strategy that applies once routes exist |
| [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md) | The one existing "route" — the dashboard itself |
| [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) | § 14 on URL as a state-ownership tier |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | `Header`, the current home for all interactive controls in the absence of navigation |
