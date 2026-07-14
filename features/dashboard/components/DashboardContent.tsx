"use client";

import { DollarSign, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard, StatCardSkeleton } from "@/components/ui/StatCard";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { LowStockAlert } from "@/features/dashboard/components/LowStockAlert";
import { TopSellingList } from "@/features/dashboard/components/TopSellingList";
import { formatCurrency, formatNumber } from "@/utils/format";

export function DashboardContent() {
  const { loading, today, monthlyRevenue, topSelling, lowStock, outOfStock } = useDashboardData();

  const monthlyRevenueTotal = monthlyRevenue.reduce((sum, p) => sum + p.revenue, 0);
  const stockAlertCount = lowStock.length + outOfStock.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-muted)]">A live view of today&apos;s performance.</p>
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
            <StatCard label="Today's Sales" value={formatCurrency(today.sales)} icon={DollarSign} tone="primary" />
            <StatCard label="Today's Profit" value={formatCurrency(today.profit)} icon={TrendingUp} tone="success" />
            <StatCard label="Today's Cost" value={formatCurrency(today.cost)} icon={Receipt} tone="warning" />
            <StatCard label="Today's Orders" value={formatNumber(today.orders)} icon={ShoppingBag} tone="primary" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <span className="text-sm font-semibold text-[var(--color-text)]">{formatCurrency(monthlyRevenueTotal)}</span>
          </CardHeader>
          <CardContent>
            <RevenueChart data={monthlyRevenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <TopSellingList items={topSelling} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
          {stockAlertCount > 0 && (
            <span className="rounded-full bg-[var(--color-danger)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-danger)]">
              {stockAlertCount} item{stockAlertCount === 1 ? "" : "s"}
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
