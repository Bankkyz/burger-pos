"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { expensesService } from "@/services/expensesService";
import type { Expense } from "@/types";
import { toast } from "@/utils/toast";

export function useExpenses() {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = expensesService.subscribeAll(
      (items) => {
        setExpenses(items);
        setLoading(false);
      },
      (error) => {
        console.error("[expenses]", error);
        toast.error(t.expenses.toastLoadFailed);
      },
    );
    return unsub;
  }, [t]);

  return { expenses, loading };
}
