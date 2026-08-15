import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatRupiah, formatNumber } from "@/lib/format";
import { createProductAction } from "./actions";
import { ProductForm } from "./product-form";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  await requirePermission("products");
  const { q, cat } = await searchParams;

  const where = {
    ...(q ? { name: { contains: q } } : {}),
    ...(cat ? { categoryId: cat } : {}),
  };
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Products</h1>
        <ProductForm categories={categories} />
      </div>

      <form className="flex gap-2 flex-wrap">
        <input name="q" defaultValue={q} placeholder="Search products..."
          className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald w-56" />
        <select name="cat" defaultValue={cat ?? ""}
          className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="rounded-lg bg-surface-2 border border-border px-4 py-2 text-sm hover:border-emerald transition">Filter</button>
      </form>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted bg-surface-2">
            <tr>
              <th className="text-left font-medium px-4 py-3">Product</th>
              <th className="text-left font-medium px-4 py-3">SKU</th>
              <th className="text-left font-medium px-4 py-3">Category</th>
              <th className="text-right font-medium px-4 py-3">Price</th>
              <th className="text-right font-medium px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-2/50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted">{p.sku}</td>
                <td className="px-4 py-3 text-muted">{p.category.name}</td>
                <td className="px-4 py-3 text-right">{formatRupiah(p.price)}</td>
                <td className={`px-4 py-3 text-right ${p.stock <= p.minimumStock ? "text-amber" : ""}`}>{formatNumber(p.stock)}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
