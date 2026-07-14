import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Expense } from "@/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatCurrency, formatDate } from "@/utils/format";

export interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpensesTable({ expenses, onEdit, onDelete }: ExpensesTableProps) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.expenses.colDate}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.expenses.colCategory}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">{t.expenses.colDescription}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.expenses.colAmount}</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium text-right">{t.expenses.colActions}</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-[var(--color-border)] last:border-0">
              <td className="whitespace-nowrap px-3 py-3 text-[var(--color-text-muted)]">{formatDate(expense.date)}</td>
              <td className="whitespace-nowrap px-3 py-3">
                <span className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)]">
                  {t.expenses.categories[expense.category]}
                </span>
              </td>
              <td className="max-w-[240px] truncate px-3 py-3 text-[var(--color-text-muted)]">{expense.description || "—"}</td>
              <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-[var(--color-text)]">
                {formatCurrency(expense.amount)}
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" aria-label={t.expenses.editExpense} onClick={() => onEdit(expense)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={t.expenses.deleteTitle} onClick={() => onDelete(expense)}>
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
