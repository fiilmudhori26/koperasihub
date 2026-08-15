"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222228" vertical={false} />
        <XAxis dataKey="date" stroke="#8a8a93" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#8a8a93" fontSize={11} tickLine={false} axisLine={false}
          tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} width={48} />
        <Tooltip
          cursor={{ fill: "#17171b" }}
          contentStyle={{ background: "#111114", border: "1px solid #222228", borderRadius: 8, color: "#ededf0" }}
          formatter={(v) => [`Rp${Number(v).toLocaleString("id-ID")}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
