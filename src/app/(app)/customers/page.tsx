import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission("customers");
  const { q } = await searchParams;
  const customers = await prisma.customer.findMany({
    where: q ? { name: { contains: q } } : {},
    orderBy: { totalSpent: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
      <form>
        <input name="q" defaultValue={q} placeholder="Search customers..."
          className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald w-56" />
      </form>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted bg-surface-2">
            <tr>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Phone</th>
              <th className="text-right font-medium px-4 py-3">Orders</th>
              <th className="text-right font-medium px-4 py-3">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatNumber(c.totalOrders)}</td>
                <td className="px-4 py-3 text-right text-emerald">{formatRupiah(c.totalSpent)}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
