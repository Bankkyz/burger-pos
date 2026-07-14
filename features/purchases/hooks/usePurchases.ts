"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ingredientsService } from "@/services/ingredientsService";
import { purchasesService } from "@/services/purchasesService";
import { suppliersService } from "@/services/suppliersService";
import type { Ingredient, Purchase, Supplier } from "@/types";
import { toast } from "@/utils/toast";

export function usePurchases() {
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = { purchases: false, suppliers: false, ingredients: false };
    const maybeStopLoading = () => {
      if (Object.values(loaded).every(Boolean)) setLoading(false);
    };

    const unsubPurchases = purchasesService.subscribeAll(
      (items) => {
        setPurchases(items);
        loaded.purchases = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[purchases]", error);
        toast.error(t.purchases.toastLoadFailed);
      },
    );

    const unsubSuppliers = suppliersService.subscribeAll(
      (items) => {
        setSuppliers(items);
        loaded.suppliers = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[suppliers]", error);
        toast.error(t.common.toastLoadSuppliersFailed);
      },
    );

    const unsubIngredients = ingredientsService.subscribeAll(
      (items) => {
        setIngredients(items);
        loaded.ingredients = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[ingredients]", error);
        toast.error(t.ingredients.toastLoadFailed);
      },
    );

    return () => {
      unsubPurchases();
      unsubSuppliers();
      unsubIngredients();
    };
  }, [t]);

  return { purchases, suppliers, ingredients, loading };
}
