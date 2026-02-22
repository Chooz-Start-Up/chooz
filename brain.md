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
| Test infrastructure (Vitest) | Done (43 tests) | Across packages |
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
| Admin dashboard (seed, claims, moderation) | Done | `apps/web/app/(admin)/`, `apps/web/stores/adminStore.ts`, `apps/web/components/admin/` |
| Landing page | Done | `apps/web/app/page.tsx`, `apps/web/components/landing/` |
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
| Restaurant | `packages/services/src/firestore/restaurant.ts` | Full CRUD, query by owner, query all (admin), publish/unpublish |
| Menu | `packages/services/src/firestore/menu.ts` | Full CRUD for menus |
| Category | `packages/services/src/firestore/category.ts` | Full CRUD for categories |
| Item | `packages/services/src/firestore/item.ts` | Full CRUD for items |
| Claim | `packages/services/src/firestore/claim.ts` | Create, review, status tracking, query all (admin) |
| Admin (callables) | `packages/services/src/functions/index.ts` | `seedRestaurant`, `processClaim` via `httpsCallable` |
| Storage | `packages/services/src/storage/` | Banner/logo/item image upload and delete, URL-based deletion. Helpers require `ownerUid` as first param — embedded in path for ownership enforcement |
| Env validation | `packages/services/src/env.ts` | Zod schema for Firebase config |
| Error handling | `packages/services/src/errors.ts` | AppError with typed codes |

### Key Web Components

| Component | File | Description |
|-----------|------|-------------|
| RestaurantForm | `apps/web/components/restaurant/RestaurantForm.tsx` | Full profile editing with hours, tags, publish toggle, draft auto-save, dirty tracking. Dual variant: "edit" (sticky bar) and "create" (static button) |
| ConfirmChangesDialog | `apps/web/components/restaurant/ConfirmChangesDialog.tsx` | Before/after review dialog for profile saves. Shows per-field diffs including detailed hours changes |
| ImageUploadSection | `apps/web/components/restaurant/ImageUploadSection.tsx` | Banner + logo upload with preview, replace, delete. Dual variant: "card" (Paper wrapper, used on setup page) and "hero" (full-width banner with overlapping logo, used on profile page) |
| OperatingHoursInput | `apps/web/components/restaurant/OperatingHoursInput.tsx` | Day-by-day open/close time editor with "Copy hours to..." menu (all days, weekdays, weekends) |
| TagsSelect | `apps/web/components/restaurant/TagsSelect.tsx` | Multi-select for restaurant tags |
| AuthCard | `apps/web/components/AuthCard.tsx` | Shared auth page layout |
| OAuthButtons | `apps/web/components/OAuthButtons.tsx` | Google/Facebook/Apple sign-in buttons |
| MenuSidebar | `apps/web/components/menu/MenuSidebar.tsx` | Left panel: draggable menu list, settings popover (rename, visibility, availability, delete) |
| MenuSettingsPanel | `apps/web/components/menu/MenuSettingsPanel.tsx` | Menu visibility toggle, time availability, day chips |
| CategoryList | `apps/web/components/menu/CategoryList.tsx` | Droppable list of CategorySections + "Add Category" |
| CategorySection | `apps/web/components/menu/CategorySection.tsx` | Category card: drag-drop items, inline quick-add, settings popover |
| ItemCard | `apps/web/components/menu/ItemCard.tsx` | Item row: CSS grid layout, thumbnail, dietary icons under description, status badge dropdown, visibility toggle, edit/delete |
| ItemEditDialog | `apps/web/components/menu/ItemEditDialog.tsx` | Create/edit dialog with image upload, dietary checkboxes (with spice level), Save & Add Another |
| InlineEdit | `apps/web/components/menu/InlineEdit.tsx` | Click-to-edit text component |
| DeleteConfirmDialog | `apps/web/components/menu/DeleteConfirmDialog.tsx` | Type-to-confirm deletion with cascade warnings |
| ClaimReviewCard | `apps/web/components/admin/ClaimReviewCard.tsx` | Claim card with status chip, approve/reject buttons, confirm dialog |
| RestaurantEditDialog | `apps/web/components/admin/RestaurantEditDialog.tsx` | Lightweight edit dialog for name, description, tags, published |
| LandingHeader | `apps/web/components/landing/LandingHeader.tsx` | Sticky AppBar with logo + "Log In" / "Get Started" nav |
| RestaurantPreviewGrid | `apps/web/components/landing/RestaurantPreviewGrid.tsx` | Fetches up to 8 published restaurants, card grid with skeleton loading |
| AuthGuard | `apps/web/components/AuthGuard.tsx` | Role-based route protection |
| AuthProvider | `apps/web/components/AuthProvider.tsx` | Firebase auth state listener |

### Firebase Projects

| Environment | Project ID | Status |
|-------------|-----------|--------|
| Staging | `chooz-staging` | Active, deploys from `dev` branch |
| Production | `chooz-prod` | Active, deploys from `main` branch |
| Legacy | `chooz-1a9aa` | Still active in `chooz-web/owner-web/.firebaserc`, being replaced |

### GitHub Issues (Monorepo — `Chooz-Start-Up/chooz`)

**Closed (10):**

| # | Title |
|---|-------|
| 1 | infra: CI/CD with GitHub Actions |
| 2 | infra: Test infrastructure (Vitest + Jest) |
| 3 | infra: Algolia setup and Firestore → Algolia sync |
| 4 | infra: Migrate data from Realtime DB to Firestore |
| 5 | feat: Owner auth flow |
| 6 | feat: Restaurant profile management UI |
| 7 | feat: Menu builder with drag-drop reordering |
| 8 | feat: Image management (banner + logo) |
| 11 | feat: Admin dashboard P1 (seed, claims, moderation) |
| 34 | feat: Landing page for restaurant owners |

**Open (34):**

| # | Title | Backend | Web UI | Mobile UI |
|---|-------|---------|--------|-----------|
| 9 | QR code generation and share | 0% | 0% | 0% |
| 10 | Claim restaurant flow | 80% | 0% | — |
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
| 24 | Preview button for owners | 100% | 0% | — |
| 25 | Firebase Storage setup (staging + prod) | — | — | — |
| 26 | Finish image upload on profile page | — | blocked by #25 | — |
| 27 | Research: food trucks and mobile vendors | — | — | — |
| 28 | Research: audit log for profile/menu changes | — | — | — |
| 29 | Import menu from image or PDF upload | 0% | 0% | — |
| 30 | Auto-generate item tags from name/description | 0% | 0% | — |
| 31 | Image upload refinements | 0% | 0% | — |
| 32 | Research: restricted restaurant name change flow | — | — | — |
| 33 | Research: customer report system for restaurant pages | — | — | — |
| 35 | feat: Mobile-responsive dashboard + mobile editing warning | 0% | 0% | — |
| 36 | fix: Storage rules allow any auth user to overwrite restaurant images (P0) | — | — | — |
| 37 | fix: Algolia sync indexes items from unpublished restaurants and unavailable items (P0) | — | — | — |
| 38 | infra: Run RTDB-to-Firestore production data migration and decommission legacy project (P0) | — | — | — |
| 39 | infra: Provision Algolia API keys for staging and production environments (P0) | — | — | — |
| 40 | feat: Require admin approval before owner-created restaurants are published (P1) | — | — | — |
| 41 | fix: menuStore has no error state and silent failures on mutation operations (P1) | — | — | — |
| 42 | research: Firebase web SDK vs React Native Firebase compatibility (P1) | — | — | — |
| 43 | fix: deleteRestaurant does not cascade-delete subcollections or Storage objects (P2) | — | — | — |
| 44 | fix: updateClaimRequest writes undeclared updatedAt field not on ClaimRequest type (P2) | — | — | — |

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
- **Admin dashboard is fully built** — Seed tool, claims queue, restaurant moderation table all functional. Cloud Functions (`seedRestaurant`, `processClaim`) deployed to staging. Admin route group requires `role: "admin"` in the user document.
- **Three route groups** — `(auth)` for public auth pages, `(dashboard)` for owner-protected pages with sidebar, `(onboarding)` for owner-protected pages without sidebar (welcome, setup).
- **RestaurantForm has two variants** — `"edit"` shows sticky bar with "View Changes" button (profile page), `"create"` shows centered submit button (setup page).
- **Publish toggle is gated** — Fields are not required to save/create, but name, description, and phone must be filled to toggle visibility to public. Toggle is proactively disabled with a warning message when fields are missing.
- **Draft persistence uses value comparison** — Compares against clean snapshot to avoid false drafts from React strict mode double-mounts.
- **Backend services are ahead of UI** — Most Firestore services (menu, category, item, claim, storage) are fully implemented but have no UI consuming them yet.
- **Firebase Dynamic Links deprecated** — QR code deep linking needs a replacement solution before Phase 1 launch.
- **Apple Sign-In required** — Apple requires it if you offer Google/Facebook sign-in on iOS. Must be added for mobile app. OAuthButtons component already includes Apple button.
- **Legacy data is in Realtime Database** — migration script exists but hasn't been run against production data yet.
- **Storage paths include `ownerUid`** — All restaurant image paths are `restaurants/{ownerUid}/{restaurantId}/...` (not `restaurants/{restaurantId}/...`). All storage helpers (`uploadBanner`, `uploadLogo`, `deleteBanner`, `deleteLogo`, `uploadItemImage`) take `ownerUid` as the first argument. Components that call these helpers (`ImageUploadSection`, `ItemEditDialog`) require an `ownerUid` prop — pass `firebaseUser?.uid ?? ""` from the parent page. Storage rules enforce `request.auth.uid == ownerUid` for writes; reads remain public.
- **MUI 5 uses InputLabelProps, not slotProps** — TextField `slotProps` is MUI 6+. Use `InputLabelProps={{ shrink: true }}` and `InputProps` for adornments.
- **Item visibility vs status badges are independent** — `isAvailable` controls whether the item shows on the customer menu at all. Status badges (Sold Out, New, etc.) are stored in the `tags[]` array and are visual indicators only. Changing a badge must NOT change `isAvailable`.
- **Dietary attributes are also stored in `tags[]`** — Values like `"vegan"`, `"vegetarian"`, `"spicy-2"` coexist with status badges in the same array. The `DIETARY_ATTRIBUTES` constant in `@chooz/shared` defines the canonical list. Spicy levels are mutually exclusive (`"spicy-1"` through `"spicy-3"` — only one stored at a time).
- **`@mui/icons-material/Eco` does not exist** — Use `Grass` instead for vegetarian icon. The installed MUI 5 version doesn't include the `Eco` icon.
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

### 2026-02-15 — Session 7: Dietary attribute checkboxes for menu items

**What was done:**
- **Shared constants** — Created `packages/shared/src/constants/dietary.ts` with `DIETARY_ATTRIBUTES` (6 attributes: vegan, vegetarian, spicy, gluten-free, contains-peanuts, dairy-free) and `SPICE_LEVELS` (1–3). Exported from `packages/shared/src/index.ts`.
- **Dietary checkboxes in ItemEditDialog** — Added "Dietary" section after Price, before Ingredients. Each attribute has a colored MUI icon + checkbox. Spicy has an inline dropdown for levels 1–3 (rendered as pepper emojis). Checking/unchecking manages `form.tags[]`.
- **Dietary icons in ItemCard** — Icons render under the item description text (not in a separate column). Colored MUI icons with tooltips. Spicy renders 1–3 flame icons based on level. Only shows when dietary tags exist.
- **Layout fixes** — Added `overflow: hidden` + `textOverflow: ellipsis` to name/description to prevent overflow into adjacent grid columns. Removed separate dietary column in favor of inline display under description.
- No type changes, no service changes, no Firestore rule changes. `pnpm typecheck` passes.

**Key design decisions:**
- Dietary attributes reuse the existing `tags[]` field — no schema changes needed
- Spicy levels are mutually exclusive: only one `"spicy-N"` tag stored at a time
- Icon mapping lives in the React components (not shared) to keep `@chooz/shared` dependency-free
- Used `Grass` icon instead of `Eco` (doesn't exist in installed MUI version)
- "Nut-Free" was removed per user feedback (6 attributes instead of 7)

**Key context for next session:**
- No ticket exists for this feature
- #26 and #25 (Firebase Storage) still block profile image verification
- #31 (image refinements) still open
- Consider adding dietary icons to the mobile menu viewer when building #14

### 2026-02-18 — Session 8: Admin dashboard Phase 1

**What was done:**
- **Full admin dashboard** (Issue #11) — 6 new files, 8 modified files:
  - **Shared types** — `SeedRestaurantData`, `SeedRestaurantResult`, `ProcessClaimData`, `ProcessClaimResult` in `packages/shared/src/types/admin.ts`
  - **Service layer** — `getFunctionsInstance()` lazy singleton, `httpsCallable` wrappers for `seedRestaurant`/`processClaim`, `getAllRestaurants()`, `getAllClaims()`, `"failed-precondition"` error code
  - **Admin Zustand store** — `apps/web/stores/adminStore.ts` with restaurants, claims, loading, error state + fetch/seed/processClaim/updateRestaurant actions
  - **Admin layout** — Upgraded from inline HTML to MUI Drawer with icons, nav highlighting, logout button, `/restaurants` link
  - **Dashboard page** (`/dashboard`) — 4 stat cards (total, published, seeded, pending claims) + quick-action buttons
  - **Seed tool** (`/seed`) — Form with name, description, address, phone, TagsSelect. Calls Cloud Function, shows snackbar, clears form
  - **Claims page** (`/claims`) — Pending/All toggle filter, `ClaimReviewCard` with approve/reject buttons, confirmation dialog, admin notes
  - **Restaurants page** (`/restaurants`) — MUI Table with search, ownership filter, published filter. `RestaurantEditDialog` for inline editing. Green row highlight on save
- **Cloud Functions deployed** — `seedRestaurant` and `processClaim` deployed to `chooz-staging` (required `functions/.env` with Algolia placeholder values)
- **Created tickets** — #32 (research: restricted name change flow), #33 (research: customer report system)
- **Closed** — #11

**Key design decisions:**
- Published column uses clickable Chip (not Switch) that opens edit dialog — per user feedback, avoids accidental one-click publish/unpublish
- Green row highlight (2s fade) after editing a restaurant — visual feedback for which row changed
- Admin store doesn't use optimistic updates — internal tooling, simplicity preferred
- Seed tool is a lightweight form (not reusing RestaurantForm) — too much overhead with drafts, hours, images for admin seeding
- `functions/.env` with placeholder Algolia values needed to unblock deploy — Algolia sync function loads env vars at module init even when deploying unrelated functions

**Key context for next session:**
- Admin dashboard P1 is complete, P2 (#20) is next for owner support tools
- Claim review UI works but wasn't fully tested (no test claim data in staging)
- `functions/.env` is gitignored — real Algolia keys needed before deploying the sync function
- #32 (name change restrictions) and #33 (report system) are research tickets for trust & safety
- #10 (claim flow UI for owners) is now unblocked by admin dashboard

### 2026-02-18 — Session 9: Full codebase review and test coverage

**What was done:**
- **Full codebase review** — Reviewed all layers: shared types, services, stores, components, and pages. Identified issues across the entire codebase, not just admin dashboard.
- **Admin store race condition fix** — Replaced single `loading: boolean` with granular `loadingRestaurants`, `loadingClaims`, `submitting` states. Added `extractErrorMessage()` helper using `AppError`-aware checking. Updated all 4 admin pages to use new state names.
- **Service layer fixes** — Added missing `updatedAt: serverTimestamp()` to `updateClaimRequest()` (was the only update function without it). Renamed `restaurantsCol()` → `restaurantsRef()` for naming consistency across modules.
- **UI fixes** — Added timer cleanup `useEffect` for highlight timer on restaurants page. Replaced `<a>` tags with Next.js `<Link>` in dashboard layout to prevent full page reloads.
- **Test coverage** — Wrote 20 new tests (43 total, up from 23):
  - `apps/web/stores/adminStore.test.ts` (16 tests) — initial state, fetch success/error, concurrent fetch isolation, seed/processClaim/updateRestaurant with submitting states
  - `packages/services/src/functions/index.test.ts` (4 tests) — callable wrappers for `seedRestaurant` and `processClaim` with error wrapping
- `pnpm typecheck` and `pnpm test` both pass cleanly.

**Key decisions:**
- Granular loading states prevent race conditions when `fetchRestaurants()` and `fetchClaims()` run concurrently on the dashboard page
- Tests mock `@chooz/services` entirely (no Firebase dependency in test env)
- `httpsCallable` mock uses `as unknown as ReturnType<typeof vi.fn>` cast to avoid Firebase SDK type mismatches in tests

**Key context for next session:**
- All changes from review are uncommitted (8 modified files + 2 new test files)
- Test coverage is focused on admin store and callable functions — authStore, restaurantStore, menuStore, and Firestore services still have minimal or no tests
- No open issues were closeable from this work

### 2026-02-19 — Session 10: Landing page for restaurant owners

**What was done:**
- **Landing page** (Issue #34) — Replaced placeholder root route with full landing page:
  - `LandingHeader` — Sticky white AppBar with Chooz logo + text, "Log In" / "Get Started" nav buttons
  - Hero section — Cream background, heading, value prop, red CTA button
  - Features section — 3-column grid: "Publish Your Menu", "Reach New Customers", "Manage Effortlessly" with MUI icons
  - `RestaurantPreviewGrid` — Fetches up to 8 published restaurants, responsive card grid (1/2/3/4 cols), skeleton loading, error/empty states
  - CTA banner — Red background, white text, "Get Started" button
  - Footer — Dark background with white logo, copyright, login/register links
- **Brand logo** — Copied `adaptive-icon.png` from mobile app to `apps/web/public/logo.png`. Added to LandingHeader, AuthCard (login/register pages), and footer
- **Firestore composite index** — Added `isPublished` + `name` index to `firestore.indexes.json` and deployed to staging. Required for `getPublishedRestaurants()` query
- **CSS fix** — Changed `overflow-x: hidden` → `overflow-x: clip` in `globals.css` to fix `position: sticky` on the header
- **Restaurant card design** — White background with Chooz logo placeholder when no banner image, inset shadow from description area, smaller tag chips, hover lift effect, `onError` fallback for broken images
- **Created ticket** — #35 (mobile-responsive dashboard pages + mobile editing warning)
- **Closed** — #34

**Key design decisions:**
- Page is `"use client"` — MUI components require client context. Static sections (hero, features, CTA, footer) still render fast; restaurant grid fetches client-side with skeleton loading
- Restaurant data is read-once display data — local `useState` instead of Zustand store
- Logo uses CSS `filter: brightness(0) invert(1)` in the dark footer to render white

**Key context for next session:**
- Landing page is complete and verified through 15 manual test steps
- #35 (mobile-responsive dashboard) is the next UI polish ticket
- Firestore composite index is deployed to staging — may take a few minutes to build after deploy
- `overflow-x: clip` in globals.css — watch for any side effects on other pages

### 2026-02-22 — Session 13: Fix Storage security rules

**What was done:**
- **Closed #36** — Fixed Firebase Storage rules to enforce restaurant ownership on writes.
- **Path restructure** — Changed all storage paths from `restaurants/{restaurantId}/...` to `restaurants/{ownerUid}/{restaurantId}/...`. This allows `storage.rules` to verify ownership with `request.auth.uid == ownerUid` without a Firestore `get()` call (which Storage rules don't support).
- **`storage.rules`** — Replaced the blanket authenticated-user write with ownership-checked `create`/`update`/`delete` rules. Reads remain public.
- **`packages/services/src/storage/index.ts`** — Added `ownerUid` as the first parameter to all 5 convenience helpers (`uploadBanner`, `uploadLogo`, `deleteBanner`, `deleteLogo`, `uploadItemImage`).
- **Threaded `ownerUid` through the component tree** — Updated `ImageUploadSection`, `ItemEditDialog`, `CategorySection`, `CategoryList`; updated callers in setup page, profile page, and edit page to pass `firebaseUser?.uid ?? ""`.
- `pnpm typecheck` passes cleanly (7/7 tasks).

**Key decisions:**
- Path-based auth chosen over Custom Claims or Cloud Function proxy — simpler, no token refresh needed, no Cloud Function changes.
- `deleteImageByUrl` unchanged — it decodes the path from the download URL and the storage rule enforces the correct ownership check automatically.
- If a restaurant is claimed and `ownerUid` changes, old images under the previous owner's path become immutable (new owner can't delete them) but their Firestore download URLs remain valid. Acceptable for now — cleanup can be handled during claim flow implementation.

**Key context for next session:**
- All storage writes now require `ownerUid` to match `request.auth.uid` — no regression for owner dashboard flows.
- Any future storage upload feature must pass `ownerUid` to the helpers.
- Deploy `storage.rules` to staging before testing image uploads end-to-end.

### 2026-02-22 — Session 12: Codebase audit and issue triage

**What was done:**
- **Full double-check audit** — Ran `double-check` agent against the entire codebase. Reviewed brain.md, CLAUDE.md, PRD, source files, git history, and all open issues.
- **9 issues filed** (#36–#44) for findings not previously tracked. Each has a P0/P1/P2 priority indicator in the issue body:
  - **P0:** #36 (Storage rules — no ownership enforcement), #37 (Algolia indexes unpublished content), #38 (RTDB → Firestore production migration), #39 (Algolia credentials are placeholders)
  - **P1:** #40 (admin approval gate before publish), #41 (menuStore silent failures + no tests), #42 (Firebase web SDK vs RN Firebase research)
  - **P2:** #43 (deleteRestaurant cascade gap), #44 (updateClaimRequest type mismatch)
- **Updated `double-check` agent** (`~/.claude/agents/double-check.md`) — Added Phase 6: after producing the report, the agent now automatically checks existing issues and files GitHub tickets for any untracked findings with P0/P1/P2 priority labels.

**Key context for next session:**
- No code was changed this session — all work was audit and process.
- P0 issues (#36–#39) are the most urgent: storage rules gap is actively exploitable once customer auth ships, Algolia is non-functional on staging, and the production migration hasn't run.
- `menuStore` (#41) has no tests and silently swallows errors — same class of issue fixed in adminStore (Session 9) that still needs to be applied here.
- The Firebase web SDK vs. RN Firebase decision (#42) must be resolved before mobile implementation begins.

### 2026-02-19 — Session 11: Hero banner layout, collapsible sidebar, and UX polish

**What was done:**
- **Hero banner layout** — Added `variant` prop to `ImageUploadSection` (`"card"` default / `"hero"`). Hero variant renders banner full-width with `borderRadius: 2`, logo overlaps bottom-left of banner with absolute positioning (`bottom: -40px, left: 24px`), white border and box-shadow. Card variant unchanged (setup page unaffected). Profile page passes `variant="hero"`.
- **Collapsible sidebar** — Dashboard layout sidebar collapses to 64px icon-only strip via chevron toggle. Hover-to-expand when collapsed: drawer overlays content at full 240px width, collapses back on mouse leave. Logout button hidden when collapsed. Smooth 0.2s width transition on drawer, spacer, and chevron rotation.
- **Visibility section styling** — Added brand tan background (`colors.secondary.main` / `#FFFAEF`) to Visibility Paper in `RestaurantForm`.
- **Confirm dialog error display** — Added `error` prop to `ConfirmChangesDialog`. Profile page catches save errors and displays them inline in the dialog. Error clears on retry or close.
- **Hours diff grid layout** — Replaced inline text diff with a 4-column CSS grid (day, before, arrow, after) for cleaner alignment in the confirm dialog.
- **Operating hours "Copy to..." menu** — Added three-dot menu per day row in `OperatingHoursInput`: "Apply to all days", "Apply to weekdays", "Apply to weekends". Copies the source day's open/close/isClosed to target days.
- **Image snapshot tracking** — Profile page now updates `initialSnapshot.current.images` when images are uploaded/deleted, so subsequent form saves correctly detect image changes.
- **CLAUDE.md** — Added communication convention (use `AskUserQuestion` for questions).

**Key context for next session:**
- Sidebar collapse state is local (`useState`) — not persisted across page loads. Could be stored in localStorage if persistence is desired.
- Hero layout uses `mb: 7` (56px) to clear the overlapping logo. If logo size changes from 120px, this margin needs adjustment.
- No tickets were closeable from this work — all changes are UX polish on existing features.
