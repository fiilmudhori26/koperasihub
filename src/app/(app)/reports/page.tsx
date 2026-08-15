import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatNumber } from "@/lib/format";
import { ReportsChart } from "./reports-chart";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePermission("reports");

  const [agg, byDay, byCategory, topProducts] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { total: true }, _avg: { total: true }, _count: true }),
    prisma.transaction.groupBy({ by: ["createdAt"], _sum: { total: true } }),
    prisma.transactionItem.groupBy({
      by: ["productId"],
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.transactionItem.groupBy({ by: ["name"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
  ]);

  // revenue per day (last 30 days)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const dayMap = new Map(byDay.map((t) => [t.createdAt.toISOString().slice(0, 10), t._sum.total ?? 0]));
  const series = days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    return { date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }), revenue: dayMap.get(key) ?? 0 };
  });

  // revenue by category (join product -> category)
  const productIds = byCategory.map((b) => b.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: { select: { name: true } } },
  });
  const catMap = new Map(products.map((p) => [p.id, p.category.name]));
  const catRevenue = new Map<string, number>();
  for (const b of byCategory) {
    const cat = catMap.get(b.productId) ?? "Other";
    catRevenue.set(cat, (catRevenue.get(cat) ?? 0) + (b._sum.total ?? 0));
  }
  const catSeries = [...catRevenue.entries()].map(([name, value]) => ({ name, value }));

  const revenue = agg._sum.total ?? 0;
  const count = agg._count;
  const avg = Math.round(agg._avg.total ?? 0);

  const stats = [
    { label: "Revenue", value: formatRupiah(revenue) },
    { label: "Transactions", value: formatNumber(count) },
    { label: "Avg Order", value: formatRupiah(avg) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
        <a href="/api/export/transactions"
          className="rounded-lg bg-surface-2 border border-border px-4 py-2 text-sm hover:border-emerald transition">Export CSV</a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
            <div className="text-sm text-muted">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-muted mb-4">Revenue per day</h2>
          <ReportsChart data={series} />
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-muted mb-4">Revenue by category</h2>
          <ReportsChart data={catSeries} variant="cat" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-sm font-medium text-muted mb-4">Top Products</h2>
        <ol className="space-y-3">
          {topProducts.map((p, i) => (
            <li key={p.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><span className="text-muted w-4">{i + 1}.</span>{p.name}</span>
              <span className="text-muted">{formatNumber(p._sum.quantity ?? 0)} sold</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
