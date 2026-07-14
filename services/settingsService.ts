import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { COLLECTIONS, DEFAULT_CURRENCY } from "@/constants";
import { db } from "@/lib/firebase/config";
import type { RestaurantSettings } from "@/types";

// Settings is a single-document collection — every restaurant has exactly one config.
const SETTINGS_DOC_ID = "general";

export const DEFAULT_SETTINGS: RestaurantSettings = {
  name: "Burger POS",
  logoUrl: null,
  currency: DEFAULT_CURRENCY,
  taxPercent: 0,
  deliveryGpPercent: { "Walk-in": 0, Grab: 0, "LINE MAN": 0, Foodpanda: 0 },
  promptPayId: "",
  updatedAt: Date.now(),
};

function settingsRef() {
  return doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
}

export function subscribeSettings(
  onData: (settings: RestaurantSettings) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    settingsRef(),
    (snapshot) => {
      onData(snapshot.exists() ? { ...DEFAULT_SETTINGS, ...snapshot.data() } as RestaurantSettings : DEFAULT_SETTINGS);
    },
    (error) => onError?.(error),
  );
}

export async function updateSettings(data: Partial<RestaurantSettings>): Promise<void> {
  await setDoc(settingsRef(), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export const settingsService = { subscribeSettings, updateSettings };
