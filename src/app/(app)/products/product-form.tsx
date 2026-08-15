"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "./actions";

export function ProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald text-black font-semibold px-4 py-2 text-sm hover:bg-emerald/90 transition">
        + Add Product
      </button>
    );
  }

  return (
    <form action={async (fd) => { await createProductAction(fd); setOpen(false); router.refresh(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Add Product</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-fg">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="name" required placeholder="Name" className="col-span-2 rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald" />
          <input name="sku" placeholder="SKU (auto)" className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald" />
          <select name="categoryId" required defaultValue="" className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald">
            <option value="" disabled>Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="price" type="number" min="0" required placeholder="Price (IDR)" className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald" />
          <input name="costPrice" type="number" min="0" placeholder="Cost (IDR)" className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald" />
          <input name="stock" type="number" min="0" placeholder="Stock" className="rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald" />
        </div>
        <button className="w-full rounded-lg bg-emerald text-black font-semibold py-2.5 text-sm hover:bg-emerald/90 transition">Save</button>
      </div>
    </form>
  );
}
