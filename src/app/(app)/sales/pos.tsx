"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { processSaleAction } from "./actions";
import type { Session } from "@/lib/auth";

type Product = { id: string; name: string; price: number; stock: number };
type Customer = { id: string; name: string };

export function Pos({ products, customers, session }: { products: Product[]; customers: Customer[]; session: Session }) {
  const [cart, setCart] = useState<Record<string, { product: Product; qty: number }>>({});
  const [query, setQuery] = useState("");
  const [paid, setPaid] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) && p.stock > 0),
    [products, query]
  );

  const total = useMemo(
    () => Object.values(cart).reduce((s, l) => s + l.product.price * l.qty, 0),
    [cart]
  );
  const paidNum = Number(paid) || 0;
  const change = Math.max(0, paidNum - total);

  function add(product: Product) {
    setCart((c) => {
      const existing = c[product.id];
      const qty = (existing?.qty ?? 0) + 1;
      if (qty > product.stock) return c;
      return { ...c, [product.id]: { product, qty } };
    });
  }
  function setQty(id: string, qty: number, stock: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = { product: c[id].product, qty: Math.min(qty, stock) };
      return next;
    });
  }

  async function checkout() {
    const lines = Object.values(cart).map((l) => ({ productId: l.product.id, name: l.product.name, price: l.product.price, quantity: l.qty }));
    const res = await processSaleAction(session, lines, "CASH", paidNum, customerId || null);
    if ("error" in res) { setMsg(res.error ?? "Sale failed"); return; }
    setMsg(`Sale ${res.number} processed. Change ${formatRupiah(change)}`);
    setCart({}); setPaid(""); setCustomerId("");
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product..."
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2.5 text-sm outline-none focus:border-emerald" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => add(p)} disabled={p.stock <= 0}
              className="text-left bg-surface border border-border rounded-xl p-3 hover:border-emerald transition disabled:opacity-40">
              <div className="font-medium text-sm">{p.name}</div>
              <div className="text-emerald text-sm mt-1">{formatRupiah(p.price)}</div>
              <div className="text-xs text-muted">stock {p.stock}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-sm text-muted col-span-full">No products match.</div>}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 space-y-4 h-fit lg:sticky lg:top-5">
        <h2 className="font-semibold">Cart</h2>
        <div className="space-y-2 max-h-64 overflow-auto">
          {Object.values(cart).map((l) => (
            <div key={l.product.id} className="flex items-center justify-between text-sm gap-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{l.product.name}</div>
                <div className="text-xs text-muted">{formatRupiah(l.product.price)}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setQty(l.product.id, l.qty - 1, l.product.stock)} className="w-6 h-6 rounded bg-surface-2 border border-border">−</button>
                <span className="w-6 text-center">{l.qty}</span>
                <button onClick={() => setQty(l.product.id, l.qty + 1, l.product.stock)} className="w-6 h-6 rounded bg-surface-2 border border-border">+</button>
              </div>
            </div>
          ))}
          {Object.keys(cart).length === 0 && <div className="text-sm text-muted">Cart empty.</div>}
        </div>

        <div className="border-t border-border pt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">Total</span><span className="font-semibold">{formatRupiah(total)}</span></div>
          {customerId && <div className="text-xs text-muted">Customer: {customers.find(c => c.id === customerId)?.name}</div>}
        </div>

        <input inputMode="numeric" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="Paid (IDR)"
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald" />
        {paidNum > total && <div className="text-xs text-muted">Change: {formatRupiah(change)}</div>}

        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
          className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-emerald">
          <option value="">Walk-in customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button onClick={checkout} disabled={Object.keys(cart).length === 0 || paidNum < total}
          className="w-full rounded-lg bg-emerald text-black font-semibold py-2.5 text-sm hover:bg-emerald/90 transition disabled:opacity-40">
          Process Payment
        </button>
        {msg && <div className="text-xs text-center text-emerald">{msg}</div>}
      </div>
    </div>
  );
}
