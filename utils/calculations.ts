import type { Ingredient, RecipeItem } from "@/types";

/** Cost per base unit (gram/ml/piece) derived from purchase price and purchase-unit size. */
export function calcCostPerGram(purchasePrice: number, purchaseUnitGrams: number): number {
  if (!purchaseUnitGrams) return 0;
  return purchasePrice / purchaseUnitGrams;
}

export function calcRecipeItemCost(ingredient: Pick<Ingredient, "costPerGram">, quantity: number): number {
  return ingredient.costPerGram * quantity;
}

export function calcRecipeCost(items: Pick<RecipeItem, "cost">[]): number {
  return items.reduce((sum, item) => sum + item.cost, 0);
}

export function calcProfit(sellingPrice: number, cost: number): number {
  return sellingPrice - cost;
}

export function calcMargin(sellingPrice: number, cost: number): number {
  if (!sellingPrice) return 0;
  return calcProfit(sellingPrice, cost) / sellingPrice;
}

export function calcSaleTotals(params: {
  itemsSubtotal: number;
  itemsCost: number;
  discount: number;
  serviceCharge: number;
  deliveryFee: number;
}) {
  const { itemsSubtotal, itemsCost, discount, serviceCharge, deliveryFee } = params;
  const total = Math.max(0, itemsSubtotal - discount + serviceCharge + deliveryFee);
  const profit = total - itemsCost;
  return { total, profit };
}
