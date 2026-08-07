# Component Library

> Inventory of every component in `frontend/src/components/`, organized by the feature-first taxonomy defined in [APP_STRUCTURE.md § 4](./APP_STRUCTURE.md#4-component-organization). Each entry documents current props/behavior as implemented — not an aspirational API. Target subfolder locations reference the migration noted in [APP_STRUCTURE.md § 4.3](./APP_STRUCTURE.md#43-current-flat-structure-note); today all components are flat files directly under `src/components/`.

## Table of Contents

- [Overview](#overview)
- [Common Components](#common-components)
- [Dashboard Components](#dashboard-components)
- [Topology Components](#topology-components)
- [Chart Components](#chart-components)
- [AI Components](#ai-components)
- [Layout Components](#layout-components)

## Overview

All 12 existing components are function components with no props (each reads what it needs directly from [`useSimulation()`](./APP_STRUCTURE.md#7-contexts) rather than receiving data via props), with the exception of the private `KPICard` and `MetricRow` sub-components colocated inside `KPIPanel.tsx` and `NodeDetailPanel.tsx` respectively (see [FRONTEND_GUIDELINES.md § 6](./FRONTEND_GUIDELINES.md#6-component-first-development) on colocating small private sub-components). None currently accept external props — every component is a self-contained consumer of `SimulationContext`, which is consistent with the app having exactly one screen today ([DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md)).

`components/ai/`, `components/charts/`, `components/common/`, `components/dashboard/`, `components/layout/`, and `components/topology/` are scaffolded (empty, `.gitkeep` only) — the sections below group today's flat components by their intended target folder.

## Common Components

Target: `components/common/`. Feature-agnostic, reusable primitives per [APP_STRUCTURE.md § 4.2](./APP_STRUCTURE.md#42-shared-vs-feature-components).

### SearchBar

`src/components/SearchBar.tsx` — global node search. Reads `state.nodes` from `useSimulation()`, filters client-side (case-insensitive match on `node_id` or `node_type`), shows up to 5 results in a dropdown. Selecting a result calls a zoom-to-node function retrieved off `window.__heliosZoomToNode` (set by [`NetworkTopology`](#networktopology) — see [§ Topology Components](#topology-components) for the cross-component coupling this implies). No props; closes on outside click via a `mousedown` listener on `document`.

## Dashboard Components

Target: `components/dashboard/`. The core operational panels — KPIs, gauge, event log, alerts, node/edge detail, filters, and simulation transport controls.

### KPIPanel

`src/components/KPIPanel.tsx` — renders a `grid-cols-3` grid of 6 `KPICard`s (private sub-component, same file): Health Score, Latency, Packet Loss, Bandwidth, Power Usage, Availability. Values are derived from `state.healthData` (with a `'--'` placeholder set shown when `null`) plus a `useMemo`-computed average bandwidth across `state.towerData`. Each card's `status` (`'green' | 'yellow' | 'red'`) is computed via one of two local threshold helpers, `getStatus` (lower-is-better metrics: latency, packet loss, power) or `getStatusInverse` (higher-is-better metrics: health score, bandwidth, availability) — see [DESIGN_SYSTEM.md § 4](./DESIGN_SYSTEM.md#4-semantic-colors) for the status-color mapping these feed into.

### HealthGauge

`src/components/HealthGauge.tsx` — circular SVG gauge (170×170, `r=70` stroke-dasharray arc) showing `state.healthData.network_health_score` (defaults to `50` when absent). Color/label (`Healthy` ≥70 green, `Warning` ≥40 yellow, else `Critical` red) computed via `useMemo`. The arc's `stroke-dashoffset` transitions on value change (`0.8s cubic-bezier`), and the whole SVG has a colored `drop-shadow` glow matching gauge state. Wrapped in `glass-card-static` directly by `App.tsx`, not internally.

### EventLog

`src/components/EventLog.tsx` — scrolling feed of `SimulationEvent`s from `useSimulation().events` (capped to the last 50 rendered; the context itself caps stored history at 200 — see [`SimulationContext`](./APP_STRUCTURE.md#7-contexts)). Auto-scrolls to bottom on new events via a `useEffect` + ref. Each row (`.event-item`) shows a severity emoji, monospace timestamp, and message, with a severity-colored left border (see [DESIGN_SYSTEM.md § 4](./DESIGN_SYSTEM.md#4-semantic-colors)). Explicit empty state ("Waiting for simulation data...") when `events.length === 0`.

### FailureAlerts

`src/components/FailureAlerts.tsx` — absolutely positioned, top-right toast-like stack (see [DESIGN_SYSTEM.md § 22](./DESIGN_SYSTEM.md#22-toast-notifications) — this is the current stand-in for the not-yet-built toast pattern). Derives active alerts from `state.failureData` each tick: a tower with `failed === 1` gets an alert if one doesn't already exist for that tower; alerts for towers no longer present are cleared. Each alert is individually dismissible; renders nothing (`return null`) when no towers are failed. Uses `.alert-banner` (pulsing red glow) and `slide-in-right` animation.

### NodeDetailPanel

`src/components/NodeDetailPanel.tsx` — shows detail for `useSimulation().selectedNode`, branching by `selectedNode.type`:

- `tower` — 8 `MetricRow`s (users, bandwidth, latency, packet loss, power, temperature, utilization, computed failure risk) plus a "Traffic Breakdown" sub-section (video/voice/IoT/gaming/emergency) if traffic data exists for that tower.
- `edge` — 5 `MetricRow`s (CPU, GPU, memory, requests/min, latency) from `state.edgeData`.
- `critical` — static descriptive copy (hospital-style critical infrastructure), hardcoded linked-tower badges (`T3`, `T5`, `T7`).
- `core` — static descriptive copy for the central hub node.
- default (`user`) — one line of static descriptive copy.

`MetricRow` (private sub-component) renders a label/value row with an optional colored progress bar (`getBarColor`: green <40%, yellow <70%, red ≥70%). Explicit empty state ("Click a node on the topology to view its details") when nothing is selected. Has a close (`✕`) button that clears `selectedNode`.

### EdgeServerPanel

`src/components/EdgeServerPanel.tsx` — always-on list of all 4 edge servers (`E1`–`E4`, hardcoded IDs), each showing CPU/GPU/memory bars and `requests_per_min` from `state.edgeData`. Skips rendering a card for any edge ID not yet present in the current tick's data (`if (!edge) return null`).

### FilterPanel

`src/components/FilterPanel.tsx` — rendered inside `Header` (see [§ Layout Components](#layout-components)), but is a dashboard-data concern (toggles `useSimulation().filters`), so it targets `dashboard/` rather than `layout/`. Five toggle buttons (Towers, Users, Edges, Critical, Failures) mapped to `FilterState` boolean keys; consumed by [`NetworkTopology`](#networktopology) to include/exclude element categories.

### SimulationControls

`src/components/SimulationControls.tsx` — also rendered inside `Header`, targets `dashboard/` for the same reason as `FilterPanel` (it drives simulation/tick state, not layout chrome). Play/pause (`controls.play` / `controls.pause`), reset (`controls.reset`), a 4-option speed selector (`1x/2x/5x/10x` via `controls.setSpeed`), a progress bar (`state.currentTick / 1000`), and the current simulated timestamp.

## Topology Components

Target: `components/topology/`.

### NetworkTopology

`src/components/NetworkTopology.tsx` — the Cytoscape.js-based network graph; see [VISUALIZATION_GUIDE.md § Topology Visualization](./VISUALIZATION_GUIDE.md#topology-visualization) for the full node/edge visual spec. Notable implementation details relevant to component API/reuse:

- Builds a **synthetic, hardcoded topology** (`buildElements`): 1 core node, 10 towers (`T1`–`T10`) in a semicircle, 4 edge servers (`E1`–`E4`), 1 critical/hospital node, and one user cluster per tower — filtered by `useSimulation().filters`. This is not yet derived from `state.nodes` (the CSV-sourced node list) despite `types/index.ts` defining `NetworkNodeRow` for that purpose — a known gap, tracked in [UI_TASKS.md](./UI_TASKS.md).
- Re-initializes the entire Cytoscape instance (`cy.destroy()` + rebuild) whenever any topology-affecting filter changes, rather than diffing elements — acceptable at current node counts, flagged as a performance consideration if the topology grows significantly (see [FRONTEND_GUIDELINES.md § 21](./FRONTEND_GUIDELINES.md#21-performance-rules)).
- A separate `useEffect` updates heatmap classes (`heatmap-green/yellow/red`) and `failure` state on existing nodes every tick, without rebuilding the graph — this is the per-tick-cheap path.
- Exposes an imperative `zoomToNode` function on `window.__heliosZoomToNode` so [`SearchBar`](#searchbar) (a sibling, unrelated component) can trigger a zoom/select. This is a documented anti-pattern relative to [FRONTEND_GUIDELINES.md § 5](./FRONTEND_GUIDELINES.md#5-clean-architecture-in-helios) (no direct feature-to-feature reach-around) and [§ 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do) (no ambient global state) — the correct fix is lifting this capability into `SimulationContext` or a shared `hooks/useTopologyControls`-style hook so `SearchBar` and `NetworkTopology` communicate through props/context rather than `window`. Flagged here as a known gap rather than silently normalized; see [UI_TASKS.md](./UI_TASKS.md).

## Chart Components

Target: `components/charts/`.

### ChartsPanel

`src/components/ChartsPanel.tsx` — a `grid-cols-4` row of four charts, all built on **Chart.js** via `react-chartjs-2` (not Recharts — see the stack note below):

| Chart | Type | Data source |
|---|---|---|
| `LatencyChart` | Line, filled | `state.healthHistory[].latency_ms` |
| `BandwidthChart` | Line, filled | Per-tick average of `state.towerHistory[].available_bandwidth_mbps` |
| `TrafficServiceChart` | Bar | Current-tick sum of `state.trafficData` by service (video/voice/IoT/gaming/emergency) |
| `TowerUtilChart` | Multi-line (one series per tower) | `state.towerHistory`, utilization derived as `100 - available_bandwidth_mbps` |

All four share a `baseOptions` object (dark tooltip, muted low-opacity gridlines, `Inter` font) — see [DESIGN_SYSTEM.md § 18](./DESIGN_SYSTEM.md#18-charts) for the visual rules this implements.

> **Stack note:** [DESIGN_SYSTEM.md § 18](./DESIGN_SYSTEM.md#18-charts) and [FRONTEND_GUIDELINES.md § 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do) name **Recharts** as the finalized charting dependency; `ChartsPanel.tsx` currently depends on `chart.js` + `react-chartjs-2` instead (both present in `package.json`, Recharts is not yet installed). This is an existing, tracked divergence — do not add further Chart.js-based charts elsewhere in the app, and do not silently migrate this file as a side effect of unrelated work (see [FRONTEND_GUIDELINES.md § 25](./FRONTEND_GUIDELINES.md#25-things-developers-should-never-do)). Migration is tracked in [UI_TASKS.md](./UI_TASKS.md).

## AI Components

Target: `components/ai/`. No components exist here yet — this folder is scaffolded ahead of the Explainable AI module reaching the frontend (see `PROJECT_STATE.md`'s "Explainable AI" module and [APP_STRUCTURE.md § 19](./APP_STRUCTURE.md#19-future-scalability)). [`EventLog`](#eventlog) is the closest existing analog (it renders AI-attributed messages like "AI Rerouting traffic...") but remains classified as a `dashboard/` component today since it's a generic event feed, not an explainability surface — a dedicated reasoning/explanation view would live here instead.

## Layout Components

Target: `components/layout/`. Structural shell, not feature data.

### Header

`src/components/Header.tsx` — fixed `h-16` top bar (`header-gradient` background, see [DESIGN_SYSTEM.md § 12](./DESIGN_SYSTEM.md#12-gradients)). Three-column flex layout: brand mark + [`SearchBar`](#searchbar) (left third), [`FilterPanel`](#filterpanel) (center third), [`SimulationControls`](#simulationcontrols) (right third). No props; purely compositional.

### ParticleBackground

`src/components/ParticleBackground.tsx` — full-viewport fixed `<canvas>` (`z-index: 0`, `pointer-events: none`) running a self-contained `requestAnimationFrame` particle simulation (small cyan dots with proximity-based connecting lines), sized to `particleCount = (width * height) / 18000` and resized on `window.resize`. No props, no dependency on `SimulationContext` — purely decorative ambient texture per [DESIGN_SYSTEM.md § 1](./DESIGN_SYSTEM.md#1-brand-identity) ("quietly alive"). Does not currently respect `prefers-reduced-motion` — flagged in [ACCESSIBILITY.md](./ACCESSIBILITY.md).

---

## Related Documents

| Document | Relationship |
|---|---|
| [APP_STRUCTURE.md](./APP_STRUCTURE.md) | Folder taxonomy this inventory is organized by (§ 4) |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Visual specs each component implements |
| [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md) | How these components compose into the dashboard grid |
| [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md) | Deep detail on `NetworkTopology` and `ChartsPanel` rendering |
| [UI_TASKS.md](./UI_TASKS.md) | Tracked gaps referenced throughout this document (topology data source, `window` global, Chart.js migration) |
