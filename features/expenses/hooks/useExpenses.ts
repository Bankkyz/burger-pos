"use client";

import { useEffect, useState } from "react";
import { expensesService } from "@/services/expensesService";
import type { Expense } from "@/types";
import { toast } from "@/utils/toast";

export function useExpenses() {
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
        toast.error("Failed to load expenses.");
      },
    );
    return unsub;
  }, []);

  return { expenses, loading };
}
