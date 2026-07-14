"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyRevenuePoint } from "@/services/dashboardService";
import { formatCurrency, formatDate } from "@/utils/format";

export function RevenueChart({ data }: { data: DailyRevenuePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--color-text-muted)]">
        No sales recorded this month yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => formatDate(value, { day: "numeric", month: "short" })}
          stroke="var(--color-text-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--color-text-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatCurrency(value).replace(/\.00$/, "")}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            fontSize: 13,
          }}
          labelFormatter={(value) => formatDate(String(value))}
          formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
        />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" fill="url(#revenueFill)" strokeWidth={2} />
        <Area type="monotone" dataKey="profit" name="Profit" stroke="var(--color-success)" fill="url(#profitFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
