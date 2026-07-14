import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/constants";
import { db } from "@/lib/firebase/config";
import { makeConverter } from "@/lib/firebase/firestore";
import type { StockMovement } from "@/types";

const logsCollection = collection(db, COLLECTIONS.LOGS).withConverter(makeConverter<StockMovement>());

/**
 * Stock movements are written into the shared `logs` collection (the spec's
 * schema has no dedicated ledger collection) by salesService/purchasesService,
 * tagged with entity == "ingredient". This subscribes to the most recent ones
 * for the Stock Movement / Stock History views.
 */
export function subscribeStockMovements(
  onData: (movements: StockMovement[]) => void,
  onError?: (error: Error) => void,
  max = 100,
) {
  const q = query(logsCollection, where("entity", "==", "ingredient"), orderBy("createdAt", "desc"), limit(max));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (error) => onError?.(error),
  );
}
