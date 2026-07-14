import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

/**
 * Generic converter that stamps `id` from the doc snapshot and leaves the
 * rest of the shape untouched. Collection services pass a type param `T`
 * that extends `BaseDoc`.
 */
export function makeConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      const rest = { ...model } as Partial<T>;
      delete rest.id;
      return rest as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return { id: snapshot.id, ...snapshot.data() } as T;
    },
  };
}

export function toMillis(value: Timestamp | number | undefined | null): number {
  if (!value) return Date.now();
  return typeof value === "number" ? value : value.toMillis();
}
