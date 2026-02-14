# Chooz

Chooz is a restaurant menu discovery platform. Restaurant owners publish and manage their menus via a web dashboard. Customers browse, search, and compare menus via a mobile app. A web fallback provides read-only access for users without the app.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Monorepo | Turborepo + pnpm workspaces |
| Web | Next.js 15 (App Router) |
| Mobile | Expo 54 + Expo Router |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Search | Algolia (via Cloud Function sync) |
| State | Zustand |
| UI (web) | MUI 5 + Emotion |
| Language | TypeScript (strict mode) |

## Monorepo Structure

```
chooz/
├── apps/
│   ├── web/              → @chooz/web        Next.js owner dashboard + customer web fallback
│   └── mobile/           → @chooz/mobile     Expo React Native customer app
├── packages/
│   ├── shared/           → @chooz/shared     Types, constants, defaults (zero dependencies)
│   └── services/         → @chooz/services   Firebase service layer (auth, Firestore, storage)
├── functions/            → @chooz/functions   Cloud Functions for Firebase
├── turbo.json                                 Turborepo pipeline config
├── firebase.json                              Firebase project config + emulators
└── pnpm-workspace.yaml                        Workspace definition
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Firebase CLI** (`npm install -g firebase-tools`)
- A Firebase project (see [Environment Variables](#environment-variables))

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Chooz-Start-Up/chooz.git
cd chooz

# 2. Install dependencies
pnpm install

# 3. Set up environment variables (see below)
cp apps/web/.env.local.example apps/web/.env.local
# Fill in your Firebase config values

# 4. Start development
pnpm dev:web      # Next.js → http://localhost:3000
pnpm dev:mobile   # Expo → http://localhost:8081
```

## Environments

| Environment | Firebase Project | Branch | Deploy trigger |
|-------------|-----------------|--------|----------------|
| Staging | `chooz-staging` | `dev` | Push to `dev` |
| Production | `chooz-prod` | `main` | Push to `main` |

### Switching environments locally

```bash
# Use staging config
cp apps/web/.env.staging apps/web/.env.local

# Use production config (read-only testing)
cp apps/web/.env.production apps/web/.env.local
```

### Firebase project aliases

```bash
firebase use staging      # switch CLI to chooz-staging
firebase use production   # switch CLI to chooz-prod
```

### Branch workflow

1. Create feature branches from `dev`
2. Open PRs targeting `dev` — merging triggers a staging deploy
3. When ready for production, merge `dev` into `main` — triggers a production deploy

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `FIREBASE_SA_STAGING` | Service account JSON for `chooz-staging` |
| `FIREBASE_SA_PRODUCTION` | Service account JSON for `chooz-prod` |

## Environment Variables

Copy one of the env files to `.env.local` (see above), or copy the example and fill in manually:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

For the mobile app, use the `EXPO_PUBLIC_` prefix with the same variable names.

Environment variables are validated at runtime via zod (`packages/services/src/env.ts`). Missing variables will produce a descriptive error on startup.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all workspace dependencies |
| `pnpm build` | Build all packages (respects dependency order) |
| `pnpm dev:web` | Start Next.js dev server (localhost:3000) |
| `pnpm dev:mobile` | Start Expo dev server (localhost:8081) |
| `pnpm lint` | TypeScript + ESLint checks across all packages |
| `pnpm typecheck` | TypeScript type checking only |
| `pnpm clean` | Remove build artifacts |

## Firebase Emulators

The project is configured with local emulators for development:

```bash
firebase emulators:start
```

| Service | Port |
|---------|------|
| Auth | 9099 |
| Functions | 5001 |
| Firestore | 8080 |
| Storage | 9199 |
| Emulator UI | auto |

## Architecture

### Packages

- **`@chooz/shared`** — Framework-agnostic TypeScript types and constants. Zero runtime dependencies. Firebase `Timestamp` is represented as a plain `{ seconds: number; nanoseconds: number }` interface; conversion to/from Firestore timestamps happens in the service layer.

- **`@chooz/services`** — Firebase service layer consumed by both web and mobile apps. Handles auth, Firestore CRUD, and Storage operations. All Firestore reads use typed converters (`withConverter`). All Firebase errors are caught and wrapped into `AppError` with a typed `code` field. Components never call Firebase directly.

- **`@chooz/web`** — Next.js app with three route groups:
  - `(auth)` — Public auth pages (login, register, verify email, reset password)
  - `(dashboard)` — Owner-protected routes (requires `owner` role)
  - `(admin)` — Admin-protected routes (requires `admin` role)
  - Top-level — Public pages (landing, restaurant profiles for SEO)

- **`@chooz/mobile`** — Expo app with tab-based navigation (Home, Search, Notes) and stack screens for restaurant/menu views.

- **`@chooz/functions`** — Cloud Functions for Algolia sync, admin seeding, and claim processing.

### Data Model

Firestore collections:

```
users/{uid}
restaurants/{restaurantId}
restaurants/{restaurantId}/menus/{menuId}
restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}
restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}/items/{itemId}
claimRequests/{requestId}
users/{uid}/notes/{noteId}
users/{uid}/favorites/{favoriteId}
```

See `packages/shared/src/types/` for full type definitions.

### Error Handling

The service layer wraps all Firebase errors into typed `AppError` instances:

```typescript
import { AppError } from "@chooz/services";

try {
  await restaurantService.createRestaurant(id, data);
} catch (error) {
  if (error instanceof AppError) {
    // error.code is typed: "not-found" | "permission-denied" | "already-exists" | ...
  }
}
```

## Contributing

See `CLAUDE.md` for project conventions, patterns for adding new collections/pages/screens, and the issue/ticket standard.
