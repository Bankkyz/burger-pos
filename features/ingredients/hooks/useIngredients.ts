"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ingredientsService } from "@/services/ingredientsService";
import { suppliersService } from "@/services/suppliersService";
import type { Ingredient, Supplier } from "@/types";
import { toast } from "@/utils/toast";

export function useIngredients() {
  const { t } = useLanguage();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ingredientsLoaded = false;
    let suppliersLoaded = false;
    const maybeStopLoading = () => {
      if (ingredientsLoaded && suppliersLoaded) setLoading(false);
    };

    const unsubIngredients = ingredientsService.subscribeAll(
      (items) => {
        setIngredients(items);
        ingredientsLoaded = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[ingredients]", error);
        toast.error(t.ingredients.toastLoadFailed);
      },
    );

    const unsubSuppliers = suppliersService.subscribeAll(
      (items) => {
        setSuppliers(items);
        suppliersLoaded = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[suppliers]", error);
        toast.error(t.common.toastLoadSuppliersFailed);
      },
    );

    return () => {
      unsubIngredients();
      unsubSuppliers();
    };
  }, [t]);

  return { ingredients, suppliers, loading };
}
