import type { Ingredient } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/format";

export function StockTable({ ingredients }: { ingredients: Ingredient[] }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.inventory.colIngredient}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.inventory.colCategory}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.inventory.colCurrentStock}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.inventory.colMinimum}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.inventory.colStatus}</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => {
            const isOut = ingredient.currentStock <= 0;
            const isLow = !isOut && ingredient.currentStock <= ingredient.minimumStock;
            return (
              <tr key={ingredient.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="whitespace-nowrap px-3 py-3 font-medium text-[var(--color-text)]">{ingredient.name}</td>
                <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text-muted)]">
                  {t.ingredients.categories[ingredient.category]}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-[var(--color-text)]">
                  {formatNumber(ingredient.currentStock)} {t.ingredients.units[ingredient.unit]}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-[var(--color-text-muted)]">
                  {formatNumber(ingredient.minimumStock)} {t.ingredients.units[ingredient.unit]}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      isOut && "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
                      isLow && "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
                      !isOut && !isLow && "bg-[var(--color-success)]/10 text-[var(--color-success)]",
                    )}
                  >
                    {isOut ? t.inventory.statusOutOfStock : isLow ? t.inventory.statusLowStock : t.inventory.statusInStock}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
