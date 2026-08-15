import { requirePermission, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { Pos } from "./pos";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const session = await requirePermission("sales");
  const [products, customers, recent] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true, price: true, stock: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 200 }),
    prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 12, include: { cashier: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">POS / Sales</h1>
      <Pos products={products} customers={customers} session={session} />

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-muted mb-3">Recent Transactions</h2>
        <div className="divide-y divide-border">
          {recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
              <Link href={`/sales/${t.number}`} className="min-w-0">
                <div className="font-medium">{t.number}</div>
                <div className="text-xs text-muted">{t.cashier.name} · {formatDateTime(t.createdAt)}</div>
              </Link>
              <div className="font-medium text-emerald">{formatRupiah(t.total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
