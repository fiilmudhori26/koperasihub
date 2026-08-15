# TECH-STACK — KoperasiHub

## Frontend
- **Next.js 16** (App Router, `src/` dir) — Server Components for data, Server Actions for writes.
- **TypeScript** — strict mode.
- **Tailwind CSS v4** — custom `@theme` tokens, no config file.
- **Recharts** — dashboard & report charts (client components only).

## Backend
- **Next.js Route Handlers + Server Actions** — no separate API server. Business logic in `src/lib/auth.ts`, `src/app/(app)/sales/actions.ts`.

## Database
- **Prisma 7** ORM with the **driver-adapter** model (Prisma 7 requirement).
- **SQLite** locally via `@prisma/adapter-better-sqlite3`. Postgres-ready (swap datasource + `@prisma/adapter-pg`).

## Auth & Security
- **jose** — sign/verify HS256 JWT in an httpOnly, sameSite=lax cookie.
- **bcryptjs** — password hashing (pure-JS, Windows/Node-24 safe).

## Tooling
- `tsx` — run the TypeScript seed script.
- `eslint` / `prettier` — via `next lint` + Next defaults.

## Deliberately NOT included (YAGNI for v1)
- React Hook Form / TanStack Query — native forms + Server Components suffice. Add when client-side caching/mutations get complex.
- shadcn/ui — hand-rolled primitives keep deps minimal.
- Supabase Storage — no file uploads in v1.
- Vitest / Playwright — logic is centralized and typechecked; add e2e when the app grows.

## Why these choices
Prisma 7 drops the old `url`-in-schema model and requires a driver adapter; SQLite + `better-sqlite3` runs with zero external services so the demo works offline. JWT-in-cookie auth avoids an external auth provider while still demonstrating real session + RBAC.
