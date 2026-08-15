import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatNumber } from "@/lib/format";
import { RevenueChart } from "./revenue-chart";

export const dynamic = "force-dynamic";

async function metrics() {
  const [revenueAgg, txCount, productCount, lowStock, topProducts, recent, cats] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { total: true }, _count: true }),
    prisma.transaction.count(),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lte: prisma.product.fields.minimumStock } } }),
    prisma.transactionItem.groupBy({
      by: ["name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { cashier: true },
    }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
  ]);

  // revenue per day (last 14 days)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const txByDay = await prisma.transaction.groupBy({
    by: ["createdAt"],
    _sum: { total: true },
    where: { createdAt: { gte: days[0] } },
  });
  const byDayMap = new Map(txByDay.map((t) => [t.createdAt.toISOString().slice(0, 10), t._sum.total ?? 0]));
  const revenueSeries = days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    return { date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }), revenue: byDayMap.get(key) ?? 0 };
  });

  return {
    revenue: revenueAgg._sum.total ?? 0,
    txCount,
    productCount,
    lowStock,
    topProducts,
    recent,
    revenueSeries,
    catCount: cats.length,
  };
}

export default async function DashboardPage() {
  await requirePermission("dashboard");
  const m = await metrics();

  const cards = [
    { label: "Total Revenue", value: formatRupiah(m.revenue), accent: "text-emerald" },
    { label: "Transactions", value: formatNumber(m.txCount), accent: "text-fg" },
    { label: "Products", value: formatNumber(m.productCount), accent: "text-fg" },
    { label: "Low Stock", value: formatNumber(m.lowStock), accent: "text-amber" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border rounded-xl p-4">
            <div className="text-sm text-muted">{c.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${c.accent}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-muted mb-4">Revenue (last 14 days)</h2>
          <RevenueChart data={m.revenueSeries} />
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-muted mb-4">Top Products</h2>
          <ol className="space-y-3">
            {m.topProducts.map((p, i) => (
              <li key={p.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-muted w-4">{i + 1}.</span>
                  {p.name}
                </span>
                <span className="text-muted">{formatNumber(p._sum.quantity ?? 0)} sold</span>
              </li>
            ))}
            {m.topProducts.length === 0 && <li className="text-sm text-muted">No sales yet.</li>}
          </ol>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-muted mb-4">Recent Transactions</h2>
        <div className="divide-y divide-border">
          {m.recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <div className="font-medium">{t.number}</div>
                <div className="text-xs text-muted">{t.cashier.name} · {new Date(t.createdAt).toLocaleString("id-ID")}</div>
              </div>
              <div className="font-medium text-emerald">{formatRupiah(t.total)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
