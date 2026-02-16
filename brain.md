# Chooz — Second Brain

> This file is the project's living memory. Read it before contributing code. Update it after every meaningful session.

---

## Current State

**Phase:** Phase 0 complete, Phase 1 in progress
**Status:** Monorepo scaffolded and operational. Owner auth flow, restaurant profile management, and menu builder shipped. Mobile app and remaining dashboard features in progress.

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
| Confirm changes dialog | Done | `apps/web/components/restaurant/ConfirmChangesDialog.tsx` |
| Onboarding flow (welcome + setup) | Done | `apps/web/app/(onboarding)/welcome/`, `apps/web/app/(onboarding)/setup/` |
| Menu/category/item services | Done (backend) | `packages/services/src/firestore/` |
| Menu builder UI (drag-drop) | Done | `apps/web/app/(dashboard)/edit/`, `apps/web/components/menu/` |
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
| Storage | `packages/services/src/storage/` | Banner/logo/item image upload and delete, URL-based deletion |
| Env validation | `packages/services/src/env.ts` | Zod schema for Firebase config |
| Error handling | `packages/services/src/errors.ts` | AppError with typed codes |

### Key Web Components

| Component | File | Description |
|-----------|------|-------------|
| RestaurantForm | `apps/web/components/restaurant/RestaurantForm.tsx` | Full profile editing with hours, tags, publish toggle, draft auto-save, dirty tracking. Dual variant: "edit" (sticky bar) and "create" (static button) |
| ConfirmChangesDialog | `apps/web/components/restaurant/ConfirmChangesDialog.tsx` | Before/after review dialog for profile saves. Shows per-field diffs including detailed hours changes |
| ImageUploadSection | `apps/web/components/restaurant/ImageUploadSection.tsx` | Banner + logo upload with preview, replace, delete |
| OperatingHoursInput | `apps/web/components/restaurant/OperatingHoursInput.tsx` | Day-by-day open/close time editor |
| TagsSelect | `apps/web/components/restaurant/TagsSelect.tsx` | Multi-select for restaurant tags |
| AuthCard | `apps/web/components/AuthCard.tsx` | Shared auth page layout |
| OAuthButtons | `apps/web/components/OAuthButtons.tsx` | Google/Facebook/Apple sign-in buttons |
| MenuSidebar | `apps/web/components/menu/MenuSidebar.tsx` | Left panel: draggable menu list, settings popover (rename, visibility, availability, delete) |
| MenuSettingsPanel | `apps/web/components/menu/MenuSettingsPanel.tsx` | Menu visibility toggle, time availability, day chips |
| CategoryList | `apps/web/components/menu/CategoryList.tsx` | Droppable list of CategorySections + "Add Category" |
| CategorySection | `apps/web/components/menu/CategorySection.tsx` | Category card: drag-drop items, inline quick-add, settings popover |
| ItemCard | `apps/web/components/menu/ItemCard.tsx` | Item row: CSS grid layout, thumbnail, status badge dropdown, visibility toggle, edit/delete |
| ItemEditDialog | `apps/web/components/menu/ItemEditDialog.tsx` | Create/edit dialog with image upload, Save & Add Another |
| InlineEdit | `apps/web/components/menu/InlineEdit.tsx` | Click-to-edit text component |
| DeleteConfirmDialog | `apps/web/components/menu/DeleteConfirmDialog.tsx` | Type-to-confirm deletion with cascade warnings |
| AuthGuard | `apps/web/components/AuthGuard.tsx` | Role-based route protection |
| AuthProvider | `apps/web/components/AuthProvider.tsx` | Firebase auth state listener |

### Firebase Projects

| Environment | Project ID | Status |
|-------------|-----------|--------|
| Staging | `chooz-staging` | Active, deploys from `dev` branch |
| Production | `chooz-prod` | Active, deploys from `main` branch |
| Legacy | `chooz-1a9aa` | Still active in `chooz-web/owner-web/.firebaserc`, being replaced |

### GitHub Issues (Monorepo — `Chooz-Start-Up/chooz`)

**Closed (8):**

| # | Title |
|---|-------|
| 1 | infra: CI/CD with GitHub Actions |
| 2 | infra: Test infrastructure (Vitest + Jest) |
| 3 | infra: Algolia setup and Firestore → Algolia sync |
| 4 | infra: Migrate data from Realtime DB to Firestore |
| 5 | feat: Owner auth flow |
| 6 | feat: Restaurant profile management UI |
| 7 | feat: Menu builder with drag-drop reordering |

**Open (18):**

| # | Title | Backend | Web UI | Mobile UI |
|---|-------|---------|--------|-----------|
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
| 28 | Research: audit log for profile/menu changes | — | — | — |
| 29 | Import menu from image or PDF upload | 0% | 0% | — |
| 30 | Auto-generate item tags from name/description | 0% | 0% | — |

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
- **Web dashboard has stub pages too** — Admin routes return placeholder text. Auth pages, restaurant profile (including image uploads), onboarding flow, and menu builder are fully built.
- **Three route groups** — `(auth)` for public auth pages, `(dashboard)` for owner-protected pages with sidebar, `(onboarding)` for owner-protected pages without sidebar (welcome, setup).
- **RestaurantForm has two variants** — `"edit"` shows sticky bar with "View Changes" button (profile page), `"create"` shows centered submit button (setup page).
- **Publish toggle is gated** — Fields are not required to save/create, but name, description, and phone must be filled to toggle visibility to public. Toggle is proactively disabled with a warning message when fields are missing.
- **Draft persistence uses value comparison** — Compares against clean snapshot to avoid false drafts from React strict mode double-mounts.
- **Backend services are ahead of UI** — Most Firestore services (menu, category, item, claim, storage) are fully implemented but have no UI consuming them yet.
- **Firebase Dynamic Links deprecated** — QR code deep linking needs a replacement solution before Phase 1 launch.
- **Apple Sign-In required** — Apple requires it if you offer Google/Facebook sign-in on iOS. Must be added for mobile app. OAuthButtons component already includes Apple button.
- **Legacy data is in Realtime Database** — migration script exists but hasn't been run against production data yet.
- **MUI 5 uses InputLabelProps, not slotProps** — TextField `slotProps` is MUI 6+. Use `InputLabelProps={{ shrink: true }}` and `InputProps` for adornments.
- **Item visibility vs status badges are independent** — `isAvailable` controls whether the item shows on the customer menu at all. Status badges (Sold Out, New, etc.) are stored in the `tags[]` array and are visual indicators only. Changing a badge must NOT change `isAvailable`.
- **Category type has `isVisible` field** — Added in the menu builder session. Controls whether the category appears on the customer menu. Existing categories in Firestore may not have this field — converters should handle the default.

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

### 2026-02-14 — Session 4: Confirm changes dialog, onboarding flow, UX polish

**What was done:**
- **Confirm changes dialog** — Created `ConfirmChangesDialog.tsx` with `computeChanges()` utility. Shows before/after table when saving profile changes. Supports text, hours (per-day diff), tags, visibility, and image change types. Promise-based flow: form stays dirty if user cancels.
- **Logout button** — Added to dashboard sidebar, uses `authService.logout()` and redirects to `/login`.
- **Image upload on setup page** — Pre-generates Firestore document ID so images can upload before restaurant creation. `restaurantStore.createRestaurant` accepts optional pre-generated ID.
- **Welcome/onboarding page** — New `(onboarding)` route group (auth-protected, no sidebar). `/welcome` page with personalized greeting, onboarding steps, "Start a new restaurant" button, and disabled "Claim existing" button.
- **Setup page moved** — From `(dashboard)/setup` to `(onboarding)/setup`. No sidebar, centered layout, heading changed to "Set Up Your Restaurant Profile".
- **RestaurantForm variants** — Added `variant` prop: `"edit"` (sticky bar with "View Changes") vs `"create"` (static "Complete Setup" button).
- **Validation rework** — Fields no longer required for save/create. Only name, description, and phone required to toggle visibility to public. Publish toggle proactively disabled with warning Alert when fields missing.
- **Draft persistence fix** — Fixed React strict mode double-mount causing phantom drafts by comparing against clean snapshot instead of render-count ref.
- **UX polish** — Sticky bar button renamed to "View Changes", draft banner dismissed after successful save, removed browser `beforeunload` popup (drafts auto-persist).
- **Audit log ticket** — Created GitHub issue #28 (research: audit log for profile/menu changes).
- Updated `usePostLoginRedirect` to redirect owners to `/profile` instead of `/edit`.
- Profile page redirects to `/welcome` when no restaurant exists.

**Key context for next session:**
- Onboarding flow: `/welcome` → `/setup` → `/profile`
- Claim flow UI not yet built (button exists but disabled with "Coming Soon")
- Menu builder UI (#7) is the main remaining dashboard feature
- Audit log (#28) is backlog for future investigation

### 2026-02-15 — Session 5: Menu builder with drag-drop reordering

**What was done:**
- **Full menu builder UI** (Issue #7) — implemented 8 new components and rewrote the edit page + menuStore:
  - Two-panel layout: 280px draggable sidebar + content area (`height: 100vh, m: -4`)
  - `MenuSidebar` — draggable menu list, cog icon opens Popover with rename (InlineEdit), MenuSettingsPanel, and delete
  - `MenuSettingsPanel` — "Visible on Menu" switch (`isActive`), "All Day" checkbox + time inputs, day chips with DAY_LABELS lookup
  - `CategoryList` + `CategorySection` — draggable categories, cog icon for settings (rename, visibility, delete)
  - `ItemCard` — CSS grid layout (`24px 1fr 72px 120px 96px`), status badge dropdown, visibility eye icon, edit/delete
  - `ItemEditDialog` — name, description, price (2-decimal enforcement), ingredients, tags, "Save & Add Another"
  - Inline quick-add row per category: name + price + Add button + Full Form button
  - `DeleteConfirmDialog` — type-to-confirm for categories and menus, cascade breakdown with bullet list
  - `InlineEdit` — click-to-edit with spinner
- **Zustand menuStore rewrite** — full CRUD + reorder for menus/categories/items, optimistic updates with rollback
- **Service layer** — added `generateMenuId`, `generateCategoryId`, `generateItemId`
- **Shared types** — added `isVisible: boolean` to `Category` type
- **Bug fix** — badge change no longer sets `isAvailable` (visibility and status badges are independent)
- **Created tickets** — #29 (import menu from image/PDF) and #30 (auto-generate item tags)
- **Closed** — #7

**Key design decisions:**
- Status badges stored in `tags[]` array, independent from `isAvailable` (visibility)
- Visibility indicators: dimmed text (50% opacity) + VisibilityOff icon on hidden menus/categories
- Single `DragDropContext` dispatches by type: MENU, CATEGORY, ITEM
- Items cannot drag across categories (v1 constraint)

**Key context for next session:**
- Core owner dashboard features are done: auth, profile, menu builder
- Firebase Storage (#25) blocks image upload verification (#26)
- Claim flow (#10), admin dashboard (#11), and customer-facing features are next
- Nice-to-haves: #29 (menu import from image), #30 (auto-tag items), #23 (expand tags)

### 2026-02-15 — Session 6: Item image upload in menu builder

**What was done:**
- **Storage helpers** — Added `uploadItemImage(restaurantId, imageId, file)` and `deleteImageByUrl(url)` to `packages/services/src/storage/index.ts`. `deleteImageByUrl` parses the storage path from a Firebase download URL's `/o/` segment for generic cleanup.
- **Item image upload UI** — Full image upload flow in `ItemEditDialog.tsx`:
  - Full-width image area at the top of the dialog (above Name field)
  - Dashed placeholder with camera icon when no image; full-width 200px preview when image exists
  - Replace (photo icon) and delete (trash icon) overlay buttons on preview
  - Delete confirmation dialog with image preview before removal
  - 5 MB file size validation, image MIME type validation, spinner overlay during operations
  - Immediate upload pattern (same as profile banner/logo)
  - Image state resets on "Save & Add Another"
- **Thumbnail in item list** — Added 36x36 rounded thumbnail to `ItemCard` grid, positioned between the status badge and action buttons
- **Image cleanup on deletion** — `menuStore.ts` now cleans up storage images (best-effort) when deleting items, categories, or menus
- **Prop threading** — `restaurantId` threaded from `edit/page.tsx` → `CategoryList` → `CategorySection` → `ItemEditDialog`
- No new files, no type changes, no storage rule changes. `pnpm typecheck` passes.

**Key design decisions:**
- Image upload works in both create and edit mode (unlike profile images which require an existing document)
- Uses `crypto.randomUUID()` for storage paths: `restaurants/{rid}/items/{uuid}`
- `deleteImageByUrl` allows cleanup without knowing the original path structure
- Image cleanup on delete is best-effort (try/catch, non-blocking) — doesn't prevent Firestore deletion if storage cleanup fails

**Key context for next session:**
- No ticket existed for this feature — consider creating one retroactively if tracking matters
- #26 (profile image verification) and #31 (image refinements) are still open and unrelated to this work
- Item images use a different storage path pattern than banner/logo (`items/{uuid}` vs `banner`/`logo`)
- The immediate upload pattern means orphaned images can exist if user uploads then cancels without saving — #31's deferred persistence would fix this
