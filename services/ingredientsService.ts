import { COLLECTIONS } from "@/constants";
import { createCrudService } from "@/services/firestoreCrud";
import type { Ingredient } from "@/types";
import { calcCostPerGram } from "@/utils/calculations";

const base = createCrudService<Ingredient>(COLLECTIONS.INGREDIENTS);

export type IngredientInput = Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "costPerGram">;

/** Cost-per-gram is always derived server-side from purchase price / purchase unit size. */
function withCostPerGram(data: IngredientInput) {
  return { ...data, costPerGram: calcCostPerGram(data.purchasePrice, data.purchaseUnitGrams) };
}

export const ingredientsService = {
  subscribeAll: base.subscribeAll,
  remove: base.remove,

  create(data: IngredientInput) {
    return base.create(withCostPerGram(data));
  },

  /** Recomputes costPerGram from the merged (current + changed) purchase fields. */
  update(id: string, current: Ingredient, changes: Partial<IngredientInput>) {
    const merged = { ...current, ...changes };
    return base.update(id, {
      ...changes,
      costPerGram: calcCostPerGram(merged.purchasePrice, merged.purchaseUnitGrams),
    });
  },
};
