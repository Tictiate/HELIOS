# Design System

> The visual language of HELIOS. This document is the source of truth for every color, spacing value, motion curve, and component visual spec used in the frontend. If two engineers implement the same screen independently from this document, the results should be near-identical. Engineering rules for *how* styles are authored (Tailwind usage, custom CSS placement) live in [FRONTEND_GUIDELINES.md § 15](./FRONTEND_GUIDELINES.md#15-styling-rules--tailwind-conventions); this document defines *what* it should look like.

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Design Philosophy](#2-design-philosophy)
3. [Color System](#color-system)
4. [Semantic Colors](#4-semantic-colors)
5. [Typography](#5-typography)
6. [Spacing System](#6-spacing-system)
7. [Grid System & Container Widths](#7-grid-system--container-widths)
8. [Breakpoints](#breakpoints)
9. [Border Radius](#9-border-radius)
10. [Elevation & Shadows](#10-elevation--shadows)
11. [Glassmorphism](#11-glassmorphism)
12. [Gradients](#12-gradients)
13. [Icons](#13-icons)
14. [Cards](#14-cards)
15. [Buttons](#15-buttons)
16. [Forms](#16-forms)
17. [Tables](#17-tables)
18. [Charts](#18-charts)
19. [Network Visualization Styling](#19-network-visualization-styling)
20. [Motion Philosophy & Animation Timing](#20-motion-philosophy--animation-timing)
21. [Interactive States](#21-interactive-states)
22. [Toast Notifications](#22-toast-notifications)
23. [Scrollbars](#23-scrollbars)
24. [Page Layout](#24-page-layout)
25. [Dark Theme Rules](#25-dark-theme-rules)
26. [Future Light Theme Considerations](#26-future-light-theme-considerations)

---

## 1. Brand Identity

HELIOS is a control surface for autonomous infrastructure, not a marketing site or a consumer app. Its visual identity borrows deliberately from the operational-tooling category — **Datadog and Grafana** for information density and status-at-a-glance; **Linear and Stripe Dashboard** for restraint, type discipline, and motion quality; **Apple** for the underlying rigor of spacing and hierarchy; **Cloudflare** for the sense of "planetary-scale infrastructure made legible."

The identity reads as: **dark, precise, quietly alive.** The UI should feel like it's watching a live system breathe — subtle glow and motion communicate that data is real-time, not static — without ever tipping into noise or spectacle.

## 2. Design Philosophy

1. **Dark by default, not dark as decoration.** The dark theme (see [Section 25](#25-dark-theme-rules)) is the primary and currently only supported theme, chosen because NOC/ops dashboards are typically viewed for long sessions on large monitors in low-ambient-light environments.
2. **Color communicates state, not decoration.** Cyan/blue accents mean "system default / informational." Green/yellow/red are reserved exclusively for health and severity semantics (see [Section 4](#4-semantic-colors)). Accent colors are never used arbitrarily to "add variety."
3. **Glow is a signal, not a style.** Glow and pulse effects exist to draw attention to something meaningfully alive: an active alert, a hovered interactive element, a value that just updated. A static, non-meaningful element does not get a glow.
4. **Glass over solid, but never over legibility.** Glassmorphism (Section 11) is used for panel surfaces to create depth and a sense of "floating over live data," but text contrast against glass surfaces must always meet [ACCESSIBILITY.md](./ACCESSIBILITY.md) contrast requirements.
5. **Density with breathing room.** This is a data-dense dashboard by necessity (see [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md)), but density is achieved through disciplined spacing and typographic hierarchy, not by shrinking everything uniformly.

## 3. Color System

The color system is implemented as CSS custom properties on `:root` in `src/index.css` and consumed via `var(--token-name)` (see [FRONTEND_GUIDELINES.md § 15](./FRONTEND_GUIDELINES.md#15-styling-rules--tailwind-conventions)). Do not use raw hex values in component code — reference a token below, and if a needed color has no token yet, add it here and to `index.css` in the same change.

### 3.1 Background Tokens

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#060a14` | App shell background (deepest layer) |
| `--bg-secondary` | `#0a1020` | Secondary surfaces, header gradient base |
| `--bg-card` | `rgba(15, 23, 42, 0.65)` | Base for solid-ish card surfaces prior to glass blur |

### 3.2 Border Tokens

| Token | Value | Usage |
|---|---|---|
| `--border-glow` | `rgba(56, 189, 248, 0.2)` | Hover/active border state on interactive panels |
| `--border-subtle` | `rgba(148, 163, 184, 0.1)` | Default resting border on non-interactive dividers |
| `--glass-border` | `rgba(148, 163, 184, 0.12)` | Default border for glass surfaces |

### 3.3 Accent Tokens

| Token | Value | Role |
|---|---|---|
| `--accent-cyan` | `#22d3ee` | Primary brand accent — default interactive/focus/highlight color |
| `--accent-blue` | `#3b82f6` | Secondary accent — pairs with cyan in gradients, used for informational states |
| `--accent-purple` | `#a78bfa` | Tertiary accent — reserved for AI/reasoning-related UI (see [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md)) |
| `--accent-green` | `#34d399` | Semantic success/healthy only — see [Section 4](#4-semantic-colors) |
| `--accent-yellow` | `#fbbf24` | Semantic warning only |
| `--accent-red` | `#f87171` | Semantic critical/error only |
| `--accent-orange` | `#fb923c` | Semantic elevated-warning, between yellow and red |

### 3.4 Text Tokens

| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#f1f5f9` | Primary readable text, headings, values |
| `--text-secondary` | `#94a3b8` | Secondary text, labels, captions |
| `--text-muted` | `#64748b` | Disabled/tertiary text, placeholders |

### 3.5 Glow Tokens

| Token | Value | Usage |
|---|---|---|
| `--glow-cyan` | `0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.1)` | Primary hover/active glow |
| `--glow-blue` | `0 0 20px rgba(59, 130, 246, 0.3)` | Secondary glow, used on generic `.glass-card` hover |

### 3.6 Glass Tokens

| Token | Value | Usage |
|---|---|---|
| `--glass-bg` | `rgba(15, 23, 42, 0.6)` | Base fill for all glass surfaces |
| `--glass-border` | `rgba(148, 163, 184, 0.12)` | Border for all glass surfaces |

## 4. Semantic Colors

Semantic colors are a strict subset of the accent palette, reserved exclusively for status/health meaning. They must never be repurposed for arbitrary decoration.

| Meaning | Token | Applied via |
|---|---|---|
| Healthy / Success | `--accent-green` | `.status-green`, `.indicator-dot.green`, event severity `success` |
| Warning / Degraded | `--accent-yellow` | `.status-yellow`, `.indicator-dot.yellow`, event severity `warning` |
| Critical / Failure | `--accent-red` | `.status-red`, `.indicator-dot.red`, event severity `critical`, `.alert-banner` |
| Informational | `--accent-blue` | event severity `info`, default panel accents |

Rule: **color is never the sole carrier of status meaning** — see [ACCESSIBILITY.md](./ACCESSIBILITY.md). Every status color pairing must also use an icon, label, or shape (e.g. the pulsing `indicator-dot` shape itself, not just its color).

Severity-to-color mapping must stay identical across every surface that shows severity — dashboard events, alerts, topology node health, and charts. A "critical" state is `--accent-red` everywhere, with no per-component reinterpretation.

## 5. Typography

**Typeface:** `'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif` — Inter as the primary web font, falling back to the platform system font stack for a native, Apple-adjacent feel when Inter hasn't loaded.

### 5.1 Type Scale

| Role | Size | Weight | Usage |
|---|---|---|---|
| Display / Brand | 24px | 800 | App loading screen wordmark ("HELIOS") only |
| H1 | 20px | 700 | Page-level headings (rare — this is a single-dashboard app today) |
| H2 | 16px | 700 | Panel titles (KPI panel, chart panel headers) |
| H3 | 14px | 600 | Sub-section labels within a panel |
| Body | 13px | 500 | Default UI text — buttons, filters, list items |
| Caption | 12px | 500 | Secondary metadata, timestamps, muted labels |
| Micro | 11px | 500–600 | Filter toggles, dense inline badges |

Numeric/data values (KPI figures, metric readouts) should favor a slightly heavier weight (600–700) than surrounding label text to establish clear figure/label hierarchy, consistent with the existing `.detail-metric` pattern.

### 5.2 Font Weights

| Weight | Value | Usage |
|---|---|---|
| Medium | 500 | Default body/UI text |
| Semibold | 600 | Emphasis, sub-headings, data values |
| Bold | 700 | Panel titles, primary headings |
| Extrabold | 800 | Brand wordmark only |

## 6. Spacing System

Spacing follows Tailwind's default 4px-based scale (`1 = 4px`, `2 = 8px`, `3 = 12px`, `4 = 16px`, `6 = 24px`, `8 = 32px`, …). This project does not override Tailwind's spacing scale.

| Context | Typical spacing |
|---|---|
| Dashboard shell padding | `p-4` (16px) |
| Grid gap between panels | `gap-4` (16px) |
| Card internal padding | `14px 16px` (KPI cards), `p-4`–`p-6` for larger panels |
| Inline control padding | `4–8px` vertical, `10–14px` horizontal (buttons, toggles) |
| List item vertical rhythm | `8–10px` per row (`.event-item`, `.detail-metric`) |

Rule: reach for the Tailwind scale before introducing an arbitrary spacing value (see [FRONTEND_GUIDELINES.md § 15](./FRONTEND_GUIDELINES.md#15-styling-rules--tailwind-conventions)).

## 7. Grid System & Container Widths

The dashboard shell is a single full-viewport CSS Grid (`h-screen w-screen`, `overflow: hidden` — this is a fixed operational console, not a scrolling page). The current reference layout (`App.tsx`) uses a 3-column, 3-row asymmetric grid:

```
gridTemplateColumns: 1fr 3fr 1fr
gridTemplateRows:    auto 1fr auto
```

- **Left column (`1fr`):** KPIs (top), Health Gauge (middle), Event Log (bottom)
- **Center column (`3fr`):** Network Topology (spans two rows — the visual focal point)
- **Right column (`1fr`):** Node Detail Panel + Edge Server Panel (stacked, spans two rows)
- **Bottom span:** Charts panel spans the center + right columns

Full rationale and panel-by-panel breakdown lives in [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md). There is currently no marketing/content "container width" concept (`max-w-*` centered content) — the app is a fixed full-bleed console, not a scrolling document. If future non-dashboard pages (e.g. settings, auth) are introduced via [ROUTES.md](./ROUTES.md), they should define their own container width in that context rather than reusing the dashboard grid.

## 8. Breakpoints

Tailwind's default breakpoint scale is used as-is:

| Breakpoint | Min width | Primary use in HELIOS |
|---|---|---|
| `sm` | 640px | Not a primary target — see [FRONTEND_GUIDELINES.md § 16](./FRONTEND_GUIDELINES.md#16-responsive-development) |
| `md` | 768px | Not a primary target |
| `lg` | 1024px | Minimum practically supported width for the dashboard grid |
| `xl` | 1280px | Comfortable dashboard viewing |
| `2xl` | 1536px | NOC-style large monitor, primary target |

HELIOS is designed desktop-first for a control-room/ops-desk context; see [FRONTEND_GUIDELINES.md § 16](./FRONTEND_GUIDELINES.md#16-responsive-development) for the engineering rule.

## 9. Border Radius

| Token concept | Value | Usage |
|---|---|---|
| Small | 6–8px | Small buttons (`.speed-btn`, `.filter-toggle`), search input |
| Medium | 10–12px | Standard controls (`.search-input`), alert banners |
| Large | 14–16px | Cards and panels (`.kpi-card`, `.glass-card`, `.cytoscape-container`) |
| Round | 50% | Indicator dots, avatars/icon badges |

Radius scales with surface size — small controls get small radii, large panels get the largest radius, dots/badges are fully round. Never mix an unrelated radius value into a new component; pick the closest matching tier above.

## 10. Elevation & Shadows

HELIOS does not use traditional drop shadows for elevation (a light-theme convention that reads poorly on a near-black background). Elevation is instead communicated through:

1. **Border brightness** — a resting `--glass-border` vs. an active `--border-glow`.
2. **Glow** — `--glow-cyan` / `--glow-blue` box-shadows substitute for traditional elevation shadows, doubling as both "this is elevated" and "this is active/hover" signals.
3. **Background layering** — `--bg-primary` → `--bg-secondary` → `--glass-bg` forms a light-to-dark-to-translucent stack that reads as depth without literal shadow-casting.

There is no numbered elevation scale (`elevation-1`, `elevation-2`, …) at this time — elevation is binary in practice: resting or glowing/active. If deeper elevation nuance becomes necessary (e.g. modals, popovers), it should extend this section rather than introducing an unrelated shadow system.

## 11. Glassmorphism

Glass is the default surface treatment for panels in HELIOS. Reference implementation (`src/index.css`):

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.3s ease;
}
.glass-card:hover {
  border-color: var(--border-glow);
  box-shadow: var(--glow-blue);
}
```

Rules:

- Blur radius is **16px** for standard panels, **20px** for elevated KPI-style cards (`.kpi-card`) — do not introduce a third blur value without justification.
- Glass surfaces always pair `background` + `backdrop-filter` + `border` together — never blur without the border, and never the border without the translucent background (the combination is what reads as "glass" rather than "faded").
- `.glass-card-static` is used when hover-interactivity is not desired (e.g. a static gauge container) — same visual treatment, no hover transition.
- Glass panels sit above a dark, low-detail background (`--bg-primary` gradient, particle background) — glass is far less legible over a busy background, so background complexity behind glass surfaces must stay restrained.

## 12. Gradients

| Gradient | Definition | Usage |
|---|---|---|
| Header gradient | `linear-gradient(135deg, #060a14 0%, #0a1428 50%, #0f172a 100%)` | App header background |
| Header underline accent | `linear-gradient(90deg, transparent, cyan, blue, purple, transparent)` at 0.5 opacity | 1px accent line beneath header |
| Brand wordmark fill | `linear-gradient(90deg, #22d3ee, #3b82f6)` with `background-clip: text` | "HELIOS" wordmark on loading screen |
| KPI card top accent | `linear-gradient(90deg, transparent, var(--accent-cyan), transparent)` | Appears on `.kpi-card:hover::before` |
| Progress bar fill | `linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))` | `.sim-progress-bar` |
| Alert banner background | `linear-gradient(135deg, rgba(248,113,113,0.15), rgba(239,68,68,0.05))` | `.alert-banner` |

Gradients always move cyan → blue (→ purple for the header accent), reinforcing the brand's primary accent pairing. Gradients are never used for large flat fills — only thin accent lines, text fills, and low-opacity backgrounds.

## 13. Icons

Icons are provided via **React Icons** (finalized stack dependency). Conventions:

- Prefer a single icon family for consistency (e.g. Feather/Fi or Phosphor/Pi sets within `react-icons`) rather than mixing icon families across the app — the specific family choice should be recorded here once selected; until then, treat it as a `TODO` and do not mix families ad hoc.
- Icon color follows the same semantic rules as text/status color (Section 4) — an icon inside a critical alert uses `--accent-red`, not a decorative color.
- Default icon sizing aligns to the type scale it sits beside (e.g. a 13px body-text row uses a ~14–16px icon).
- Icons that convey status (health, severity) are never purely decorative — they must have an accessible label (see [ACCESSIBILITY.md](./ACCESSIBILITY.md)).

## 14. Cards

Two established card variants:

| Variant | Class | Use case |
|---|---|---|
| Standard glass card | `.glass-card` / `.glass-card-static` | General panel containers (topology container, gauge container) |
| KPI card | `.kpi-card` | Compact metric tiles — gradient background, top accent line on hover, lift-on-hover (`translateY(-2px)`) |

Cards never nest another full card treatment directly inside them (no glass-on-glass) — nested content inside a card uses flat backgrounds or the smaller inline treatments (`.detail-metric`, `.event-item`).

## 15. Buttons

Established button variants, from `src/index.css`:

| Variant | Class | Visual | Usage |
|---|---|---|---|
| Simulation control | `.sim-btn` | Glass background, cyan hover glow, distinct `.active` fill | Play/pause/reset-type controls |
| Speed selector | `.speed-btn` | Transparent default, blue hover/active | Compact multi-option selector group |
| Filter toggle | `.filter-toggle` | Transparent, cyan active state | Compact filter chips |

Rules:

- Every button has a resting, hover, and active/selected state at minimum — see [Section 21](#21-interactive-states).
- Primary actions use the cyan accent; there is currently no separate "danger" button variant — a destructive action should be designed using `--accent-red` following the same structural pattern as `.sim-btn`, once one is needed (flag as a gap — see end-of-document review).
- Buttons always show `cursor: pointer` and a transition on interactive properties (border-color, background, box-shadow) — never an instant, jarring state change.

## 16. Forms

There is currently one established form-adjacent control: `.search-input` (rounded, glass-backed, expands on focus with a glow). General rules for future form elements (once needed beyond search):

- Inputs share the same glass/dark surface language as panels (`rgba(15, 23, 42, 0.8)` background, `--glass-border`), not a separate "light input on dark page" pattern.
- Focus state is always a cyan glow + border color shift (`box-shadow: 0 0 15px rgba(34, 211, 238, 0.15)`), matching the existing `.search-input:focus` treatment — this becomes the canonical focus treatment for all future form controls.
- Placeholder text uses `--text-muted`.
- Full form component specs (checkboxes, selects, multi-step forms) are not yet defined — treat as a documented gap (see end-of-document review) until HELIOS has a screen that needs them.

## 17. Tables

No tabular data component exists in the codebase yet (data is currently presented via KPI tiles, gauges, event lists, and charts rather than raw tables). When introduced, tables should:

- Use the same dark/glass surface language as cards, with `--border-subtle` row dividers (matching the existing `.detail-metric` divider pattern).
- Use monospace or tabular-figure numeric alignment for numeric columns, consistent with the precision-instrument feel of the rest of the UI.
- Support the same severity color coding as everywhere else in the app for any status column.

This is a documented gap — flagged for future specification once a concrete table use case exists (see end-of-document review).

## 18. Charts

Charts are rendered via **Recharts** (finalized stack; note the codebase's current in-progress `ChartsPanel.tsx` uses Chart.js/`react-chartjs-2` and is expected to migrate — see [APP_STRUCTURE.md](./APP_STRUCTURE.md) and [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md)). Visual rules, regardless of underlying library:

- Chart line/area colors are drawn from the accent token set (Section 3.3), with semantic colors (Section 4) reserved for threshold lines or anomaly highlighting, not routine series coloring.
- Chart backgrounds are transparent, sitting inside the existing `.glass-card` / `.chart-container` treatment rather than each chart owning its own background.
- Gridlines and axes use `--text-muted` / `--border-subtle` at low opacity — chart chrome must recede behind the data.
- Tooltips follow the same glass surface treatment as cards.
- Full chart-type-by-chart-type guidance (line vs. area vs. bar, when to use each metric) lives in [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md) — this section governs shared visual styling only.

## 19. Network Visualization Styling

Topology rendering uses **Cytoscape.js** inside the `.cytoscape-container` treatment (16px radius, clipped overflow, full bleed within its grid cell). Node/edge visual rules:

- Node color follows `node_type` (`tower`, `edge`, `critical`, `core` — see `types/index.ts`) mapped through the semantic/accent token set; exact per-type color mapping is defined in [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md), not duplicated here.
- Node health/severity is expressed via the same green/yellow/red semantic tokens as the rest of the app (Section 4) — a failing tower must read as visually consistent with a "critical" event in the Event Log, not a different red.
- Selection/hover state on a node uses the cyan glow language (`--glow-cyan`), matching card hover treatment, so that "selected" reads consistently across the whole app.
- Edge (link) styling should stay visually subordinate to nodes — nodes carry the primary status signal.

## 20. Motion Philosophy & Animation Timing

Full animation inventory and implementation guidance lives in [ANIMATIONS.md](./ANIMATIONS.md). Design-level rules:

- Motion in HELIOS communicates **liveness and state change**, never plays purely ornamentally. A value updating, a panel entering, an alert appearing — these earn animation. Static UI does not animate on its own.
- **Timing functions:**
  - Entrances (`slide-up`, `slide-in-right`) use `cubic-bezier(0.16, 1, 0.3, 1)` — a fast-out, gentle-settle curve that feels responsive without overshooting.
  - Hover/interactive transitions use `ease` or `cubic-bezier(0.4, 0, 0.2, 1)` at **0.2–0.3s** — fast enough to feel immediate, slow enough to be perceived as smooth rather than instant.
  - Attention-seeking states (pulse, glow) loop on **1.5–2s** cycles — slow enough to avoid being distracting in peripheral vision during long monitoring sessions.
- **Framer Motion** (finalized stack dependency) should be used for orchestrated, interruptible, or gesture-driven motion (panel mount/unmount transitions, layout animations); the existing CSS `@keyframes` approach remains appropriate for simple, always-running micro-animations (pulsing dots, glow loops) where React involvement isn't needed.

## 21. Interactive States

Every interactive element must define, at minimum:

| State | Visual treatment |
|---|---|
| **Resting** | Base glass/transparent surface, `--text-secondary` or `--text-primary` label |
| **Hover** | Border shifts to `--border-glow` or accent color; glow shadow appears; background tints toward the accent at low opacity |
| **Focus** (keyboard) | Same as hover at minimum, must remain visible — see [ACCESSIBILITY.md](./ACCESSIBILITY.md); never suppressed without replacement |
| **Active/Selected** | Filled accent background at ~10–20% opacity, accent-colored border and text (matching `.sim-btn.active`, `.filter-toggle.active`) |
| **Loading** | See [Section 25 in FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md#19-loading-states) for engineering rule; visually, use the `.loading-ring` spinner for full blocking loads or a lighter inline pulse for partial loads |
| **Empty** | Muted-text message using `--text-muted`, no false chart/table chrome rendered around it |
| **Error** | `--accent-red` accent, following the same visual language as `.alert-banner` for anything beyond an inline field error |
| **Success** | `--accent-green` accent, brief (non-looping) confirmation treatment — avoid a persistent green glow outliving its relevance |
| **Disabled** | Reduced opacity (~40–50%), `--text-muted`, no hover/focus treatment, `cursor: not-allowed` |

## 22. Toast Notifications

No toast/notification-stack component exists in the codebase yet — the current pattern for urgent state is the persistent `.alert-banner` treatment (red gradient, glow pulse) rendered inline at the top of the dashboard (`FailureAlerts.tsx`). When a transient toast pattern is introduced, it should:

- Reuse the glass card surface (Section 11) as its base, with a severity-colored left border or accent following the `.event-item` severity-border pattern rather than inventing a new severity language.
- Enter via `slide-in-right` (already defined in `index.css`) for consistency with the existing motion vocabulary.
- Auto-dismiss for informational/success toasts; persist until manually dismissed for critical/error toasts, consistent with `.alert-banner` behavior.

This is a documented gap — flagged for full specification once a concrete transient-notification use case exists (see end-of-document review).

## 23. Scrollbars

Custom scrollbar styling is defined globally and applies app-wide:

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.4); }
```

Thin (6px), transparent-track, low-contrast-thumb scrollbars that only become prominent on hover — consistent with the "quiet until relevant" motion philosophy (Section 2). This treatment should be used for any future internally-scrolling panel (event logs, long lists) rather than the browser default scrollbar.

## 24. Page Layout

The application shell is a fixed, non-scrolling, full-viewport layout (`h-screen w-screen overflow-hidden`) — HELIOS today is effectively a single operational console screen, not a multi-page scrolling site. A subtle `ParticleBackground` renders behind all content at a low z-index for ambient "system is alive" texture, without competing with foreground data legibility.

As [ROUTES.md](./ROUTES.md) introduces additional routes (via React Router), each route is expected to either:

1. Adopt the same fixed full-viewport console shell (for dashboard-adjacent views), or
2. Explicitly opt into a scrollable document layout (for content-style views, e.g. settings or documentation-style pages), clearly distinguished from the console shell rather than blending the two layout models on one screen.

## 25. Dark Theme Rules

Dark is currently the **only** supported theme, and is not implemented as a "dark mode" toggle over a light default — it is the application's native, hardcoded visual identity (`--bg-primary: #060a14` on `body` unconditionally). Rules:

- All color tokens in Section 3 are defined for this dark palette only; there is no parallel light-mode token set yet.
- Contrast between `--text-primary`/`--text-secondary` and background surfaces must be validated against [ACCESSIBILITY.md](./ACCESSIBILITY.md) contrast requirements — glow effects are not a substitute for base contrast.
- Any new component must be designed against this dark palette first; do not design against a light background and "invert" later.

## 26. Future Light Theme Considerations

A light theme is **not implemented and not currently planned for near-term work**, but the token-based architecture (Section 3) is deliberately structured to make one feasible later without a rewrite:

- Because all color usage flows through CSS custom properties rather than hardcoded values (enforced by [FRONTEND_GUIDELINES.md § 15](./FRONTEND_GUIDELINES.md#15-styling-rules--tailwind-conventions)), a future light theme would primarily mean defining a second token set and a switching mechanism — not rewriting component styles.
- Glassmorphism and glow effects (Sections 10–11) would need dedicated light-theme treatment, since both rely on being visually distinct from a near-black background — a naive value swap would not read correctly on a light surface.
- This section exists to record intent, not to specify an unbuilt system — treat any concrete light-theme work as net-new design work when it is actually scheduled, not an implied extension of this document.

---

## Related Documents

| Document | Relationship |
|---|---|
| [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) | Engineering rules for *how* to implement this system |
| [APP_STRUCTURE.md](./APP_STRUCTURE.md) | Where styling code lives (`src/styles/`, `index.css`) |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | Component-level API built on top of these visual specs |
| [DASHBOARD_LAYOUT.md](./DASHBOARD_LAYOUT.md) | Full grid/panel composition using this system |
| [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md) | Chart- and topology-specific visual detail |
| [ANIMATIONS.md](./ANIMATIONS.md) | Full motion/animation specification |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | Contrast, motion, and status-color accessibility requirements |
