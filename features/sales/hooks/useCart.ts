"use client";

import { useMemo, useState } from "react";
import type { Recipe } from "@/types";
import { calcSaleTotals } from "@/utils/calculations";

export interface CartLine {
  recipeId: string;
  recipeName: string;
  unitPrice: number;
  unitCost: number;
  quantity: number;
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

  function addRecipe(recipe: Recipe) {
    setLines((prev) => {
      const existing = prev.find((l) => l.recipeId === recipe.id);
      if (existing) {
        return prev.map((l) => (l.recipeId === recipe.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { recipeId: recipe.id, recipeName: recipe.name, unitPrice: recipe.sellingPrice, unitCost: recipe.cost, quantity: 1 }];
    });
  }

  function increment(recipeId: string) {
    setLines((prev) => prev.map((l) => (l.recipeId === recipeId ? { ...l, quantity: l.quantity + 1 } : l)));
  }

  function decrement(recipeId: string) {
    setLines((prev) =>
      prev
        .map((l) => (l.recipeId === recipeId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function removeLine(recipeId: string) {
    setLines((prev) => prev.filter((l) => l.recipeId !== recipeId));
  }

  function clear() {
    setLines([]);
    setDiscount(0);
    setServiceCharge(0);
    setDeliveryFee(0);
  }

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [lines]);
  const cost = useMemo(() => lines.reduce((sum, l) => sum + l.unitCost * l.quantity, 0), [lines]);
  const { total, profit } = calcSaleTotals({ itemsSubtotal: subtotal, itemsCost: cost, discount, serviceCharge, deliveryFee });

  return {
    lines,
    addRecipe,
    increment,
    decrement,
    removeLine,
    clear,
    discount,
    setDiscount,
    serviceCharge,
    setServiceCharge,
    deliveryFee,
    setDeliveryFee,
    subtotal,
    cost,
    total,
    profit,
  };
}
