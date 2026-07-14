import {
  addDoc,
  collection,
  deleteDoc,
  type DocumentData,
  doc,
  onSnapshot,
  orderBy,
  query,
  type QueryConstraint,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { makeConverter } from "@/lib/firebase/firestore";
import type { BaseDoc } from "@/types";

/**
 * Generic real-time CRUD factory over a Firestore collection. Every feature
 * service (ingredients, suppliers, recipes, expenses, ...) is a thin wrapper
 * around this so create/update/delete/subscribe logic isn't duplicated.
 *
 * Reads go through a converter for clean `T` typing; writes use the raw
 * (converter-less) collection since payloads only ever carry a subset of
 * fields plus `serverTimestamp()` sentinels, sidestepping converter generic
 * mismatches between the Firestore SDK's App/DbModel type parameters.
 */
export function createCrudService<T extends BaseDoc>(collectionName: string) {
  const collectionRef = collection(db, collectionName).withConverter(makeConverter<T>());
  const rawCollectionRef = collection(db, collectionName);

  function subscribeAll(
    onData: (items: T[]) => void,
    onError?: (error: Error) => void,
    ...constraints: QueryConstraint[]
  ) {
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : query(collectionRef, orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => onData(snapshot.docs.map((d) => d.data())),
      (error) => onError?.(error),
    );
  }

  async function create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const payload: DocumentData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(rawCollectionRef, payload);
    return ref.id;
  }

  async function update(id: string, data: Partial<Omit<T, "id" | "createdAt">>): Promise<void> {
    const payload: DocumentData = { ...data, updatedAt: serverTimestamp() };
    await updateDoc(doc(rawCollectionRef, id), payload);
  }

  async function remove(id: string): Promise<void> {
    await deleteDoc(doc(rawCollectionRef, id));
  }

  return { collectionRef, subscribeAll, create, update, remove };
}
