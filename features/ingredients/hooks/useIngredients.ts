"use client";

import { useEffect, useState } from "react";
import { ingredientsService } from "@/services/ingredientsService";
import { suppliersService } from "@/services/suppliersService";
import type { Ingredient, Supplier } from "@/types";
import { toast } from "@/utils/toast";

export function useIngredients() {
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
        toast.error("Failed to load ingredients.");
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
        toast.error("Failed to load suppliers.");
      },
    );

    return () => {
      unsubIngredients();
      unsubSuppliers();
    };
  }, []);

  return { ingredients, suppliers, loading };
}
