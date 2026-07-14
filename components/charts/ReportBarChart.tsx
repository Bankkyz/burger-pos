"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReportRow } from "@/services/reportsService";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatCurrency } from "@/utils/format";

export function ReportBarChart({ rows }: { rows: ReportRow[] }) {
  const { t } = useLanguage();

  if (rows.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-[var(--color-text-muted)]">
        {t.reports.noData}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
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
          formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="revenue" name={t.reports.revenue} fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cost" name={t.reports.cost} fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name={t.reports.expense} fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="netProfit" name={t.reports.netProfit} fill="var(--color-success)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
