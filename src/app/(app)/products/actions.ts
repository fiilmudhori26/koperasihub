"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function createProductAction(formData: FormData) {
  await requirePermission("products");
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const price = Number(formData.get("price"));
  const costPrice = Number(formData.get("costPrice"));
  const stock = Number(formData.get("stock") ?? 0);
  const sku = String(formData.get("sku") ?? "").trim();

  if (!name || !categoryId || !Number.isFinite(price) || price < 0) return;
  await prisma.product.create({
    data: {
      name,
      sku: sku || `PRD-${Date.now().toString().slice(-6)}`,
      categoryId,
      price: Math.round(price),
      costPrice: Math.round(costPrice) || 0,
      stock: Math.max(0, Math.round(stock)),
      minimumStock: 10,
    },
  });
  revalidatePath("/products");
}
