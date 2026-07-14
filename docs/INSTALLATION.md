# Installation Guide

## Prerequisites

- Node.js 20+ (the project was built and tested on Node 25)
- npm (bundled with Node)
- A Firebase project — see [Firebase Setup](FIREBASE_SETUP.md) if you don't have one yet
- Java 21+ — only needed if you want to run the local Firebase Emulator Suite (optional but recommended for development)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the Firebase values from your Firebase project (see [Firebase Setup](FIREBASE_SETUP.md)) and set `NEXT_PUBLIC_ADMIN_EMAIL` to the one email address allowed to sign in. Full reference: [Environment Variables](ENVIRONMENT_VARIABLES.md).

## 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the login screen — sign in with the admin account you configured.

## 4. (Optional) Develop against the Firebase Emulator Suite

Running against real Firebase while developing works fine, but the emulator suite lets you iterate without touching production data and without needing a Firebase project at all for early development.

```bash
# One-time: install the Firebase CLI
npm install -g firebase-tools

# Start Auth + Firestore + Storage emulators
firebase emulators:start --only auth,firestore,storage
```

Then in `.env.local`:

```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

The emulator UI is at [http://localhost:4000](http://localhost:4000). Firestore and Storage emulators start empty — create your admin user from the Auth emulator tab (or the "Sign in with Google/Email" screen will fail until one exists), then use the app normally to create ingredients, recipes, etc.

> The Firestore Emulator requires Java 21+. On macOS with Homebrew and an older JDK installed: `brew install openjdk@21` and add `/opt/homebrew/opt/openjdk@21/bin` to your `PATH` before running `firebase emulators:start`.

## 5. Useful scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build
npm run start    # run the production build locally
npm run lint     # ESLint (includes the React Compiler's hook-correctness checks)
npx tsc --noEmit # type-check without emitting files
```
