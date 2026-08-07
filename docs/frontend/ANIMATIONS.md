# Animations

> Full motion inventory for HELIOS. [DESIGN_SYSTEM.md § 20](./DESIGN_SYSTEM.md#20-motion-philosophy--animation-timing) sets the design-level philosophy and timing rules; this document catalogs every currently implemented animation and gives the engineering pattern for adding new ones.

## Table of Contents

- [Overview](#overview)
- [Motion Principles](#motion-principles)
- [Framer Motion Usage](#framer-motion-usage)
- [Transition Patterns](#transition-patterns)

## Overview

All motion currently in the codebase is implemented as CSS `@keyframes` and Tailwind/transition classes in `src/index.css` — **Framer Motion is a finalized stack dependency (see `FRONTEND_GUIDELINES.md § 25`) but is not yet installed or used anywhere in the codebase.** This document therefore has two parts: the CSS animation inventory that exists today, and the intended division of labor once Framer Motion is introduced.

## Motion Principles

Restated from [DESIGN_SYSTEM.md § 20](./DESIGN_SYSTEM.md#20-motion-philosophy--animation-timing) for quick reference while implementing:

1. **Motion signals liveness and state change, never decoration.** A value updating, a panel entering, an alert appearing earn animation. Static UI does not animate on its own.
2. **Entrances** use `cubic-bezier(0.16, 1, 0.3, 1)` — fast-out, gentle-settle.
3. **Hover/interactive transitions** use `ease` or `cubic-bezier(0.4, 0, 0.2, 1)` at 0.2–0.3s.
4. **Attention-seeking loops** (pulse, glow) run on 1.5–2s cycles — slow enough not to distract during long monitoring sessions.
5. Animations use GPU-friendly properties (`transform`, `opacity`) — never animate `width`/`height`/`top`/`left` in a loop (see [FRONTEND_GUIDELINES.md § 21](./FRONTEND_GUIDELINES.md#21-performance-rules)).

## Current Animation Inventory

All defined in `src/index.css`:

| Keyframe / class | Duration & easing | Applied to | Purpose |
|---|---|---|---|
| `slide-in-right` / `.animate-slide-in-right` | 0.4s `cubic-bezier(0.16, 1, 0.3, 1)` | [`NodeDetailPanel`](./COMPONENT_LIBRARY.md#nodedetailpanel) mount, [`FailureAlerts`](./COMPONENT_LIBRARY.md#failurealerts) entry, `SearchBar` results dropdown | Panel/toast entrance from the right |
| `slide-up` / `.animate-slide-up` | 0.5s `cubic-bezier(0.16, 1, 0.3, 1)` | `.event-item` (each new [`EventLog`](./COMPONENT_LIBRARY.md#eventlog) row) | Row entrance from below |
| `fade-in` / `.animate-fade-in` | 0.5s `ease-out` | `SearchBar` results dropdown | Simple opacity entrance |
| `pulse-dot` | 2s `ease-in-out infinite` | `.indicator-dot` (all KPI/status dots) | Attention-seeking loop marking a live status indicator |
| `pulse-glow` | 1.5–2s `ease-in-out infinite` | `.alert-banner` | Urgent, looping glow on active failure alerts |
| `value-update` / `.animate-value-update` | 0.8s `ease-out` | KPI card values, `MetricRow` values (keyed by value, so React remounts the span on change) | Brief cyan flash-to-normal on a metric updating, communicating "this just changed" |
| `spin` | 1s `linear infinite` | `.loading-ring` | Full-page loading spinner |

Implicit (non-keyframe) transitions, defined via CSS `transition` rather than `@keyframes`, follow the same timing rules and are documented per-component in [DESIGN_SYSTEM.md § 21](./DESIGN_SYSTEM.md#21-interactive-states) (hover/focus/active states on `.glass-card`, `.kpi-card`, `.sim-btn`, etc.) and in [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md) (Cytoscape zoom animation, `stroke-dashoffset` transition on `HealthGauge`, chart `animation: { duration: 300 }`).

## Framer Motion Usage

Not yet used — `framer-motion` is not present in `package.json`. Once introduced, per [DESIGN_SYSTEM.md § 20](./DESIGN_SYSTEM.md#20-motion-philosophy--animation-timing) it is reserved for:

- **Orchestrated or interruptible sequences** — e.g. a future multi-step panel transition, or an alert stack where items need to animate out of the list (height collapse) rather than simply disappear.
- **Layout animations** (`layout` prop / `AnimatePresence`) — e.g. animating `NodeDetailPanel` in and out as `selectedNode` changes, replacing today's plain conditional render with no exit animation.
- **Gesture-driven motion** — drag, press feedback beyond CSS `:active`, if introduced.

The existing CSS `@keyframes` approach (Current Animation Inventory above) remains correct for simple, always-running, non-interruptible micro-animations (`pulse-dot`, `pulse-glow`, `spin`) where mounting a JS animation library adds no value — do not port these to Framer Motion reflexively when it lands. The dividing line: if an animation needs to know about React lifecycle (enter/exit, interruption, sequencing with other animations), it's a Framer Motion candidate; if it just loops forever while an element exists, it stays CSS.

## Transition Patterns

Guidance for adding a new animation to this codebase:

1. **Reuse an existing keyframe/class before adding a new one.** An entrance is `slide-in-right`, `slide-up`, or `fade-in` — pick by direction, don't invent a fourth entrance curve without a documented reason.
2. **Match duration to the table above** for the animation's category (entrance ≈0.4–0.5s, loop ≈1.5–2s, hover ≈0.2–0.3s) rather than picking an arbitrary value.
3. **New named classes go in `src/index.css`** (or `src/styles/` once that split happens — see [APP_STRUCTURE.md § 13](./APP_STRUCTURE.md#13-styling-organization)), following the existing `@keyframes name { … } .animate-name { animation: name … ; }` pairing.
4. **Every looping/attention animation must have a reason** per [DESIGN_SYSTEM.md § 2](./DESIGN_SYSTEM.md#2-design-philosophy) rule 3 ("glow is a signal, not a style") — if you can't state what state change it's communicating, it shouldn't loop.
5. **Respect `prefers-reduced-motion`.** No current animation in `index.css` is gated behind this media query — this is a tracked accessibility gap, not an intentional decision; see [ACCESSIBILITY.md](./ACCESSIBILITY.md) and [UI_TASKS.md](./UI_TASKS.md). New animation work should add the gate for the styles it touches rather than waiting for a dedicated retrofit pass.

---

## Related Documents

| Document | Relationship |
|---|---|
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Motion philosophy and timing rules (§ 20) this inventory implements |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | Components each animation is applied to |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | `prefers-reduced-motion` requirement |
| [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) | Performance rules for animated properties (§ 21) |
