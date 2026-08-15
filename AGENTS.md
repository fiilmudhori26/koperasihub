# AGENTS — KoperasiHub (for AI assistants)

Repo: Next.js 16 App Router, `src/` dir, Prisma 7 + SQLite, JWT cookie auth, Tailwind v4.

## Hard rules
1. **Auth is server-enforced.** Never gate by UI. Call `requirePermission(perm)` at the top of every page that needs a role, and `requireSession()` for any authenticated page. Permissions live in `ROLE_PERMISSIONS` (`src/lib/auth.ts`); nav items in `src/lib/nav.ts`.
2. **All writes go through Server Actions** (`"use server"` files under each route). Client components must not import the Prisma client or the DB.
3. **Stock changes are transactional.** Any code that decrements `Product.stock` must also create an `InventoryMovement` and run inside `prisma.$transaction` (see `processSaleAction`). Never update stock directly elsewhere.
4. **Prisma 7 pattern** — connection URL lives in `prisma.config.ts`, NOT in `schema.prisma`. The client uses the driver adapter in `src/lib/db.ts`. Do not reintroduce `url` into the schema.
5. **SQLite has no ENUM.** `role` / `type` are `String` typed in `src/lib/types.ts`. Keep allowed values there.
6. **Personalized pages must be dynamic.** Pages reading cookies/session/DB are marked `export const dynamic = "force-dynamic"` to avoid prerender errors.

## Conventions
- Server Components query Prisma directly; Client Components receive plain serializable props.
- Money stored as integer (IDR, no fractions). Format with `formatRupiah` (`src/lib/format.ts`).
- File paths use `@/` alias → `src/`.

## Common tasks
- **Add a field:** edit `prisma/schema.prisma` → `npx prisma migrate dev --name <x>` → use it.
- **Add a page:** create under `src/app/(app)/<route>/page.tsx`, add `requirePermission`, add nav item in `src/lib/nav.ts`.
- **Seed/reset:** `npm run db:seed` (clears + reloads demo data).
- **Build/verify:** `npm run build` (runs typecheck).
