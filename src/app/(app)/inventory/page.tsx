import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber, formatDateTime, formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPE_COLOR: Record<string, string> = {
  IN: "text-emerald",
  OUT: "text-amber",
  ADJUSTMENT: "text-fg",
  RETURN: "text-emerald",
};

export default async function InventoryPage() {
  await requirePermission("inventory");

  const [movements, lowStock] = await Promise.all([
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { product: true, user: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: prisma.product.fields.minimumStock } },
      include: { category: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Inventory</h1>

      {lowStock.length > 0 && (
        <div className="bg-amber/10 border border-amber/30 rounded-xl p-4">
          <div className="text-sm font-medium text-amber mb-2 flex items-center gap-2">⚠ Low Stock</div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="text-xs bg-surface-2 border border-border rounded-full px-3 py-1">
                {p.name} · {formatNumber(p.stock)} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-medium text-muted">Inventory History</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted bg-surface-2">
            <tr>
              <th className="text-left font-medium px-4 py-3">Product</th>
              <th className="text-left font-medium px-4 py-3">Type</th>
              <th className="text-right font-medium px-4 py-3">Quantity</th>
              <th className="text-left font-medium px-4 py-3">Reference</th>
              <th className="text-left font-medium px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movements.map((m) => (
              <tr key={m.id} className="hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium">{m.product.name}</td>
                <td className={`px-4 py-3 font-medium ${TYPE_COLOR[m.type] ?? ""}`}>{m.type}</td>
                <td className="px-4 py-3 text-right">{m.quantity > 0 ? `+${formatNumber(m.quantity)}` : formatNumber(m.quantity)}</td>
                <td className="px-4 py-3 text-muted">{m.reference ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{formatDateTime(m.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
