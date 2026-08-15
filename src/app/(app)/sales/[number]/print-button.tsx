"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-emerald text-black font-semibold px-4 py-2 text-sm hover:bg-emerald/90 transition"
    >
      Print / Save PDF
    </button>
  );
}
