# DATABASE — KoperasiHub

Engine: **SQLite** via Prisma 7 driver adapter (`@prisma/adapter-better-sqlite3`). Postgres is a one-line datasource + adapter swap (see README).

## Schema

```
User (id, name, email UNIQUE, passwordHash, role:String, createdAt)
Category (id, name, createdAt)
Product (id, name, sku UNIQUE, description?, categoryId→Category, price, costPrice, stock, minimumStock, image?, createdAt, updatedAt)
Customer (id, name, phone?, email?, address?, totalOrders, totalSpent, createdAt)
Transaction (id, number UNIQUE, cashierId→User, customerId?→Customer, subtotal, discount, total, paid, change, paymentMethod, createdAt)
TransactionItem (id, transactionId→Transaction, productId→Product, name, quantity, price, costPrice, total)
InventoryMovement (id, productId→Product, type:String, quantity, reference?, userId→User, createdAt)
Payment (id, transactionId→Transaction, method, amount, createdAt)
```

> `Role` and `MovementType` are `String` (SQLite lacks ENUM). Allowed values are typed in `src/lib/types.ts` (`ROLES`, `MOVEMENT_TYPES`) and constrained in `ROLE_PERMISSIONS` (`src/lib/auth.ts`). On Postgres, promote to `Enum` if desired — no app code change required.

## Seed volumes
`prisma/seed.ts` clears and loads: **3 users, 10 categories, 50 products, 100 customers, 500 transactions, ~1.500 transaction items, ~1.000 inventory movements.** Run: `npm run db:seed`.

## Data consistency rules
- A sale's stock decrement and `OUT` movements run inside `prisma.$transaction` — all-or-nothing.
- `Transaction.total` = `subtotal - discount`; `change` = `paid - total`.
- `Customer.totalSpent`/`totalOrders` increment on each linked sale.

## Inspecting the DB
```bash
npm run db:studio          # Prisma Studio GUI
# or raw (better-sqlite3)
node -e "const D=require('better-sqlite3');const db=new D('./prisma/dev.db');console.log(db.prepare('select count(*) from \"Transaction\"').get());db.close()"
```
