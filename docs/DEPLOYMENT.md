# Deployment Guide

This app is a standard Next.js 16 App Router project — it deploys to any platform that runs Next.js (Vercel, a Node server, Docker, etc.). Vercel is the path of least resistance; see [Vercel Deployment](VERCEL_DEPLOYMENT.md) for exact steps. This page covers the platform-agnostic checklist.

## Pre-deployment checklist

- [ ] Firebase project created, Auth/Firestore/Storage enabled ([Firebase Setup](FIREBASE_SETUP.md))
- [ ] Admin email set in `.env.local`, `firestore.rules`, and `storage.rules` — all three must match
- [ ] `firebase deploy --only firestore:rules,storage:rules` run against the production project
- [ ] All `NEXT_PUBLIC_*` variables set in the hosting platform's environment settings ([reference](ENVIRONMENT_VARIABLES.md))
- [ ] `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` is **not** set (or is `false`) in production
- [ ] `npm run build` succeeds locally
- [ ] Signed in as the admin account and confirmed a non-admin account gets 403'd, against the **production** Firebase project (not the emulator)

## Building for production

```bash
npm run build
npm run start   # serves the production build on :3000
```

## Generic Node hosting

```bash
npm install
npm run build
npm run start -- -p $PORT
```

Next.js's production server (`next start`) handles both the static assets and the few dynamic routes (none of this app's pages use server-side data fetching — Firestore reads happen client-side — so it's effectively servable as a static/CDN-friendly app plus a lightweight Node process for routing).

## Docker (optional)

A minimal Dockerfile for a standalone Next.js build:

```dockerfile
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Pass the `NEXT_PUBLIC_*` variables as build-time `--build-arg`s or bake them into the image — since they're client-exposed anyway, they must be present at **build** time, not just runtime (Next.js inlines `NEXT_PUBLIC_*` values into the client bundle during `next build`).

## PWA notes

- The service worker (`public/sw.js`) only registers when `NODE_ENV=production`, so it activates automatically in any production deployment without extra config.
- Serve the app over HTTPS — service workers and the "Install App" prompt require it (Vercel and most platforms provide this by default).

## Post-deploy smoke test

1. Visit the deployed URL, confirm it redirects to `/login`.
2. Sign in as the admin account — confirm the dashboard loads with live data.
3. Try signing in with a different account — confirm you get the 403 page.
4. Create an ingredient, a recipe using it, and complete a sale — confirm stock deducts and the dashboard updates.
5. On mobile Chrome/Safari, confirm the "Add to Home Screen" / install prompt appears.
