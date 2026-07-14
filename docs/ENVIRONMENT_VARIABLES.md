# Environment Variables Guide

All variables live in `.env.local` (copy from `.env.local.example`). Every variable is prefixed `NEXT_PUBLIC_` because they're all read by client-side code (the Firebase Web SDK config is not a secret — access is controlled by Firebase Auth + Security Rules, not by hiding these values).

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | From Firebase Console → Project Settings → Your apps → Web app |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Same location, usually `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Your Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Usually `<project-id>.appspot.com` or `<project-id>.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Numeric sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Web app ID, format `1:...:web:...` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | The **only** email allowed to sign in. Must also be set in `firestore.rules` and `storage.rules` (see [Firebase Setup](FIREBASE_SETUP.md#6-set-the-admin-email-in-security-rules)) — the client-side check and the security rules check are independent and both need updating if this ever changes. |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` | No | Set to `true` to connect to a local `firebase emulators:start` instance instead of production Firebase. Defaults to `false`/unset. See [Installation](INSTALLATION.md#4-optional-develop-against-the-firebase-emulator-suite). |

## Where these are used

- `lib/firebase/config.ts` reads the six `NEXT_PUBLIC_FIREBASE_*` variables to initialize the Firebase app, and `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` to decide whether to connect to local emulators.
- `constants/index.ts` reads `NEXT_PUBLIC_ADMIN_EMAIL` and exports it as `ADMIN_EMAIL`, used by `features/auth/hooks/useAuth.tsx` to decide whether a signed-in user is the admin.

## Setting variables on Vercel

Don't commit `.env.local` (it's gitignored). Add the same variables under Vercel → Project → Settings → Environment Variables — see [Vercel Deployment](VERCEL_DEPLOYMENT.md).
