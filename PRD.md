# PRD — KoperasiHub

## Problem
Cooperatives and small mini-markets run daily operations on paper or spreadsheets: stock gets out of sync, sales aren't tied to inventory, and there's no view of performance. KoperasiHub consolidates product catalog, stock, sales, customers, and reporting into one role-aware app.

## Goals
1. Let a cashier record sales fast without touching inventory admin.
2. Keep stock accurate automatically as sales happen.
3. Give managers/admins a real-time view of revenue and performance.
4. Enforce who can do what via roles.

## Users & Roles

| Role | Can access |
|------|-----------|
| ADMIN | everything: products, inventory, sales, customers, reports, users, settings |
| MANAGER | dashboard, products, inventory, sales, reports |
| CASHIER | sales (POS), customers |

Permissions are enforced server-side in `src/lib/auth.ts` (`requirePermission`) — never trust the UI to hide buttons.

## Core Flows

### Authentication
- `POST /login` (Server Action) → verify bcrypt hash → sign JWT → set httpOnly cookie.
- Every protected page calls `getSession()` / `requirePermission()`; unauthenticated → redirect `/login`, unauthorized → 307 away.

### Point of Sale (the critical path)
```
add product to cart
  → cart state (client)
process payment
  → transaction.service / processSaleAction:
      1. create Transaction + TransactionItems + Payment
      2. decrement each Product.stock (inside $transaction)
      3. create InventoryMovement OUT per line
      4. increment Customer.totalOrders / totalSpent
  → revalidate dashboard / inventory / sales
```

### Inventory
- Every stock change is an `InventoryMovement` row (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`).
- Sale creates `OUT`. Stock-in / adjustments create `IN` / `ADJUSTMENT`.
- Low-stock = `stock <= minimumStock`; surfaced on dashboard + inventory page.

## Out of scope (v1)
Forgot/reset password email, multi-branch, supplier purchase orders, file uploads, CSV/PDF export. These are documented as future work, not built.

## Success Criteria
- Recruiter can log in with a demo account and process a sale.
- Stock decreases and an `OUT` movement appears in inventory.
- Dashboard revenue/charts reflect the new sale after refresh.
- A cashier cannot reach `/users` or `/reports`.
