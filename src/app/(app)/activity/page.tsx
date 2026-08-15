import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type Event = { id: string; at: Date; text: string; href: string };

export default async function ActivityPage() {
  await requirePermission("activity");

  const [txs, moves] = await Promise.all([
    prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { cashier: true } }),
    prisma.inventoryMovement.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { product: true, user: true } }),
  ]);

  const events: Event[] = [
    ...txs.map((t) => ({
      id: "t" + t.id,
      at: t.createdAt,
      text: `${t.cashier.name} created transaction ${t.number}`,
      href: `/sales/${t.number}`,
    })),
    ...moves.map((m) => ({
      id: "m" + m.id,
      at: m.createdAt,
      text: `${m.user?.name ?? "System"} ${m.type === "OUT" ? "sold" : m.type === "IN" ? "stocked in" : "adjusted"} ${m.product.name}`,
      href: "/inventory",
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Activity</h1>
      <div className="bg-surface border border-border rounded-xl divide-y divide-border">
        {events.map((e) => (
          <Link key={e.id} href={e.href} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-2/50">
            <span>{e.text}</span>
            <span className="text-xs text-muted">{formatDateTime(e.at)}</span>
          </Link>
        ))}
        {events.length === 0 && <div className="px-4 py-8 text-center text-muted">No activity yet.</div>}
      </div>
    </div>
  );
}
