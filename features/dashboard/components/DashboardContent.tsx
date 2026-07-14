"use client";

import { DollarSign, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard, StatCardSkeleton } from "@/components/ui/StatCard";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { LowStockAlert } from "@/features/dashboard/components/LowStockAlert";
import { TopSellingList } from "@/features/dashboard/components/TopSellingList";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatCurrency, formatNumber } from "@/utils/format";

export function DashboardContent() {
  const { loading, today, monthlyRevenue, topSelling, lowStock, outOfStock } = useDashboardData();
  const { t } = useLanguage();

  const monthlyRevenueTotal = monthlyRevenue.reduce((sum, p) => sum + p.revenue, 0);
  const stockAlertCount = lowStock.length + outOfStock.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t.dashboard.title}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label={t.dashboard.todaySales} value={formatCurrency(today.sales)} icon={DollarSign} tone="primary" />
            <StatCard label={t.dashboard.todayProfit} value={formatCurrency(today.profit)} icon={TrendingUp} tone="success" />
            <StatCard label={t.dashboard.todayCost} value={formatCurrency(today.cost)} icon={Receipt} tone="warning" />
            <StatCard label={t.dashboard.todayOrders} value={formatNumber(today.orders)} icon={ShoppingBag} tone="primary" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.dashboard.monthlyRevenue}</CardTitle>
            <span className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(monthlyRevenueTotal)}</span>
          </CardHeader>
          <CardContent>
            <RevenueChart data={monthlyRevenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.topSellingMenu}</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSellingList items={topSelling} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.stockAlerts}</CardTitle>
          {stockAlertCount > 0 && (
            <span className="rounded-full bg-[var(--color-danger)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-danger)]">
              {t.dashboard.itemCount(stockAlertCount)}
            </span>
          )}
        </CardHeader>
        <CardContent>
          <LowStockAlert lowStock={lowStock} outOfStock={outOfStock} />
        </CardContent>
      </Card>
    </div>
  );
}
