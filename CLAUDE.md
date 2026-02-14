# Chooz — Project Conventions

## What is this project?

Chooz is a restaurant menu discovery platform. Restaurant owners publish menus via a web dashboard, customers browse and search menus via a mobile app. A web fallback provides read-only access for users without the app.

## Monorepo Structure

```
chooz/
├── apps/web/           → @chooz/web      — Next.js 15 (App Router, Turbopack)
├── apps/mobile/        → @chooz/mobile   — Expo 54 (Expo Router)
├── packages/shared/    → @chooz/shared   — Types, constants, defaults (zero dependencies)
├── packages/services/  → @chooz/services — Firebase service layer (auth, Firestore, storage)
├── functions/          → @chooz/functions — Cloud Functions for Firebase
├── turbo.json                            — Turborepo pipeline config
├── firebase.json                         — Firebase project config + emulators
└── pnpm-workspace.yaml                   — Workspace definition
```

## Commands

```bash
pnpm install          # Install all workspace dependencies
pnpm build            # Build all packages (respects dependency order)
pnpm dev:web          # Start Next.js dev server (localhost:3000)
pnpm dev:mobile       # Start Expo dev server (localhost:8081)
pnpm lint             # TypeScript + ESLint checks across all packages
pnpm typecheck        # TypeScript only across all packages
pnpm clean            # Remove build artifacts
```

## Architecture Principles

1. **Shared types are framework-agnostic.** `@chooz/shared` has zero runtime dependencies. It defines plain TypeScript interfaces. Firebase `Timestamp` is represented as `{ seconds: number; nanoseconds: number }` — conversion happens in the service layer.

2. **Components never call Firebase directly.** All data access goes through `@chooz/services`. This keeps UI code testable and makes it possible to swap backends.

3. **Errors are typed at the service boundary.** Firebase exceptions are caught and wrapped into `AppError` (defined in `packages/services/src/errors.ts`). Components catch `AppError` with a typed `code` field — never raw Firebase errors.

4. **Firestore reads use typed converters.** Every collection has a converter in `packages/services/src/firestore/converters.ts` that handles `withConverter()` for type-safe reads and Timestamp conversion. Never use `as Type` assertions on Firestore data.

5. **Environment variables are validated at startup.** `packages/services/src/env.ts` uses zod to validate Firebase config. If any env var is missing, the app fails immediately with a descriptive error. Add new env vars to this schema.

6. **State lives in Zustand stores.** Web app state is in `apps/web/stores/`. Each store is a single `create()` call. No Redux, no Context for state.

7. **Route protection uses layout-level guards.** `(dashboard)` routes require `owner` role, `(admin)` routes require `admin` role. The `AuthGuard` component in `apps/web/components/AuthGuard.tsx` handles redirects.

## Adding a New Firestore Collection

1. **Define the type** in `packages/shared/src/types/<name>.ts` — use `Timestamp` from `./common`, not from Firebase
2. **Export it** from `packages/shared/src/types/index.ts`
3. **Create a converter** in `packages/services/src/firestore/converters.ts`
4. **Create the service module** in `packages/services/src/firestore/<name>.ts` — follow the pattern of existing modules (converter for reads, `serverTimestamp()` for writes, `toAppError()` in catch blocks)
5. **Export the service** from `packages/services/src/index.ts`
6. **Add Firestore rules** in `firestore.rules` at the root
7. If the collection needs search, add an Algolia sync trigger in `functions/src/algolia/`

## Adding a New Page (Web)

1. Create `apps/web/app/<route-group>/<path>/page.tsx`
2. Route groups: `(auth)` = public auth pages, `(dashboard)` = owner-protected, `(admin)` = admin-protected, top-level = public
3. Use `"use client"` directive only for components with interactivity/hooks
4. Keep pages thin — data fetching and business logic belong in stores and services

## Adding a New Screen (Mobile)

1. Create `apps/mobile/app/<path>.tsx` for stack screens or `apps/mobile/app/(tabs)/<name>.tsx` for tab screens
2. Use `useLocalSearchParams` for route params
3. Follow Expo Router file-based routing conventions

## Key Patterns

### Service function signature
```typescript
export async function getEntity(id: string): Promise<Entity | null> {
  try {
    const snap = await getDoc(doc(collectionRef(), id));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    throw toAppError(error);
  }
}
```

### Error handling in components
```typescript
import { AppError } from "@chooz/services";

try {
  await restaurantService.createRestaurant(id, data);
} catch (error) {
  if (error instanceof AppError) {
    switch (error.code) {
      case "permission-denied": /* handle */ break;
      case "already-exists": /* handle */ break;
      default: /* handle */ break;
    }
  }
}
```

## Tech Stack Quick Reference

| Layer | Choice |
|-------|--------|
| Package manager | pnpm (workspaces) |
| Monorepo | Turborepo |
| Web framework | Next.js 15 (App Router) |
| Mobile framework | Expo 54 + Expo Router |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Search | Algolia (via Cloud Function sync) |
| State management | Zustand |
| UI (web) | MUI 5 + Emotion |
| Language | TypeScript (strict mode) |

## Issue / Ticket Standard

### Title
`prefix: Short description`

Prefixes:
- `feat` — new feature or user-facing functionality
- `fix` — bug fix
- `infra` — CI/CD, tooling, config, testing infrastructure, migrations
- `research` — investigation, spike, or design exploration

### Body Template
Every issue must include these four sections:

```markdown
## Description
Why this work is needed and a summary of what needs to be done. Link to relevant PRD section or prior issues.

## Completion Criteria
- [ ] Concrete, verifiable checklist of what "done" looks like
- [ ] Each item should be independently testable

## Implementation
**Key files:**
- `path/to/file.ts` — what changes here

**Approach:**
High-level description of the implementation strategy.

## Dependencies
- Blocked by: #X (or "None")
- Blocks: #Y (or "None")
```

### Labels
- Phase: `phase-0`, `phase-1`
- Platform: `web-dashboard`, `mobile`, `web-fallback`
- Domain: `infra`, `search`

## Firebase Project

- Project ID: `chooz-1a9aa`
- Emulators: Auth (9099), Functions (5001), Firestore (8080), Storage (9199)
