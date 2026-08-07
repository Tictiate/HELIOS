# Visualization Guide

> Detailed rendering conventions for HELIOS's two data-visualization surfaces: the Cytoscape.js network topology and the Chart.js/Recharts chart set. [DESIGN_SYSTEM.md § 18–19](./DESIGN_SYSTEM.md#18-charts) define the shared visual language (color, gridlines, tooltips) these implementations must follow; this document is the chart/topology-specific detail that would otherwise clutter that file.

## Table of Contents

- [Overview](#overview)
- [Topology Visualization](#topology-visualization)
- [Charts](#charts)
- [Color Coding](#color-coding)
- [Interaction Patterns](#interaction-patterns)

## Overview

HELIOS visualizes the simulated network on two axes: **structure** (the topology graph — [`NetworkTopology`](./COMPONENT_LIBRARY.md#networktopology)) and **time** (the chart set — [`ChartsPanel`](./COMPONENT_LIBRARY.md#chartspanel)). Both are driven entirely by `SimulationContext`'s per-tick state and history maps (`state.towerHistory`, `state.healthHistory`, etc. — see [APP_STRUCTURE.md § 7](./APP_STRUCTURE.md#7-contexts)); neither owns its own data-fetching.

## Topology Visualization

Rendered via **Cytoscape.js** with a `preset` (manually positioned, not force-directed) layout — node positions are fixed in code (`buildElements` in `NetworkTopology.tsx`), not computed by a layout algorithm, so the graph reads identically on every load.

### Node Types & Shapes

| `nodeType` | Shape | Fill color | Size | Represents |
|---|---|---|---|---|
| `core` | Circle | `#fb923c` (orange) | 45px | Central network hub ("Control") |
| `tower` | Circle | `#3b82f6` (blue) | 35px | Cell tower (`T1`–`T10`) |
| `edge` | Diamond | `#34d399` (green) | 30px | Edge compute server (`E1`–`E4`) |
| `critical` | Star | `#f87171` (red) | 35px | Critical infrastructure (hospital) |
| `user` | Circle, 70% opacity | `#64748b` (slate) | 20px | User cluster attached to a tower |

Shape is a deliberate second, non-color channel for node identity (circle/diamond/star), consistent with [ACCESSIBILITY.md](./ACCESSIBILITY.md)'s rule that meaning is never color-only.

### Edge Types

| `edgeType` | Style | Represents |
|---|---|---|
| `backbone` | 2.5px, orange-tinted | Core → tower |
| `edge-link` | 1.5px, default gray | Tower → edge server |
| `critical-link` | 2px, dashed, red-tinted | Tower → critical infrastructure |
| `user-link` | 1.5px, default gray | Tower → user cluster |

Edges are always visually subordinate to nodes (thin, low-opacity, `curve-style: bezier`) per [DESIGN_SYSTEM.md § 19](./DESIGN_SYSTEM.md#19-network-visualization-styling) — they exist to show connectivity, not to compete with node status signals.

### Per-Tick Heatmap Overlay

Independent of the static node/edge structure above, every tower node's fill is overridden each tick by a **utilization heatmap** class, computed as `100 - available_bandwidth_mbps`:

| Utilization | Class | Color |
|---|---|---|
| < 40% | `.heatmap-green` | `#34d399` |
| 40–70% | `.heatmap-yellow` | `#fbbf24` |
| ≥ 70% | `.heatmap-red` | `#f87171` |

A tower with `failed === 1` in `state.failureData` instead gets `.failure` (solid `#ef4444`, thick border) and its connected edges get `.failure-edge` (thickened, red-tinted) — failure state takes visual precedence over the heatmap. This overlay is applied in a separate `useEffect` from graph construction, so it updates every tick without rebuilding the Cytoscape instance (see [COMPONENT_LIBRARY.md § NetworkTopology](./COMPONENT_LIBRARY.md#networktopology) for the performance note on why structural rebuilds are filter-gated instead).

### Selection

A `node:selected` style (4px cyan border, `#22d3ee`) is applied on tap/click, matching the app-wide cyan selection language (`--glow-cyan`; see [DESIGN_SYSTEM.md § 19](./DESIGN_SYSTEM.md#19-network-visualization-styling)). Selecting a node updates `SimulationContext`'s `selectedNode`, which [`NodeDetailPanel`](./COMPONENT_LIBRARY.md#nodedetailpanel) reads to render detail. Clicking empty canvas deselects.

### Legend

A static legend is rendered as an absolutely positioned overlay (`bottom-3 left-4`) inside the topology panel, showing the 5 node-type swatches (Core/Tower/Edge/Critical/Users) with their shape reproduced via inline CSS (`border-radius`, `rotate(45deg)`, `clip-path` for the star) rather than an icon font.

## Charts

Rendered via **Chart.js** (`react-chartjs-2`) today — see the stack divergence note in [COMPONENT_LIBRARY.md § Chart Components](./COMPONENT_LIBRARY.md#chart-components); Recharts is the finalized target library and this section should be read as governing chart *content and type selection*, which does not change across that eventual migration.

| Chart | Type | Metric | Why this chart type |
|---|---|---|---|
| Latency vs. Time | Line, filled area, `tension: 0.4` | `latency_ms` from `healthHistory` | A single continuous metric over time — line is the direct read |
| Bandwidth vs. Time | Line, filled area | Average `available_bandwidth_mbps` across towers, per history tick | Same rationale; averaged because per-tower bandwidth is already covered by Tower Utilization below |
| Traffic by Service | Bar, 5 categories | Current-tick sum of video/voice/IoT/gaming/emergency users | Categorical comparison at a single point in time — bar, not line, since there's no time axis |
| Tower Utilization | Multi-line, one series per tower (up to 10) | `100 - available_bandwidth_mbps` per tower, over history | Comparing many entities' trends simultaneously — the only chart with per-entity color coding (see below) |

All history-based charts window to `MAX_HISTORY` (60 ticks — see [APP_STRUCTURE.md § 10](./APP_STRUCTURE.md#10-constants)) via `SimulationContext`, not an unbounded series — consistent with [FRONTEND_GUIDELINES.md § 21](./FRONTEND_GUIDELINES.md#21-performance-rules).

**Choosing a chart type for new visualizations:** line for a continuous metric over time; bar for a categorical comparison at a point in time; avoid pie/donut charts (not used anywhere in HELIOS — a NOC dashboard favors charts that are scannable at a glance and comparable across panels, and proportional area comparisons read slower under time pressure per [FRONTEND_GUIDELINES.md § 3](./FRONTEND_GUIDELINES.md#3-frontend-philosophy)).

## Color Coding

Two independent color systems are in play, and new visualization work must not conflate them:

1. **Semantic/status color** ([DESIGN_SYSTEM.md § 4](./DESIGN_SYSTEM.md#4-semantic-colors)) — green/yellow/red always mean healthy/warning/critical, everywhere: topology heatmap, KPI status dots, event severity, alert banners. A red tower on the topology and a red "critical" event in the log must be the *same* red for the *same* reason class.
2. **Series/category color** — used only when distinguishing *different things of the same kind* that have no inherent health meaning: the 5 traffic-service-type bars (video/voice/IoT/gaming/emergency, from the accent palette — purple/blue/cyan/yellow/red) and the up-to-10 per-tower lines in Tower Utilization (a fixed 10-color rotation: `#22d3ee, #3b82f6, #a78bfa, #34d399, #fbbf24, #f87171, #fb923c, #e879f9, #6366f1, #14b8a6`). These colors identify *which* series, not *how healthy* it is — do not read meaning into which tower got which color; the assignment is index-order, not semantic.

Rule: before adding a new color-coded visualization, decide which system it belongs to. If a value can be "bad," it uses semantic color. If it's just "this one vs. that one," it uses the series rotation.

## Interaction Patterns

| Interaction | Surface | Behavior |
|---|---|---|
| Click/tap a node | Topology | Selects it (`SimulationContext.setSelectedNode`), populates `NodeDetailPanel`, applies cyan selection border |
| Click empty canvas | Topology | Clears selection |
| Search + select a result | `SearchBar` → Topology | Animates pan/zoom to the node (`cy.animate`, 500ms) and selects it — see the `window.__heliosZoomToNode` coupling flagged in [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md#networktopology) |
| Toggle a filter chip | `FilterPanel` → Topology | Rebuilds the graph excluding/including that node category (towers/users/edges/critical); heatmap/failure overlays reapply after rebuild |
| Toggle "Failures" filter | `FilterPanel` → Topology | Gates whether `.failure` / `.failure-edge` classes are applied at all, independent of the heatmap |
| Hover a chart point | Charts | Chart.js default tooltip, styled per [DESIGN_SYSTEM.md § 18](./DESIGN_SYSTEM.md#18-charts) (dark glass tooltip, `Inter` font) |
| Zoom / pan | Topology | Native Cytoscape user zoom/pan enabled (`minZoom: 0.3`, `maxZoom: 3`); charts have no zoom/pan interaction |

There is currently no cross-highlighting between the topology and charts (e.g. hovering a tower's line in Tower Utilization does not highlight that tower on the graph) — a plausible future enhancement, not yet implemented; treat as a gap rather than an intentional omission if picked up (see [UI_TASKS.md](./UI_TASKS.md)).

---

## Related Documents

| Document | Relationship |
|---|---|
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Shared visual language (§ 18–19) this guide implements in detail |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | `NetworkTopology` and `ChartsPanel` component-level API and known gaps |
| [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md) | Where these two panels sit in the overall grid |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | Why shape/label always accompanies color in the topology legend |
