import { ChefHat } from "lucide-react";
import type { TopSellingItem } from "@/services/dashboardService";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatCurrency, formatNumber } from "@/utils/format";

export function TopSellingList({ items }: { items: TopSellingItem[] }) {
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm text-[var(--color-text-muted)]">
        <ChefHat className="h-8 w-8 opacity-40" />
        {t.dashboard.noSalesThisMonth}
      </div>
    );
  }

  const maxQuantity = Math.max(...items.map((i) => i.quantity));

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={item.recipeId} className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-text-muted)]">
            {index + 1}
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-[var(--color-text)]">{item.recipeName}</span>
              <span className="text-sm font-semibold tabular-nums text-[var(--color-text)]">
                {formatCurrency(item.revenue)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)]"
                style={{ width: `${(item.quantity / maxQuantity) * 100}%` }}
              />
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {formatNumber(item.quantity)} {t.dashboard.sold}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
