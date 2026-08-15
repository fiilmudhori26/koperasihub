"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#60a5fa", "#a78bfa", "#f472b6", "#34d399", "#fb923c"];

export function ReportsChart({ data, variant }: { data: { date: string; revenue: number }[] | { name: string; value: number }[]; variant?: "cat" }) {
  const isCat = variant === "cat";
  const dataKey = isCat ? "value" : "revenue";
  const axisKey = isCat ? "name" : "date";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data as any} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222228" vertical={false} />
        <XAxis dataKey={axisKey} stroke="#8a8a93" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#8a8a93" fontSize={11} tickLine={false} axisLine={false}
          tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} width={48} />
        <Tooltip cursor={{ fill: "#17171b" }}
          contentStyle={{ background: "#111114", border: "1px solid #222228", borderRadius: 8, color: "#ededf0" }}
          formatter={(v) => [`Rp${Number(v).toLocaleString("id-ID")}`, isCat ? "Revenue" : "Revenue"]} />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {(data as any[]).map((_, i) => (
            <Cell key={i} fill={isCat ? COLORS[i % COLORS.length] : "#10b981"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
