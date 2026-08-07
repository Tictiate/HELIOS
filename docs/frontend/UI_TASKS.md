# UI Tasks

> Tracked frontend work: structural migrations, documented gaps, and cleanups that are deliberately *not* being done as side effects of unrelated changes (per [FRONTEND_GUIDELINES.md § 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do) and [APP_STRUCTURE.md § 4.3](./APP_STRUCTURE.md#43-current-flat-structure-note)). Each item below was surfaced while writing the rest of `docs/frontend/` against the current codebase — this is a snapshot as of 2026-08-07, not a live-synced backlog; update it as items are picked up or new gaps are found.

## Table of Contents

- [Overview](#overview)
- [Backlog](#backlog)
- [In Progress](#in-progress)
- [Completed](#completed)

## Overview

Items are grouped by rough theme. Each links back to the document where the gap was identified in full detail, so this file stays a index/tracker rather than duplicating the explanation.

## Backlog

### Structure & Architecture

- **Migrate flat `components/*.tsx` into feature subfolders** (`dashboard/`, `topology/`, `charts/`, `layout/`, `common/`) per the target mapping in [APP_STRUCTURE.md § 1](./APP_STRUCTURE.md#1-complete-folder-structure) and [§ 4.3](./APP_STRUCTURE.md#43-current-flat-structure-note).
- **Consolidate `src/context/` and `src/contexts/`** onto a single naming convention (recommendation: `contexts/`, plural) — see [APP_STRUCTURE.md § 7](./APP_STRUCTURE.md#7-contexts).
- **Extract `Dashboard` out of `App.tsx` into `pages/DashboardPage.tsx`** and wire up `react-router-dom` (not yet installed) per [APP_STRUCTURE.md § 12](./APP_STRUCTURE.md#12-routing-organization) and [ROUTES.md](./ROUTES.md).

### Known Anti-Patterns

- **Remove the `window.__heliosZoomToNode` global** used to let `SearchBar` trigger `NetworkTopology`'s zoom — a direct violation of the no-ambient-global-state and no-feature-reach-around rules ([FRONTEND_GUIDELINES.md § 5](./FRONTEND_GUIDELINES.md#5-clean-architecture-in-helios), [§ 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do)). Replace with a context-exposed or hook-exposed `zoomToNode` capability. See [COMPONENT_LIBRARY.md § NetworkTopology](./COMPONENT_LIBRARY.md#networktopology).
- **`NetworkTopology`'s graph is hardcoded** (`buildElements` in `NetworkTopology.tsx`) rather than derived from `state.nodes` (`NetworkNodeRow[]`, already loaded from `public/data/network_nodes.csv`). See [COMPONENT_LIBRARY.md § NetworkTopology](./COMPONENT_LIBRARY.md#networktopology).

### Stack Alignment

- **Migrate `ChartsPanel.tsx` from Chart.js/`react-chartjs-2` to Recharts**, the finalized charting dependency per [DESIGN_SYSTEM.md § 18](./DESIGN_SYSTEM.md#18-charts) and [FRONTEND_GUIDELINES.md § 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do). See [COMPONENT_LIBRARY.md § Chart Components](./COMPONENT_LIBRARY.md#chart-components).
- **Install and adopt the remaining finalized-but-unused stack dependencies** as their use cases arrive: `react-router-dom` ([ROUTES.md](./ROUTES.md)), `axios` ([API_CONTRACTS.md](./API_CONTRACTS.md), [APP_STRUCTURE.md § 5](./APP_STRUCTURE.md#5-services)), `framer-motion` ([ANIMATIONS.md](./ANIMATIONS.md)), `react-icons` ([DESIGN_SYSTEM.md § 13](./DESIGN_SYSTEM.md#13-icons) — icon family TBD).

### Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for full detail on each of these:

- Add `aria-live` regions to `EventLog` (polite) and `FailureAlerts` (assertive).
- Add a keyboard-operable equivalent to topology node selection (currently mouse/tap only).
- Convert `SearchBar`'s results dropdown to a proper listbox pattern (`role="listbox"`/`role="option"`).
- Gate all animations (`pulse-dot`, `pulse-glow`, entrances, `ParticleBackground`) behind `prefers-reduced-motion`.
- Formal WCAG AA contrast audit of `--text-primary`/`--text-secondary` against dark/glass surfaces.
- `aria-hidden="true"` on purely decorative elements (`ParticleBackground` canvas, decorative emoji).

### Design System Gaps

Documented as open in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) itself — flagged here so they're trackable as work, not just prose:

- No "danger" button variant yet (§ 15).
- Form component specs beyond `.search-input` (checkboxes, selects) undefined (§ 16).
- No table component/spec exists (§ 17).
- No toast/notification-stack pattern beyond `.alert-banner` (§ 22).
- React Icons family not yet chosen (§ 13).

### Interaction Enhancements

- Cross-highlighting between `ChartsPanel`'s Tower Utilization series and the corresponding topology node — not implemented today. See [VISUALIZATION_GUIDE.md § Interaction Patterns](./VISUALIZATION_GUIDE.md#interaction-patterns).
- Explicit narrow-viewport collapse behavior for the dashboard grid (currently compresses rather than reflows). See [DASHBOARD_LAYOUT.md § Responsive Behavior](./DASHBOARD_LAYOUT.md#responsive-behavior).

## In Progress

Per `PROJECT_STATE.md`'s status table, Frontend is 🟨 In Progress overall. The dashboard shell, KPI/health/event/detail/edge panels, topology rendering, and chart panel are functionally built (see [FRONTEND_PROGRESS.md](./FRONTEND_PROGRESS.md)); the items above are what remains to bring the implementation in line with the documented architecture and stack.

## Completed

- Core operational dashboard: KPI panel, health gauge, network topology, node detail panel, edge server panel, event log, failure alerts, chart panel, header (search/filters/simulation controls).
- `SimulationContext`-driven tick/playback simulation reading synthetic CSV datasets.
- `docs/frontend/` documentation set (this document and its siblings).

---

## Related Documents

Every document in `docs/frontend/` contributed at least one item above — see individual entries for links back to the specific section that identified each gap.
