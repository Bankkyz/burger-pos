# Vercel Deployment Guide

## 1. Push the repo to GitHub (or GitLab/Bitbucket)

Vercel deploys from a git repository. If you haven't already:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Import the project

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Import the `burger-pos` repository.
3. Framework Preset: Vercel auto-detects **Next.js** — leave the build/output settings at their defaults (`next build`, `.next`).

## 3. Add environment variables

Before the first deploy (or right after, then redeploy), go to **Project → Settings → Environment Variables** and add every variable from [Environment Variables](ENVIRONMENT_VARIABLES.md):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_ADMIN_EMAIL
```

Leave `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` unset — production should always talk to real Firebase. Apply the variables to all three environments (Production, Preview, Development) unless you specifically want preview deployments pointed at a different Firebase project.

## 4. Authorize the Vercel domain in Firebase

Firebase Auth only allows sign-in from domains you've explicitly authorized:

1. Firebase Console → Authentication → Settings → **Authorized domains**.
2. Add your Vercel domain (e.g. `burger-pos.vercel.app`) and any custom domain you attach later.

Without this step, Google/email sign-in will fail with an `auth/unauthorized-domain` error on the deployed site.

## 5. Deploy

Click **Deploy**. Vercel runs `npm install && npm run build` and serves the result. Every subsequent push to `main` redeploys automatically; pushes to other branches create preview deployments.

## 6. Custom domain (optional)

Project → Settings → Domains → add your domain, follow Vercel's DNS instructions. Remember to also add the custom domain to Firebase's authorized domains list (step 4) once it's live.

## 7. Verify

Follow the [post-deploy smoke test](DEPLOYMENT.md#post-deploy-smoke-test) against the live Vercel URL.
