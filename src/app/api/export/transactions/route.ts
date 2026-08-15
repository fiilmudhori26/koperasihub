import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

  const txs = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: { cashier: true, customer: true },
  });

  const esc = (v: unknown) => {
    const str = String(v ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = ["number", "date", "cashier", "customer", "subtotal", "discount", "total", "paid", "change", "method"];
  const rows = txs.map((t) =>
    [t.number, t.createdAt.toISOString(), t.cashier.name, t.customer?.name ?? "Walk-in", t.subtotal, t.discount, t.total, t.paid, t.change, t.paymentMethod]
      .map(esc)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${Date.now()}.csv"`,
    },
  });
}
