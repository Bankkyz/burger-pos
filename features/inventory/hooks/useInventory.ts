"use client";

import { useEffect, useState } from "react";
import { ingredientsService } from "@/services/ingredientsService";
import { subscribeStockMovements } from "@/services/inventoryService";
import type { Ingredient, StockMovement } from "@/types";
import { toast } from "@/utils/toast";

export function useInventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = { ingredients: false, movements: false };
    const maybeStopLoading = () => {
      if (loaded.ingredients && loaded.movements) setLoading(false);
    };

    const unsubIngredients = ingredientsService.subscribeAll(
      (items) => {
        setIngredients(items);
        loaded.ingredients = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[inventory:ingredients]", error);
        toast.error("Failed to load stock.");
      },
    );

    const unsubMovements = subscribeStockMovements(
      (items) => {
        setMovements(items);
        loaded.movements = true;
        maybeStopLoading();
      },
      (error) => {
        console.error("[inventory:movements]", error);
        toast.error("Failed to load stock movements.");
      },
    );

    return () => {
      unsubIngredients();
      unsubMovements();
    };
  }, []);

  const lowStock = ingredients.filter((i) => i.currentStock > 0 && i.currentStock <= i.minimumStock);
  const outOfStock = ingredients.filter((i) => i.currentStock <= 0);

  return { ingredients, movements, lowStock, outOfStock, loading };
}
