# Burger POS

A production-ready restaurant point-of-sale system: sales, recipes, ingredients, purchasing, expenses, inventory, and reporting, built on Next.js and Firebase.

## Features

- **Dashboard** — today's sales/profit/cost/orders, monthly revenue chart, top-selling menu, low-stock alerts
- **Ingredients** — CRUD with auto-calculated cost per gram
- **Recipes** — ingredient line items with auto-calculated cost, profit, and margin
- **Sales (POS)** — tap-to-order screen, discounts/service charge/delivery fee, Cash/PromptPay/Transfer, Walk-in/Grab/LINE MAN/Foodpanda channels, atomic stock deduction on checkout
- **Purchases** — record supplier purchases with automatic stock increment
- **Expenses** — categorized operating costs (Gas, Electricity, Rent, Salary, Packaging, Advertising, Misc)
- **Reports** — daily/weekly/monthly/yearly revenue/cost/profit/expense with charts, PDF and Excel (CSV) export
- **Inventory** — real-time stock levels, stock movement history, low/out-of-stock warnings
- **Settings** — restaurant profile, logo, currency, tax, delivery GP per channel, PromptPay QR
- **Single-admin auth** — email/password and Google sign-in, restricted to one predefined account; anyone else gets a 403
- **PWA** — installable, offline app shell via service worker, Firestore offline persistence

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Firebase (Auth, Firestore, Storage) · Vercel

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase config — see docs/FIREBASE_SETUP.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a fuller walkthrough, see the guides below.

## Documentation

| Guide | What it covers |
| --- | --- |
| [Installation](docs/INSTALLATION.md) | Local setup, running against the Firebase Emulator Suite |
| [Firebase Setup](docs/FIREBASE_SETUP.md) | Creating the Firebase project, enabling Auth/Firestore/Storage, deploying security rules, creating the admin account |
| [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) | Every `.env.local` variable explained |
| [Deployment](docs/DEPLOYMENT.md) | General production deployment checklist |
| [Vercel Deployment](docs/VERCEL_DEPLOYMENT.md) | Step-by-step Vercel deployment |

## Project Structure

```
app/            Next.js App Router routes (route groups: (app) for the authenticated shell)
components/     Shared UI (ui/, layout/, charts/) — reusable across features
features/       Feature-based modules (auth, dashboard, ingredients, recipes, sales, ...)
                each with components/ and hooks/
services/       Firestore data-access layer, one file per collection/domain
lib/firebase/   Firebase modular SDK setup (config, auth, storage, firestore helpers)
types/          Shared TypeScript interfaces
constants/      App-wide constants (collection names, enums, nav)
utils/          Pure helper functions (formatting, calculations, exports)
public/         Static assets, PWA manifest, service worker, icons
docs/           This documentation set
```

## Architecture Notes

- **Data model** mirrors the spec's Firestore collections exactly: `saleItems`, `recipeItems`, and `purchaseItems` are separate collections (foreign-keyed by parent id), not embedded arrays — this keeps documents small and makes line-item queries (e.g. "what did this recipe use") direct.
- **Derived numbers are always server-computed.** Cost-per-gram, recipe cost/profit/margin, and sale totals are recalculated from source data on every write — the client never sends a cost/profit number that gets trusted as-is.
- **Stock changes are transactional.** Checking out a sale or recording a purchase runs inside a single Firestore transaction that writes the parent doc, its line items, and every affected ingredient's `currentStock` together, so stock can't drift out of sync with sales/purchase history.
- **Security is admin-only, everywhere.** `firestore.rules` and `storage.rules` gate every collection on `request.auth.token.email` matching the configured admin address — the same check the client makes, so there's no path to write data as anyone else even if the client were bypassed.
