import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/config";
import { makeConverter } from "@/lib/firebase/firestore";
import { createCrudService } from "@/services/firestoreCrud";
import type { PaymentMethod, RecipeItem, Sale, SaleChannel } from "@/types";
import { calcSaleTotals } from "@/utils/calculations";

const base = createCrudService<Sale>(COLLECTIONS.SALES);
const recipeItemsCollection = collection(db, COLLECTIONS.RECIPE_ITEMS).withConverter(makeConverter<RecipeItem>());

export interface CartLine {
  recipeId: string;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface CheckoutInput {
  items: CartLine[];
  discount: number;
  serviceCharge: number;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  channel: SaleChannel;
  note?: string;
  actorEmail: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ORD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * Completes a sale: writes the sale + its line items, and atomically deducts
 * every ingredient the sold recipes consume (aggregated across the whole
 * cart) via a transaction, so stock never desyncs from what was actually
 * sold even if two checkouts happen close together. Ingredient deductions
 * are logged to `logs` (the spec's collections don't include a dedicated
 * stock-ledger collection) so Inventory can reconstruct movement history.
 */
async function checkout(input: CheckoutInput): Promise<string> {
  if (input.items.length === 0) throw new Error("Cannot check out an empty order.");

  const recipeIds = [...new Set(input.items.map((i) => i.recipeId))];
  const recipeItemsSnap = await getDocs(query(recipeItemsCollection, where("recipeId", "in", recipeIds)));

  const recipeItemsByRecipe = new Map<string, RecipeItem[]>();
  recipeItemsSnap.docs.forEach((d) => {
    const item = d.data();
    const list = recipeItemsByRecipe.get(item.recipeId) ?? [];
    list.push(item);
    recipeItemsByRecipe.set(item.recipeId, list);
  });

  const deductionByIngredient = new Map<string, { name: string; unit: string; quantity: number }>();
  input.items.forEach((line) => {
    const recipeItems = recipeItemsByRecipe.get(line.recipeId) ?? [];
    recipeItems.forEach((ri) => {
      const existing = deductionByIngredient.get(ri.ingredientId) ?? { name: ri.ingredientName, unit: ri.unit, quantity: 0 };
      existing.quantity += ri.quantity * line.quantity;
      deductionByIngredient.set(ri.ingredientId, existing);
    });
  });

  const itemsSubtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemsCost = input.items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0);
  const { total, profit } = calcSaleTotals({
    itemsSubtotal,
    itemsCost,
    discount: input.discount,
    serviceCharge: input.serviceCharge,
    deliveryFee: input.deliveryFee,
  });
  const itemCount = input.items.reduce((sum, i) => sum + i.quantity, 0);
  const orderNumber = generateOrderNumber();

  const saleRef = doc(collection(db, COLLECTIONS.SALES));
  const ingredientDeductions = [...deductionByIngredient.entries()];
  const ingredientRefs = ingredientDeductions.map(([ingredientId]) => doc(db, COLLECTIONS.INGREDIENTS, ingredientId));

  await runTransaction(db, async (tx) => {
    // All reads must happen before any writes inside a Firestore transaction.
    const ingredientSnaps = await Promise.all(ingredientRefs.map((ref) => tx.get(ref)));

    tx.set(saleRef, {
      orderNumber,
      itemCount,
      subtotal: itemsSubtotal,
      discount: input.discount,
      serviceCharge: input.serviceCharge,
      deliveryFee: input.deliveryFee,
      total,
      totalCost: itemsCost,
      profit,
      paymentMethod: input.paymentMethod,
      channel: input.channel,
      status: "completed",
      note: input.note ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    input.items.forEach((line) => {
      const itemRef = doc(collection(db, COLLECTIONS.SALE_ITEMS));
      tx.set(itemRef, {
        saleId: saleRef.id,
        recipeId: line.recipeId,
        recipeName: line.recipeName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        unitCost: line.unitCost,
        lineTotal: line.unitPrice * line.quantity,
        lineCost: line.unitCost * line.quantity,
        lineProfit: (line.unitPrice - line.unitCost) * line.quantity,
        createdAt: serverTimestamp(),
      });
    });

    ingredientDeductions.forEach(([ingredientId, { name, unit, quantity }], index) => {
      const currentStock = (ingredientSnaps[index].data()?.currentStock as number | undefined) ?? 0;
      const balanceAfter = currentStock - quantity;
      tx.update(ingredientRefs[index], { currentStock: balanceAfter, updatedAt: serverTimestamp() });

      const logRef = doc(collection(db, COLLECTIONS.LOGS));
      tx.set(logRef, {
        actorEmail: input.actorEmail,
        action: "stock_deduction",
        entity: "ingredient",
        entityId: ingredientId,
        details: `-${quantity}${unit} (${name}) for order ${orderNumber}`,
        ingredientId,
        ingredientName: name,
        type: "sale",
        quantity: -quantity,
        balanceAfter,
        refId: saleRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  });

  return saleRef.id;
}

export const salesService = {
  subscribeAll: base.subscribeAll,
  checkout,
};
