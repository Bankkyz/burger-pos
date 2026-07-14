"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { EXPENSE_CATEGORIES } from "@/constants";
import { expensesService } from "@/services/expensesService";
import type { Expense } from "@/types";
import { toast } from "@/utils/toast";

const schema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive("Must be greater than 0"),
  description: z.string().optional(),
  date: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export function ExpenseFormModal({ open, onClose, expense }: ExpenseFormModalProps) {
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
        toast.success("Expense updated.");
      } else {
        await expensesService.create(values);
        toast.success("Expense added.");
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save expense.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={expense ? "Edit Expense" : "Add Expense"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" error={errors.category?.message} {...register("category")}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min={0}
          error={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />

        <Input label="Description" placeholder="Optional" {...register("description")} />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {expense ? "Save Changes" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
