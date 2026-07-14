"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { EXPENSE_CATEGORIES } from "@/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/en";
import { expensesService } from "@/services/expensesService";
import type { Expense } from "@/types";
import { toLocalDateString } from "@/utils/dateOnly";
import { toast } from "@/utils/toast";

function buildSchema(t: Translations) {
  return z.object({
    category: z.enum(EXPENSE_CATEGORIES),
    amount: z.number().positive(t.common.mustBeGreaterThanZero),
    description: z.string().optional(),
    date: z.string().min(1, t.common.required),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function today(): string {
  return toLocalDateString(new Date());
}

export interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export function ExpenseFormModal({ open, onClose, expense }: ExpenseFormModalProps) {
  const { t } = useLanguage();
  const schema = useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { category: "Misc", date: today() } });

  useEffect(() => {
    if (!open) return;
    reset(
      expense
        ? { category: expense.category, amount: expense.amount, description: expense.description ?? "", date: expense.date }
        : { category: "Misc", amount: 0, description: "", date: today() },
    );
  }, [open, expense, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (expense) {
        await expensesService.update(expense.id, values);
        toast.success(t.expenses.toastUpdated);
      } else {
        await expensesService.create(values);
        toast.success(t.expenses.toastAdded);
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t.expenses.toastSaveFailed);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={expense ? t.expenses.editExpense : t.expenses.addExpense}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Select label={t.expenses.fieldCategory} error={errors.category?.message} {...register("category")}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t.expenses.categories[c]}
              </option>
            ))}
          </Select>
          <Input label={t.expenses.fieldDate} type="date" error={errors.date?.message} {...register("date")} />
        </div>

        <Input
          label={t.expenses.fieldAmount}
          type="number"
          step="0.01"
          min={0}
          error={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />

        <Input label={t.expenses.fieldDescription} placeholder={t.common.optional} {...register("description")} />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {expense ? t.expenses.saveChanges : t.expenses.addExpense}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
