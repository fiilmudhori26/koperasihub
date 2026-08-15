# IMPLEMENTATION-PLAN — KoperasiHub

## Phase 1 — Scaffold
- [x] Next.js 16 (TS, Tailwind, src dir, `@/*` alias). Deps: prisma, @prisma/client, @prisma/adapter-better-sqlite3, better-sqlite3, bcryptjs, jose, recharts, clsx, tsx.

## Phase 2 — Database + Prisma 7
- [x] `prisma/schema.prisma` (User, Category, Product, Customer, Transaction, TransactionItem, InventoryMovement, Payment).
- [x] `prisma.config.ts` holds the URL; `src/lib/db.ts` wires the SQLite driver adapter.
- [x] `npx prisma migrate dev --name init` → `prisma/dev.db`.

## Phase 3 — Authentication
- [x] `src/lib/auth.ts`: bcrypt verify, jose sign/verify, httpOnly cookie, `getSession` / `requireSession` / `requirePermission` / `login` / `logout`.
- [x] `/login` page + `loginAction` server action; `/` redirects to dashboard or login.

## Phase 4 — RBAC
- [x] `ROLE_PERMISSIONS` map; sidebar filtered by `navForRole`; every protected page calls `requirePermission`.

## Phase 5 — Products + Categories
- [x] `/products`: search + category filter + `createProductAction` + `ProductForm` modal.

## Phase 6 — Inventory
- [x] `/inventory`: movement history + low-stock alert. OUT movements created on sale.

## Phase 7 — POS / Transactions
- [x] `/sales`: `Pos` client component (cart) → `processSaleAction` (atomic stock decrement + OUT movements + customer increment) → recent transactions list.

## Phase 8 — Customers
- [x] `/customers`: list + search + lifetime orders/spend.

## Phase 9 — Dashboard
- [x] `/dashboard`: revenue, tx count, product count, low-stock, revenue chart, top products, recent transactions.

## Phase 10 — Reports
- [x] `/reports`: revenue/day, revenue by category, top products, aggregates.

## Phase 11 — Users + Settings
- [x] `/users` (admin), `/settings` (admin): DB summary.

## Phase 12 — Seed
- [x] `prisma/seed.ts`: 3 users / 10 cats / 50 products / 100 customers / 500 tx / ~1.5k items / ~1k movements.

## Phase 13 — Docs
- [x] README, PRD, DATABASE, DESIGN, TECH-STACK, AGENTS, IMPLEMENTATION-PLAN.

## Phase 14 — Verify
- [x] `npm run build` passes (typecheck + 11 routes).
- [x] Runtime smoke test: login → dashboard shows seeded revenue (Rp 44.3M); cashier → 307 away from `/users`.

## Not built (future work, per YAGNI)
- Forgot/reset password email flow
- Supplier purchase orders / stock-in UI
- CSV / PDF export
- File/image uploads (Supabase Storage)
- Playwright e2e + Vitest unit tests
- Postgres deployment + Vercel
