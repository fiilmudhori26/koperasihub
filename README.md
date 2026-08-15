# KoperasiHub

A role-based **inventory & point-of-sale platform** for cooperatives / mini-markets. Built to demonstrate a complete full-stack product: authentication, RBAC, product/inventory management, transaction processing, customer tracking, analytics dashboards, and reporting.

> **Live demo accounts** (password: `password123`)
> - Admin: `admin@koperasihub.demo`
> - Manager: `manager@koperasihub.demo`
> - Cashier: `cashier@koperasihub.demo`

---

## Features

- **Authentication** — email + password, JWT session cookies, bcrypt password hashing, protected routes.
- **Role-Based Access Control** — `ADMIN`, `MANAGER`, `CASHIER` with per-page permission enforcement.
- **Dashboard** — live revenue, transaction count, product count, low-stock count, revenue chart, top products, recent transactions.
- **Product Management** — create, search, filter by category, stock levels, low-stock highlighting.
- **Inventory** — movement history (`IN` / `OUT` / `ADJUSTMENT` / `RETURN`) with low-stock alerts. Stock is decremented atomically when a sale is processed.
- **POS / Sales** — cart-based point-of-sale: search products, build cart, take payment, auto-decrement stock, log `OUT` movements, link customer.
- **Customers** — list, search, lifetime order count & spend (updated on each sale).
- **Reports** — revenue per day, revenue by category, top products, aggregate stats.
- **Users & Settings** — admin-only user list and database summary.

## Tech Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Prisma ORM · SQLite (driver adapter) · jose (JWT) · bcryptjs · Recharts.

## Local Development

```bash
npm install
cp .env.example .env          # defaults work out of the box
npx prisma migrate dev        # creates SQLite db + tables
npm run db:seed               # loads demo data (3 users, 10 cats, 50 products, 100 customers, 500 tx, ~1000 movements)
npm run dev                   # http://localhost:3000
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build + typecheck |
| `npm run start` | Serve the production build |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

## Architecture

Server Components render data from Prisma directly; Server Actions handle writes (product create, sale processing, auth). A JWT in an httpOnly cookie drives the session. See `DATABASE.md`, `PRD.md`, `DESIGN.md`, `TECH-STACK.md`, `AGENTS.md`, `IMPLEMENTATION-PLAN.md`.

## Switching to PostgreSQL (production)

1. Set `DATABASE_URL="postgresql://user:pass@host:5432/koperasihub?schema=public"`.
2. In `prisma/schema.prisma`, the `Role`/`MovementType` fields are `String` (SQLite has no ENUM). On Postgres you can promote them to real `Enum` types, or leave as `String` (recommended — zero code change).
3. Swap the driver adapter in `src/lib/db.ts` to `@prisma/adapter-pg` + `pg`.
4. `npx prisma migrate dev`.

## CV blurb

> **KoperasiHub — Full Stack Inventory & POS Platform.** Built a role-based inventory and point-of-sale platform using Next.js, TypeScript, Prisma, SQLite, and JWT auth. Implemented transaction processing with atomic stock updates, inventory movement tracking, RBAC, an analytics dashboard, and reporting.

Tech: `Next.js · TypeScript · Prisma · SQLite · JWT · Tailwind`
