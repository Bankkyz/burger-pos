import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";

export function toMillis(value: Timestamp | number | undefined | null): number {
  if (!value) return Date.now();
  return typeof value === "number" ? value : value.toMillis();
}

/** Shallow-converts any Firestore Timestamp field (e.g. createdAt/updatedAt) to epoch millis. */
function normalizeTimestamps(data: DocumentData): DocumentData {
  const result: DocumentData = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Timestamp) {
      result[key] = (result[key] as Timestamp).toMillis();
    }
  }
  return result;
}

/**
 * Generic converter that stamps `id` from the doc snapshot, normalizes Timestamp
 * fields to millis, and leaves the rest of the shape untouched. Collection services
 * pass a type param `T` that extends `{ id: string }`.
 */
export function makeConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      const rest = { ...model } as Partial<T>;
      delete rest.id;
      return rest as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return { id: snapshot.id, ...normalizeTimestamps(snapshot.data()) } as T;
    },
  };
}
