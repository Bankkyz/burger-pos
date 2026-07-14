import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  type Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { connectStorageEmulator, type FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
}

export const firebaseApp: FirebaseApp = createFirebaseApp();

// `getAuth` validates the API key eagerly and throws when env vars are missing/placeholder —
// which happens during server-side prerendering (e.g. `next build` without `.env.local`
// configured yet). Auth is only ever used from client components after mount, so it's safe
// to defer real initialization to the browser and hand back a stub during SSR/build.
export const auth: Auth =
  typeof window !== "undefined" ? getAuth(firebaseApp) : ({} as Auth);

// Persistent (IndexedDB-backed) local cache lets the app read/write while
// offline; queued writes sync automatically once connectivity returns. Only
// meaningful in the browser (no IndexedDB during SSR/build), and `initializeFirestore`
// throws if this module re-evaluates on the same app (e.g. Next.js Fast Refresh) —
// fall back to the already-initialized instance in that case.
function createFirestoreInstance(app: FirebaseApp): Firestore {
  if (typeof window === "undefined") return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const db: Firestore = createFirestoreInstance(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Local development against the Firebase Emulator Suite (`firebase emulators:start`).
// Guarded against Next.js Fast Refresh re-running this module and reconnecting twice.
declare global {
  var __firebaseEmulatorsConnected: boolean | undefined;
}

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" &&
  !globalThis.__firebaseEmulatorsConnected
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  globalThis.__firebaseEmulatorsConnected = true;
}
