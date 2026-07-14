"use client";

import { Plus, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { ExpenseFormModal } from "@/features/expenses/components/ExpenseFormModal";
import { ExpensesTable } from "@/features/expenses/components/ExpensesTable";
import { useExpenses } from "@/features/expenses/hooks/useExpenses";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { expensesService } from "@/services/expensesService";
import type { Expense } from "@/types";
import { toLocalDateString } from "@/utils/dateOnly";
import { formatCurrency } from "@/utils/format";
import { toast } from "@/utils/toast";

export function ExpensesContent() {
  const { expenses, loading } = useExpenses();
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const monthTotal = useMemo(() => {
    const currentMonth = toLocalDateString(new Date()).slice(0, 7);
    return expenses.filter((e) => e.date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await expensesService.remove(pendingDelete.id);
      toast.success(t.expenses.toastDeleted);
      setPendingDelete(null);
    } catch (error) {
      console.error(error);
      toast.error(t.expenses.toastDeleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">{t.expenses.title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{t.expenses.subtitle}</p>
        </div>
        <Button onClick={openCreate} size="lg">
          <Plus className="h-5 w-5" />
          {t.expenses.addExpense}
        </Button>
      </div>

      <div className="max-w-xs">
        <StatCard label={t.expenses.thisMonth} value={formatCurrency(monthTotal)} icon={Wallet} tone="warning" />
      </div>

      <Card>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState icon={Wallet} title={t.expenses.noExpenses} description={t.expenses.noExpensesHint} />
        ) : (
          <ExpensesTable expenses={expenses} onEdit={openEdit} onDelete={setPendingDelete} />
        )}
      </Card>

      <ExpenseFormModal open={formOpen} onClose={() => setFormOpen(false)} expense={editing} />

      <ConfirmDialog
        open={!!pendingDelete}
        title={t.expenses.deleteTitle}
        description={t.expenses.deleteDescription}
        confirmLabel={t.common.delete}
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
