import { CheckCircle2, PackageX, TriangleAlert } from "lucide-react";
import type { Ingredient } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatNumber } from "@/utils/format";

export function LowStockAlert({ lowStock, outOfStock }: { lowStock: Ingredient[]; outOfStock: Ingredient[] }) {
  const { t } = useLanguage();
  const items = [...outOfStock, ...lowStock];

  if (items.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm text-[var(--color-text-muted)]">
        <CheckCircle2 className="h-8 w-8 text-[var(--color-success)]" />
        {t.dashboard.allStocked}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((ingredient) => {
        const isOut = ingredient.currentStock <= 0;
        return (
          <li
            key={ingredient.id}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              {isOut ? (
                <PackageX className="h-4.5 w-4.5 shrink-0 text-[var(--color-danger)]" />
              ) : (
                <TriangleAlert className="h-4.5 w-4.5 shrink-0 text-[var(--color-warning)]" />
              )}
              <span className="text-sm font-medium text-[var(--color-text)]">{ingredient.name}</span>
            </div>
            <span
              className={
                isOut
                  ? "text-xs font-semibold text-[var(--color-danger)]"
                  : "text-xs font-semibold text-[var(--color-warning)]"
              }
            >
              {isOut
                ? t.dashboard.outOfStock
                : `${formatNumber(ingredient.currentStock)} ${t.ingredients.units[ingredient.unit]} ${t.dashboard.left}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
