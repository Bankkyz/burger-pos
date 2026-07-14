"use client";

import { Boxes, PackageX, Search, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { StockMovementList } from "@/features/inventory/components/StockMovementList";
import { StockTable } from "@/features/inventory/components/StockTable";
import { useInventory } from "@/features/inventory/hooks/useInventory";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatNumber } from "@/utils/format";

export function InventoryContent() {
  const { ingredients, movements, lowStock, outOfStock, loading } = useInventory();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return ingredients;
    return ingredients.filter((i) => i.name.toLowerCase().includes(term));
  }, [ingredients, search]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t.inventory.title}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{t.inventory.subtitle}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t.inventory.totalIngredients} value={formatNumber(ingredients.length)} icon={Boxes} tone="primary" />
        <StatCard label={t.inventory.lowStock} value={formatNumber(lowStock.length)} icon={TriangleAlert} tone="warning" />
        <StatCard label={t.inventory.outOfStock} value={formatNumber(outOfStock.length)} icon={PackageX} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.inventory.currentStock}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <Input placeholder={t.inventory.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={Boxes} title={t.inventory.noIngredientsFound} />
            ) : (
              <StockTable ingredients={filtered} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.inventory.stockMovement}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <StockMovementList movements={movements} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
