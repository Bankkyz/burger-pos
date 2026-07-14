# Firebase Setup Guide

## 1. Create the Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com) and click **Add project**.
2. Name it (e.g. "burger-pos"), disable Google Analytics unless you want it, and create the project.

## 2. Register a Web app

1. In the project overview, click the **Web** icon (`</>`) to add a web app.
2. Give it a nickname (e.g. "burger-pos-web"). You don't need Firebase Hosting.
3. Firebase shows a `firebaseConfig` object — copy the values into `.env.local` (see [Environment Variables](ENVIRONMENT_VARIABLES.md)):

   | Firebase key | `.env.local` variable |
   | --- | --- |
   | `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
   | `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
   | `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

## 3. Enable Authentication

1. In the console, go to **Build → Authentication → Get started**.
2. Enable the **Email/Password** provider.
3. Enable the **Google** provider (pick a support email when prompted).
4. Go to the **Users** tab and add one user with the exact email you'll set as `NEXT_PUBLIC_ADMIN_EMAIL` — this is the only account allowed into the app. If you'll sign in with Google instead, that Google account's email must match `NEXT_PUBLIC_ADMIN_EMAIL` (no need to pre-create a Users entry for Google sign-in — it's created on first sign-in).

## 4. Enable Firestore

1. Go to **Build → Firestore Database → Create database**.
2. Choose a region close to your restaurant (can't be changed later).
3. Start in **production mode** — this repo's `firestore.rules` will lock it down properly.

## 5. Enable Storage

1. Go to **Build → Storage → Get started**.
2. Use the same region as Firestore. Start in production mode.

## 6. Set the admin email in security rules

Both `firestore.rules` and `storage.rules` hardcode the admin email (Firestore/Storage rules can't read `.env` files). Open both files and replace the placeholder:

```
request.auth.token.email.lower() == "admin@burgerpos.com"
```

with your real admin email, in **both** files, matching `NEXT_PUBLIC_ADMIN_EMAIL` exactly (lowercase — the rule already lowercases the token's email for comparison).

## 7. Deploy security rules

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # select your project, give it an alias (e.g. "default")
firebase deploy --only firestore:rules,storage:rules
```

## 8. Firestore indexes

`firestore.indexes.json` starts empty. Firestore will show a console error with a direct "create index" link the first time a query needs a composite index that doesn't exist yet (this app's queries are designed to avoid needing any, but if you extend the app and hit one, click the link — it creates the index and you can then run `firebase firestore:indexes` to pull the updated definition back into the repo).

## 9. Verify

Run the app (`npm run dev`), go to `/login`, and sign in with the admin account. You should land on the dashboard. Signing in with any other account should show a **403 Forbidden** page.
