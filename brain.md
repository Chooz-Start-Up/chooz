# Chooz — Second Brain

> This file is the project's living memory. Read it before contributing code. Update it after every meaningful session.

---

## Current State

**Phase:** Phase 0 complete, Phase 1 in progress
**Status:** Monorepo scaffolded and operational. Owner auth flow and restaurant profile management shipped. Mobile app and remaining dashboard features in progress.

### What exists today

| Component | Status | Location |
|-----------|--------|----------|
| Monorepo scaffold (Turborepo + pnpm) | Done | Root (`turbo.json`, `pnpm-workspace.yaml`) |
| `@chooz/shared` (types, constants) | Done | `packages/shared/` |
| `@chooz/services` (Firebase layer) | Done | `packages/services/` |
| `@chooz/web` (Next.js 15, App Router) | Active development | `apps/web/` |
| `@chooz/mobile` (Expo 54, Expo Router) | Scaffolded, screens stubbed | `apps/mobile/` |
| `@chooz/functions` (Cloud Functions) | Done | `functions/` |
| CI/CD (GitHub Actions) | Done | `.github/workflows/` |
| Test infrastructure (Vitest) | Done (23 tests) | Across packages |
| Algolia sync (Firestore → Algolia) | Done | `functions/src/algolia/sync.ts` |
| RTDB → Firestore migration script | Done | `scripts/migrate-rtdb-to-firestore.ts` |
| Firebase staging/prod config | Done | `.firebaserc` |
| Owner auth flow (login, register, verify, reset) | Done | `apps/web/app/(auth)/` |
| Restaurant profile management UI | Done | `apps/web/app/(dashboard)/profile/`, `RestaurantForm.tsx` |
| Menu/category/item services | Done (backend) | `packages/services/src/firestore/` |
| Menu builder UI (drag-drop) | Not started (stub only) | `apps/web/app/(dashboard)/edit/` |
| Image management UI | Done (on profile page) | `apps/web/components/restaurant/ImageUploadSection.tsx` |
| Claim flow services | Done (backend) | `packages/services/src/firestore/claim.ts` |
| Claim flow UI | Not started | — |
| Admin dashboard | Stubs only | `apps/web/app/(admin)/` |
| Customer web fallback | Stubs only | `apps/web/app/restaurant/[id]/` |
| Mobile screens | All stubbed, none implemented | `apps/mobile/app/` |
| Legacy web app (CRA + React 18) | Running, reference only | `chooz-web/owner-web/` |
| PRD v1.0 | Complete | `PRD.md` |
| Rebuild notes | Complete | `CHOOZ_REBUILD_NOTES.md` |

### Monorepo Structure (Actual)

```
chooz/
├── apps/web/           → @chooz/web      — Next.js 15 (App Router, Turbopack)
├── apps/mobile/        → @chooz/mobile   — Expo 54 (Expo Router)
├── packages/shared/    → @chooz/shared   — Types, constants, defaults (zero dependencies)
├── packages/services/  → @chooz/services — Firebase service layer (auth, Firestore, storage)
├── functions/          → @chooz/functions — Cloud Functions for Firebase
├── scripts/            → Migration tools
├── turbo.json
├── firebase.json
├── firestore.rules
├── storage.rules
└── pnpm-workspace.yaml
```

### Key Implemented Services

| Service | File | Capabilities |
|---------|------|-------------|
| Auth | `packages/services/src/auth/` | Email/password, Google, Facebook, Apple OAuth, email verification, password reset |
| Restaurant | `packages/services/src/firestore/restaurant.ts` | Full CRUD, query by owner, publish/unpublish |
| Menu | `packages/services/src/firestore/menu.ts` | Full CRUD for menus |
| Category | `packages/services/src/firestore/category.ts` | Full CRUD for categories |
| Item | `packages/services/src/firestore/item.ts` | Full CRUD for items |
| Claim | `packages/services/src/firestore/claim.ts` | Create, review, status tracking |
| Storage | `packages/services/src/storage/` | Banner/logo upload and delete |
| Env validation | `packages/services/src/env.ts` | Zod schema for Firebase config |
| Error handling | `packages/services/src/errors.ts` | AppError with typed codes |

### Key Web Components

| Component | File | Description |
|-----------|------|-------------|
| RestaurantForm | `apps/web/components/RestaurantForm.tsx` | 400+ lines — full profile editing with hours, tags, publish toggle, draft auto-save, dirty tracking |
| OperatingHoursInput | `apps/web/components/OperatingHoursInput.tsx` | Day-by-day open/close time editor |
| TagsSelect | `apps/web/components/TagsSelect.tsx` | Multi-select for restaurant tags |
| AuthCard | `apps/web/components/AuthCard.tsx` | Shared auth page layout |
| OAuthButtons | `apps/web/components/OAuthButtons.tsx` | Google/Facebook/Apple sign-in buttons |
| AuthGuard | `apps/web/components/AuthGuard.tsx` | Role-based route protection |
| AuthProvider | `apps/web/components/AuthProvider.tsx` | Firebase auth state listener |

### Firebase Projects

| Environment | Project ID | Status |
|-------------|-----------|--------|
| Staging | `chooz-staging` | Active, deploys from `dev` branch |
| Production | `chooz-prod` | Active, deploys from `main` branch |
| Legacy | `chooz-1a9aa` | Still active in `chooz-web/owner-web/.firebaserc`, being replaced |

### GitHub Issues (Monorepo — `Chooz-Start-Up/chooz`)

**Closed (7):**

| # | Title |
|---|-------|
| 1 | infra: CI/CD with GitHub Actions |
| 2 | infra: Test infrastructure (Vitest + Jest) |
| 3 | infra: Algolia setup and Firestore → Algolia sync |
| 4 | infra: Migrate data from Realtime DB to Firestore |
| 5 | feat: Owner auth flow |
| 6 | feat: Restaurant profile management UI |

**Open (17):**

| # | Title | Backend | Web UI | Mobile UI |
|---|-------|---------|--------|-----------|
| 7 | Menu builder with drag-drop | 100% | 0% (stub) | — |
| 8 | Image management (banner + logo) | 100% | 100% | — |
| 9 | QR code generation and share | 0% | 0% | 0% |
| 10 | Claim restaurant flow | 80% | 0% | — |
| 11 | Admin dashboard P1 (seed, claims, moderation) | 40% | 0% (stubs) | — |
| 12 | Customer mobile auth flow | 100% | — | 0% (stub) |
| 13 | Customer mobile nearby restaurants | 30% | — | 0% (stub) |
| 14 | Customer mobile menu viewer | 70% | — | 0% (stub) |
| 15 | Customer mobile search + filters (Algolia) | 100% | — | 0% (stub) |
| 16 | Customer mobile notes page | 0% | — | 0% (stub) |
| 17 | Customer web fallback (SSR) | 100% | 0% (stub) | — |
| 18 | Deep linking + QR routing | 0% | 0% | 0% |
| 19 | Trust & safety — ownership badges | 100% | 0% | 0% |
| 20 | Admin dashboard P2 — owner support tools | 0% | 0% | — |
| 21 | Research: owner-to-restaurant 1:many | — | — | — |
| 22 | Research: multi-location support | — | — | — |
| 23 | Expand restaurant tag options | 80% | 20% | 0% |

### Legacy Issues (chooz-web — `Chooz-Start-Up/chooz-web`)

5 legacy issues remain open (#3, #5, #8, #12, #16). These are from the old repo and may be superseded by monorepo work.

---

## Decisions Made

### Architecture
- **Next.js 15 over Vite** — SSR needed for customer-facing restaurant pages (SEO), API routes for admin tools and AI hooks
- **Monorepo with Turborepo + pnpm** — shared types and services across web + mobile
- **Zustand over Redux/Context** — lightweight, TypeScript-first state management
- **Firestore over Realtime DB** — better querying (compound queries, collection groups), needed for filters/search
- **Algolia for search** — Firestore can't do cross-restaurant item-level text search ("burger near me")
- **MUI 5 stays** — already in use, good component library, drop Styled Components (use sx prop + Emotion only)

### Data Model
- Single `users` collection with `role: 'customer' | 'owner' | 'admin'`
- Restaurants have `ownershipStatus: 'seeded' | 'claimed' | 'verified'` to support marketplace seeding strategy
- Menus are subcollections: `restaurants/{id}/menus/{id}/categories/{id}/items/{id}`
- Timestamps represented as `{ seconds: number; nanoseconds: number }` in shared types — conversion in service layer

### Firebase
- Staging (`chooz-staging`) deploys from `dev` branch
- Production (`chooz-prod`) deploys from `main` branch
- Legacy project `chooz-1a9aa` will be decommissioned after migration
- Dynamic Links are deprecated — need to find alternative (App Links / Universal Links, Branch.io, or custom solution)

---

## Gotchas & Watch-Outs

- **Two repos in play** — `Chooz-Start-Up/chooz` is the monorepo (active development). `Chooz-Start-Up/chooz-web` is the legacy repo. Issues live in both — monorepo issues are the ones that matter.
- **Legacy app is in `chooz-web/owner-web/`** — CRA, class components, direct Firebase calls. Reference implementation only.
- **Mobile screens are all stubs** — Expo Router file structure exists but every screen is a placeholder. No mobile UI has been implemented yet.
- **Web dashboard has stub pages too** — `edit/`, admin routes all return placeholder text. Only auth pages and restaurant profile (including image uploads) are fully built.
- **Backend services are ahead of UI** — Most Firestore services (menu, category, item, claim, storage) are fully implemented but have no UI consuming them yet.
- **Firebase Dynamic Links deprecated** — QR code deep linking needs a replacement solution before Phase 1 launch.
- **Apple Sign-In required** — Apple requires it if you offer Google/Facebook sign-in on iOS. Must be added for mobile app. OAuthButtons component already includes Apple button.
- **Legacy data is in Realtime Database** — migration script exists but hasn't been run against production data yet.

---

## Session Log

### 2026-02-14 — Session 2: Issue housekeeping and brain setup

**What was done:**
- Audited all 24 issues across both repos (`chooz` monorepo and `chooz-web` legacy)
- Closed 2 issues on monorepo: #4 (migration script), #6 (restaurant profile UI)
- Closed 7 issues on legacy repo: #4, #6, #7, #9, #10, #11, #13 (completed or superseded by rebuild)
- Created `/test-steps` personal skill for step-by-step verification workflows
- Created `/init-brain` personal skill for bootstrapping brain.md on any project
- Created and updated this `brain.md` file
- Added brain.md reference to `CLAUDE.md`

**Key context for next session:**
- Phase 1 web dashboard work: #7 (menu builder UI) and #8 (image management UI) have full backend support — just need UI
- Mobile app is entirely stubbed — no screens implemented yet
- QR code / deep linking (#9, #18) blocked on Dynamic Links replacement decision
- Admin dashboard (#11, #20) needs UI work

### 2026-02-14 — Session 3: Image uploads on profile page

**What was done:**
- Created `ImageUploadSection` component (`apps/web/components/restaurant/ImageUploadSection.tsx`)
  - Banner upload (3:1 aspect ratio, full-width) with preview, replace, and delete
  - Logo upload (120x120 circle) with preview, replace, and delete
  - Click-to-upload via hidden file input, 5 MB client-side validation
  - Spinner overlay during upload/delete, inline error alerts
- Wired `ImageUploadSection` into profile page above `RestaurantForm`
  - `onImageUpdated` callback calls `updateRestaurant` to persist URL to Firestore
- Deleted `/images` stub page and removed "Images" nav link from dashboard sidebar
- Updated `brain.md` to reflect image management as done

**Key context for next session:**
- Image uploads are immediate (not tied to form save lifecycle)
- Storage paths: `restaurants/{id}/banner` and `restaurants/{id}/logo`
- #8 can be closed on GitHub once verified
