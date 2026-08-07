# Accessibility

> Accessibility requirements for the HELIOS frontend, and an honest accounting of where the current implementation stands against them. [FRONTEND_GUIDELINES.md § 17](./FRONTEND_GUIDELINES.md#17-accessibility-standards) states the engineering rule; this document is the fuller specification plus current status, referenced by [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) and [ANIMATIONS.md](./ANIMATIONS.md) wherever a visual or motion choice has an accessibility consequence.

## Table of Contents

- [Overview](#overview)
- [Keyboard Navigation](#keyboard-navigation)
- [ARIA Standards](#aria-standards)
- [Color Contrast](#color-contrast)
- [Screen Reader Support](#screen-reader-support)

## Overview

HELIOS is an operations dashboard whose whole premise is legibility under pressure ([FRONTEND_GUIDELINES.md § 3](./FRONTEND_GUIDELINES.md#3-frontend-philosophy)) — accessibility here is not a separate concern from that goal, it's the same goal applied to keyboard-only operators, screen reader users, and anyone with reduced-motion or contrast-sensitivity needs. This document sets the bar the app should meet. Where the current implementation falls short, that is stated explicitly as a gap rather than glossed over — per the root `CLAUDE.md` instruction to never invent or overstate what exists, gaps are tracked in [UI_TASKS.md](./UI_TASKS.md) instead of silently assumed fixed.

## Keyboard Navigation

Requirements:

- Every interactive element (buttons, search input, filter toggles, simulation controls) must be reachable via `Tab` and operable via `Enter`/`Space`, per [FRONTEND_GUIDELINES.md § 17](./FRONTEND_GUIDELINES.md#17-accessibility-standards) — this falls out for free where real `<button>`/`<input>` elements are used, which is the case for essentially every current control (`.sim-btn`, `.speed-btn`, `.filter-toggle`, `.search-input` are all real `<button>`/`<input>` elements, not `<div onClick>`).
- Focus order should follow the visual/logical grid order: Header (brand → search → filters → controls) before the main dashboard grid (KPIs → topology → detail panels → gauge → events → charts), per [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md).
- The Cytoscape.js topology canvas ([`NetworkTopology`](./COMPONENT_LIBRARY.md#networktopology)) is currently mouse/tap-interaction only — node selection has no documented keyboard equivalent. This is a known gap: an operator who cannot use a mouse cannot currently select a topology node to view its detail panel. Tracked in [UI_TASKS.md](./UI_TASKS.md).
- Focus must remain visible at all times (see [Section: Color Contrast](#color-contrast) below on focus rings specifically) — never `outline: none` without a replacement, per [FRONTEND_GUIDELINES.md § 17](./FRONTEND_GUIDELINES.md#17-accessibility-standards).

## ARIA Standards

- Status-bearing elements that convey meaning purely through color or shape (`.indicator-dot`, topology node health, event severity icons) should carry an accessible label (`aria-label`, or adjacent visible text) stating the status in words — e.g. an `.indicator-dot.red` needs to be reachable as "Critical" by assistive tech, not just visually red. Today, most severity is paired with adjacent visible text (KPI card titles, event log messages) which partially satisfies this, but dedicated `aria-label`s on the indicator dots themselves are not yet present — a gap to close incrementally as components are touched, not a blanket retrofit requirement.
- The `SearchBar` results dropdown should be exposed as a listbox pattern (`role="listbox"` / `role="option"`, `aria-activedescendant` or roving `tabindex`) for screen reader and keyboard users; it is currently a plain `<div>` list driven by mouse `onClick` only. Tracked as a gap.
- Live-updating regions that a screen reader user should be informed of — new [`EventLog`](./COMPONENT_LIBRARY.md#eventlog) entries, new [`FailureAlerts`](./COMPONENT_LIBRARY.md#failurealerts) — are candidates for `aria-live="polite"` (events) and `aria-live="assertive"` (critical failure alerts) regions respectively. Neither is currently marked up this way. Given how central both are to the "operator must know what's happening" goal of this app, this is one of the higher-priority gaps in this document — flagged for [UI_TASKS.md](./UI_TASKS.md) rather than fixed silently here.
- Purely decorative elements (`ParticleBackground`'s canvas, emoji used as bullets/icons rather than as meaningful content) should carry `aria-hidden="true"` so screen readers don't attempt to announce them. Not currently applied.

## Color Contrast

- All text/background pairings must meet WCAG AA contrast (4.5:1 for body text, 3:1 for large text/UI components) against the dark palette defined in [DESIGN_SYSTEM.md § 3](./DESIGN_SYSTEM.md#color-system). `--text-primary` (`#f1f5f9`) and `--text-secondary` (`#94a3b8`) against `--bg-primary` (`#060a14`) and glass surfaces have not been formally contrast-audited against this document — treat as presumed-compliant given the near-black background and light text, but not yet verified; a formal audit is a documented gap.
- **Glow is never a substitute for base contrast** — per [DESIGN_SYSTEM.md § 25](./DESIGN_SYSTEM.md#25-dark-theme-rules), the `--glow-cyan`/`--glow-blue` effects exist for emphasis on top of already-sufficient base contrast, not to create contrast that isn't otherwise there.
- **Status color is never the sole carrier of meaning** — this is a hard rule, not a preference (see [DESIGN_SYSTEM.md § 4](./DESIGN_SYSTEM.md#4-semantic-colors) and [FRONTEND_GUIDELINES.md § 17](./FRONTEND_GUIDELINES.md#17-accessibility-standards)). Every current semantic-color usage in the codebase is paired with an icon, shape, or text label (event severity emoji + message text, KPI status dot + numeric value, topology node shape + heatmap color) — new status UI must preserve this pairing.
- **Focus rings**: the established focus treatment (cyan glow + border shift, matching `.search-input:focus`; see [DESIGN_SYSTEM.md § 16](./DESIGN_SYSTEM.md#16-forms)) must remain visible against every surface it can appear on, including glass/translucent panels — verify this specifically when adding a new interactive control on a glass background, since glow can read differently over varying background complexity.

## Screen Reader Support

- Semantic HTML structure (`<header>`, `<main>`, `<button>`) is used at the top level (`Header`, `App.tsx`'s `<main>`), which gives a baseline landmark structure for screen reader navigation. Panel-level `<section>`/`aria-labelledby` labeling (so a screen reader user can jump directly to "Network Topology" or "AI Event Log") is not yet implemented — each panel currently identifies itself only via a visible heading `<span>`, not a programmatically associated one.
- The Cytoscape.js canvas is fundamentally a `<canvas>`-rendered graph with no text alternative — screen reader users currently have no way to perceive topology structure or node status other than via the (also-gapped) node detail panel once a node is somehow selected. A meaningful fix here is a larger, dedicated effort (e.g. an alternate tabular/list view of nodes and their status) rather than an incremental ARIA annotation — recorded here as the single largest accessibility gap in the app, not something to attempt as a quick fix.
- `prefers-reduced-motion` is not currently respected anywhere (see [ANIMATIONS.md](./ANIMATIONS.md)) — `ParticleBackground`'s continuous canvas animation, `pulse-dot`, `pulse-glow`, and all entrance animations run unconditionally. This affects both vestibular-motion-sensitive users and, for `ParticleBackground` specifically, may also be a performance consideration on lower-end hardware.

---

## Related Documents

| Document | Relationship |
|---|---|
| [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) | The engineering-rule-level accessibility requirements (§ 17) this document expands on |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Color, glow, and glass rules with accessibility implications |
| [ANIMATIONS.md](./ANIMATIONS.md) | `prefers-reduced-motion` gap detail |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | Component-level detail behind several gaps referenced above |
| [UI_TASKS.md](./UI_TASKS.md) | Where the gaps identified in this document should be tracked as actionable work |
