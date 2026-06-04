"use client";

import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Props = {
  data: { date: string; articles: number }[];
};

const CHART_COLOR = "#6366f1";

export function PublishingChart({ data }: Props) {
  const hasData = data.some((d) => d.articles > 0);

  if (!hasData) {
    return (
      <div className="flex h-45 items-center justify-center text-sm text-muted-foreground">
        No published articles in the last 30 days.
      </div>
    );
  }

  const tickFormatter = (_: string, index: number) =>
    index % 5 === 0 ? data[index]?.date ?? "" : "";

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="articleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={CHART_COLOR} stopOpacity={0.5} />
            <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={tickFormatter}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          itemStyle={{ color: CHART_COLOR }}
          formatter={(value) => [value ?? 0, "Articles"]}
        />
        <Area
          type="monotone"
          dataKey="articles"
          stroke={CHART_COLOR}
          strokeWidth={2.5}
          fill="url(#articleGradient)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0, fill: CHART_COLOR }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}