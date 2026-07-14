"use client";

import { Download, FileText, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { ReportBarChart } from "@/components/charts/ReportBarChart";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { dateRangeForPeriod, REPORT_PERIODS, type ReportPeriod, useReport } from "@/features/reports/hooks/useReport";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/utils/cn";
import { downloadCsv } from "@/utils/exportCsv";
import { downloadReportPdf } from "@/utils/exportPdf";
import { formatCurrency, formatDate } from "@/utils/format";

export function ReportContent() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<ReportPeriod>("Daily");
  const { rows, totals, loading } = useReport(period);
  const { start, end } = dateRangeForPeriod(period);
  const subtitle = `${formatDate(start)} - ${formatDate(new Date(end.getTime() - 1))}`;

  function exportCsv() {
    downloadCsv(
      `report-${period.toLowerCase()}.csv`,
      [t.reports.colPeriod, t.reports.revenue, t.reports.cost, t.reports.profit, t.reports.expense, t.reports.netProfit],
      rows.map((r) => [r.label, r.revenue, r.cost, r.profit, r.expense, r.netProfit]),
    );
  }

  // PDF export always uses English labels: jsPDF's built-in fonts don't include
  // Thai glyphs, and embedding a custom font just for export is out of scope —
  // the CSV/Excel export above fully supports Thai text instead.
  function exportPdf() {
    downloadReportPdf({
      title: `${period} Report`,
      subtitle,
      summary: [
        { label: "Revenue", value: totals.revenue },
        { label: "Cost", value: totals.cost },
        { label: "Profit", value: totals.profit },
        { label: "Expense", value: totals.expense },
        { label: "Net Profit", value: totals.netProfit },
      ],
      columns: ["Period", "Revenue", "Cost", "Profit", "Expense", "Net Profit"],
      rows: rows.map((r) => [
        r.label,
        formatCurrency(r.revenue),
        formatCurrency(r.cost),
        formatCurrency(r.profit),
        formatCurrency(r.expense),
        formatCurrency(r.netProfit),
      ]),
      filename: `report-${period.toLowerCase()}.pdf`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t.reports.title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" />
            {t.reports.exportExcel}
          </Button>
          <Button variant="secondary" onClick={exportPdf} disabled={rows.length === 0}>
            <FileText className="h-4 w-4" />
            {t.reports.exportPdf}
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] p-1 w-fit">
        {REPORT_PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              "rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors",
              period === p ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-muted)]",
            )}
          >
            {t.reports.periods[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label={t.reports.revenue} value={formatCurrency(totals.revenue)} icon={TrendingUp} tone="primary" />
            <StatCard label={t.reports.cost} value={formatCurrency(totals.cost)} icon={Receipt} tone="warning" />
            <StatCard label={t.reports.profit} value={formatCurrency(totals.profit)} icon={TrendingUp} tone="success" />
            <StatCard label={t.reports.expense} value={formatCurrency(totals.expense)} icon={Wallet} tone="danger" />
            <StatCard
              label={t.reports.netProfit}
              value={formatCurrency(totals.netProfit)}
              icon={totals.netProfit >= 0 ? TrendingUp : TrendingDown}
              tone={totals.netProfit >= 0 ? "success" : "danger"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.reports.overview}</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportBarChart rows={rows} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.reports.breakdown}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.reports.colPeriod}</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.reports.revenue}</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.reports.cost}</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.reports.profit}</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.reports.expense}</th>
                    <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.reports.netProfit}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-[var(--color-text-muted)]">
                        {t.reports.noData}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.bucketStart} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text)]">{row.label}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-[var(--color-text)]">{formatCurrency(row.revenue)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-[var(--color-text-muted)]">{formatCurrency(row.cost)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-[var(--color-text)]">{formatCurrency(row.profit)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-[var(--color-text-muted)]">{formatCurrency(row.expense)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-[var(--color-text)]">
                          {formatCurrency(row.netProfit)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
