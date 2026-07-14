import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/config";
import { createCrudService } from "@/services/firestoreCrud";
import type { Purchase } from "@/types";

const base = createCrudService<Purchase>(COLLECTIONS.PURCHASES);

export interface PurchaseItemInput {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitPrice: number;
}

export interface RecordPurchaseInput {
  supplierId: string;
  supplierName: string;
  items: PurchaseItemInput[];
  note?: string;
  actorEmail: string;
}

/**
 * Records a purchase and atomically increments the stock of every purchased
 * ingredient. Does not touch the ingredient's costPerGram/purchasePrice —
 * that reference cost stays under explicit control via the Ingredients
 * module, so a one-off supplier price doesn't silently reprice every recipe.
 */
async function recordPurchase(input: RecordPurchaseInput): Promise<string> {
  if (input.items.length === 0) throw new Error("Cannot record a purchase with no items.");

  const total = input.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const itemCount = input.items.reduce((sum, i) => sum + i.quantity, 0);
  const purchaseRef = doc(collection(db, COLLECTIONS.PURCHASES));
  const ingredientRefs = input.items.map((item) => doc(db, COLLECTIONS.INGREDIENTS, item.ingredientId));

  await runTransaction(db, async (tx) => {
    const ingredientSnaps = await Promise.all(ingredientRefs.map((ref) => tx.get(ref)));

    tx.set(purchaseRef, {
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      itemCount,
      total,
      note: input.note ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    input.items.forEach((item, index) => {
      const itemRef = doc(collection(db, COLLECTIONS.PURCHASE_ITEMS));
      tx.set(itemRef, {
        purchaseId: purchaseRef.id,
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
        createdAt: serverTimestamp(),
      });

      const currentStock = (ingredientSnaps[index].data()?.currentStock as number | undefined) ?? 0;
      const balanceAfter = currentStock + item.quantity;
      tx.update(ingredientRefs[index], { currentStock: balanceAfter, updatedAt: serverTimestamp() });

      const logRef = doc(collection(db, COLLECTIONS.LOGS));
      tx.set(logRef, {
        actorEmail: input.actorEmail,
        action: "stock_addition",
        entity: "ingredient",
        entityId: item.ingredientId,
        details: `+${item.quantity} (${item.ingredientName}) from purchase`,
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        type: "purchase",
        quantity: item.quantity,
        balanceAfter,
        refId: purchaseRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  });

  return purchaseRef.id;
}

export const purchasesService = {
  subscribeAll: base.subscribeAll,
  recordPurchase,
};
