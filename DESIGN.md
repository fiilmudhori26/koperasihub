# DESIGN — KoperasiHub

## Visual language
Dark-premium SaaS. No purple/blue AI clichés; **emerald `#10B981`** (primary/positive) + **amber `#F59E0B`** (warning/low-stock) on a near-black surface.

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#0a0a0b` | page background |
| `--color-surface` | `#111114` | cards, sidebar |
| `--color-surface-2` | `#17171b` | inputs, table header |
| `--color-border` | `#222228` | hairline borders |
| `--color-muted` | `#8a8a93` | secondary text |
| `--color-fg` | `#ededf0` | primary text |
| `--color-emerald` | `#10b981` | primary, revenue, positive |
| `--color-amber` | `#f59e0b` | low-stock, alerts |

## Type & layout
- System font stack (no web-font network dependency at build).
- Tailwind v4 with a custom `@theme` block (`src/app/globals.css`).
- Fixed left sidebar (desktop) + top bar; responsive (sidebar hidden < md).
- Cards = `bg-surface border border-border rounded-xl`. Tables = hairline-divided rows.

## Components
UI is hand-rolled (no shadcn install) to keep the dependency surface minimal:
- `RevenueChart` / `ReportsChart` — Recharts bar charts (client components).
- `Pos` — cart + product grid (client component), talks to `processSaleAction`.
- `ProductForm` — modal create form (client), posts to `createProductAction`.

## Accessibility basics
Semantic `<table>`, labeled `<input>`s, focus rings on interactive elements (`focus:border-emerald`), sufficient contrast on dark surfaces.
