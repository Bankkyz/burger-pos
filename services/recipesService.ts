import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/config";
import { makeConverter } from "@/lib/firebase/firestore";
import { createCrudService } from "@/services/firestoreCrud";
import type { Ingredient, Recipe, RecipeItem } from "@/types";
import { calcMargin, calcProfit, calcRecipeCost, calcRecipeItemCost } from "@/utils/calculations";

const base = createCrudService<Recipe>(COLLECTIONS.RECIPES);
const recipeItemsCollection = collection(db, COLLECTIONS.RECIPE_ITEMS).withConverter(makeConverter<RecipeItem>());

export interface RecipeItemInput {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: RecipeItem["unit"];
}

export type RecipeInput = Omit<Recipe, "id" | "createdAt" | "updatedAt" | "cost" | "profit" | "margin">;

function computeTotals(items: RecipeItemInput[], ingredientsById: Map<string, Ingredient>, sellingPrice: number) {
  const itemCosts = items.map((item) => {
    const ingredient = ingredientsById.get(item.ingredientId);
    return calcRecipeItemCost({ costPerGram: ingredient?.costPerGram ?? 0 }, item.quantity);
  });
  const cost = calcRecipeCost(itemCosts.map((cost) => ({ cost })));
  return { cost, profit: calcProfit(sellingPrice, cost), margin: calcMargin(sellingPrice, cost) };
}

/** Subscribes to a single recipe's ingredient line items (for the edit form). */
function subscribeRecipeItems(
  recipeId: string,
  onData: (items: RecipeItem[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(recipeItemsCollection, where("recipeId", "==", recipeId));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (error) => onError?.(error),
  );
}

/**
 * Creates or updates a recipe together with its full set of ingredient line
 * items in one atomic batch. Line items are always fully replaced rather than
 * diffed — recipes are edited infrequently and have few items, so this stays
 * simple and correct instead of chasing add/update/remove diff bugs.
 */
async function saveRecipe(
  recipeId: string | null,
  fields: RecipeInput,
  items: RecipeItemInput[],
  ingredientsById: Map<string, Ingredient>,
): Promise<string> {
  const totals = computeTotals(items, ingredientsById, fields.sellingPrice);
  const batch = writeBatch(db);

  const recipeRef = recipeId
    ? doc(db, COLLECTIONS.RECIPES, recipeId)
    : doc(collection(db, COLLECTIONS.RECIPES));
  const isNew = !recipeId;

  batch.set(
    recipeRef,
    {
      ...fields,
      ...totals,
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true },
  );

  if (recipeId) {
    const existing = await getDocs(query(recipeItemsCollection, where("recipeId", "==", recipeId)));
    existing.docs.forEach((d) => batch.delete(d.ref));
  }

  items.forEach((item) => {
    const itemRef = doc(collection(db, COLLECTIONS.RECIPE_ITEMS));
    const cost = calcRecipeItemCost({ costPerGram: ingredientsById.get(item.ingredientId)?.costPerGram ?? 0 }, item.quantity);
    batch.set(itemRef, { ...item, recipeId: recipeRef.id, cost });
  });

  await batch.commit();
  return recipeRef.id;
}

async function removeRecipe(recipeId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.RECIPES, recipeId));
  const existing = await getDocs(query(recipeItemsCollection, where("recipeId", "==", recipeId)));
  existing.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export const recipesService = {
  subscribeAll: base.subscribeAll,
  subscribeRecipeItems,
  saveRecipe,
  remove: removeRecipe,
  computeTotals,
};
