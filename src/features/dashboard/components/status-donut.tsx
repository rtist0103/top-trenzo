"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Slice = { label: string; value: number; color: string };
type Props = { data: Slice[] };

export function StatusDonut({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const filled = data.filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex h-45 items-center justify-center text-sm text-muted-foreground">
        No articles yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={filled}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            strokeWidth={2}
            stroke="hsl(var(--card))"
          >
            {filled.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            formatter={(value, name) => [value ?? 0, name ?? ""]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2">
        {data.map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{value}</span>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {total > 0 ? `${Math.round((value / total) * 100)}%` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}