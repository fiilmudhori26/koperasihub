"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission, Session } from "@/lib/auth";

export type CartLine = { productId: string; name: string; price: number; quantity: number };

// Core business logic: create transaction, items, payment, decrement stock, log movements.
export async function processSaleAction(
  session: Session,
  cart: CartLine[],
  paymentMethod: string,
  paid: number,
  customerId: string | null
) {
  await requirePermission("sales");
  if (!cart.length) return { error: "Cart is empty" };

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const total = subtotal;
  if (paid < total) return { error: "Paid amount is less than total" };

  const last = await prisma.transaction.findFirst({ orderBy: { createdAt: "desc" }, select: { number: true } });
  const seq = (last ? Number(last.number.slice(-3)) : 0) + 1;
  const number = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(seq).padStart(3, "0")}`;

  const result = await prisma.$transaction(async (tx) => {
    const trx = await tx.transaction.create({
      data: {
        number,
        cashierId: session.userId,
        customerId,
        subtotal,
        discount: 0,
        total,
        paid,
        change: paid - total,
        paymentMethod,
        items: {
          create: cart.map((l) => ({
            productId: l.productId,
            name: l.name,
            quantity: l.quantity,
            price: l.price,
            costPrice: 0,
            total: l.price * l.quantity,
          })),
        },
        payments: { create: { method: paymentMethod, amount: paid } },
      },
    });
    for (const l of cart) {
      await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.quantity } } });
      await tx.inventoryMovement.create({
        data: { productId: l.productId, type: "OUT", quantity: -l.quantity, reference: number, userId: session.userId },
      });
    }
    if (customerId) {
      await tx.customer.update({ where: { id: customerId }, data: { totalOrders: { increment: 1 }, totalSpent: { increment: total } } });
    }
    return trx.number;
  });

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/inventory");
  return { ok: true as const, number: result };
}
