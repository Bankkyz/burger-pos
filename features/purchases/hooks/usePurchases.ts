"use client";

import { useEffect, useState } from "react";
import { ingredientsService } from "@/services/ingredientsService";
import { purchasesService } from "@/services/purchasesService";
import { suppliersService } from "@/services/suppliersService";
import type { Ingredient, Purchase, Supplier } from "@/types";
import { toast } from "@/utils/toast";

export function usePurchases() {
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
        toast.error("Failed to load purchases.");
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
        toast.error("Failed to load suppliers.");
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
        toast.error("Failed to load ingredients.");
      },
    );

    return () => {
      unsubPurchases();
      unsubSuppliers();
      unsubIngredients();
    };
  }, []);

  return { purchases, suppliers, ingredients, loading };
}
