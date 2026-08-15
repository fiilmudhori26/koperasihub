import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function TransactionDetail({ params }: { params: Promise<{ number: string }> }) {
  await requirePermission("sales");
  const { number } = await params;
  const tx = await prisma.transaction.findUnique({
    where: { number },
    include: { cashier: true, customer: true, items: true, payments: true },
  });
  if (!tx) return <div className="p-8 text-muted">Transaction not found.</div>;

  return (
    <div className="invoice max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link href="/sales" className="text-sm text-emerald hover:underline">← Back to POS</Link>
        <PrintButton />
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="text-lg font-semibold">KoperasiHub</div>
            <div className="text-sm text-muted">INVOICE</div>
          </div>
          <div className="text-right">
            <div className="font-medium">{tx.number}</div>
            <div className="text-xs text-muted">{formatDateTime(tx.createdAt)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 text-sm border-b border-border">
          <div>
            <div className="text-muted text-xs">Cashier</div>
            <div>{tx.cashier.name}</div>
          </div>
          <div className="text-right">
            <div className="text-muted text-xs">Customer</div>
            <div>{tx.customer?.name ?? "Walk-in"}</div>
          </div>
        </div>

        <table className="w-full text-sm my-4">
          <thead className="text-xs text-muted">
            <tr>
              <th className="text-left font-medium py-2">Product</th>
              <th className="text-right font-medium py-2">Qty</th>
              <th className="text-right font-medium py-2">Price</th>
              <th className="text-right font-medium py-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tx.items.map((it) => (
              <tr key={it.id}>
                <td className="py-2">{it.name}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">{formatRupiah(it.price)}</td>
                <td className="py-2 text-right">{formatRupiah(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-sm border-t border-border pt-4 w-56 ml-auto">
          <Row label="Subtotal" value={formatRupiah(tx.subtotal)} />
          {tx.discount > 0 && <Row label="Discount" value={`-${formatRupiah(tx.discount)}`} />}
          <Row label="Total" value={formatRupiah(tx.total)} bold />
          <Row label="Paid" value={formatRupiah(tx.paid)} />
          <Row label="Change" value={formatRupiah(tx.change)} />
          <div className="text-xs text-muted pt-1">Method: {tx.paymentMethod}</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
