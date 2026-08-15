import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePermission("settings");
  const [users, products, categories, customers, transactions, movements] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.customer.count(),
    prisma.transaction.count(),
    prisma.inventoryMovement.count(),
  ]);

  const rows = [
    { label: "Users", value: formatNumber(users) },
    { label: "Categories", value: formatNumber(categories) },
    { label: "Products", value: formatNumber(products) },
    { label: "Customers", value: formatNumber(customers) },
    { label: "Transactions", value: formatNumber(transactions) },
    { label: "Inventory Movements", value: formatNumber(movements) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-muted mb-4">Database Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="text-sm text-muted">{r.label}</div>
              <div className="text-xl font-semibold mt-1">{r.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-5 text-sm text-muted space-y-2">
        <p>Engine: Next.js (App Router) · Prisma + SQLite (driver adapter)</p>
        <p>Auth: JWT session cookies (jose) · bcrypt password hashing</p>
        <p>Re-seed demo data: <code className="text-fg">npm run db:seed</code></p>
      </div>
    </div>
  );
}
