import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Ingredient, Supplier } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/en";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";
import { cn } from "@/utils/cn";

export interface IngredientsTableProps {
  ingredients: Ingredient[];
  suppliers: Supplier[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

function StockBadge({ ingredient, t }: { ingredient: Ingredient; t: Translations }) {
  const isOut = ingredient.currentStock <= 0;
  const isLow = !isOut && ingredient.currentStock <= ingredient.minimumStock;

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        isOut && "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
        isLow && "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
        !isOut && !isLow && "bg-[var(--color-success)]/10 text-[var(--color-success)]",
      )}
    >
      {formatNumber(ingredient.currentStock)} {t.ingredients.units[ingredient.unit]}
    </span>
  );
}

export function IngredientsTable({ ingredients, suppliers, onEdit, onDelete }: IngredientsTableProps) {
  const { t } = useLanguage();
  const supplierName = (id?: string | null) => suppliers.find((s) => s.id === id)?.name ?? "—";

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.ingredients.colName}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.ingredients.colCategory}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.ingredients.colStock}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.ingredients.colCostPerGram}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.ingredients.colSupplier}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.ingredients.colExpires}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.ingredients.colActions}</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient.id} className="border-b border-[var(--color-border)] last:border-0">
              <td className="whitespace-nowrap px-3 py-3 font-medium text-[var(--color-text)]">{ingredient.name}</td>
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text-muted)]">
                {t.ingredients.categories[ingredient.category]}
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <StockBadge ingredient={ingredient} t={t} />
              </td>
              <td className="whitespace-nowrap px-3 py-3 tabular-nums text-[var(--color-text)]">
                {formatCurrency(ingredient.costPerGram)}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text-muted)]">{supplierName(ingredient.supplierId)}</td>
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text-muted)]">
                {ingredient.expireDate ? formatDate(ingredient.expireDate) : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" aria-label={`${t.common.edit} ${ingredient.name}`} onClick={() => onEdit(ingredient)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`${t.common.delete} ${ingredient.name}`} onClick={() => onDelete(ingredient)}>
                    <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
