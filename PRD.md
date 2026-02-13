# Chooz — Product Requirements Document

> **Version:** 1.0
> **Date:** 2026-02-12
> **Status:** Draft

---

## 1. Vision & Mission

**Vision:** Become the go-to platform for discovering, browsing, and comparing restaurant menus.

**Mission:** Bring attention and accessibility to local and smaller restaurants by making their menus easy to find, easy to manage, and easy to compare.

**Core Problem:** It's surprisingly hard to find a restaurant's actual menu before you go. Menus are buried in PDFs, outdated on websites, or missing entirely. Customers waste time calling, searching, or just guessing. Chooz solves this by giving restaurants a dead-simple way to publish their menus digitally, and giving customers a single place to search, filter, and compare them.

---

## 2. User Personas

### 2.1 Restaurant Owner
- Runs a local restaurant and wants customers to find their menu easily
- Not very technical — needs a simple, intuitive interface
- Wants to update their menu quickly when prices or items change
- Cares about being represented accurately online

### 2.2 Customer / Diner
- Trying to decide where to eat
- Wants to browse menus before committing to a restaurant
- May be craving something specific ("I want a burger") and wants to find which nearby restaurants serve it
- Uses their phone primarily

### 2.3 Admin (Internal)
- Seeds the platform with restaurant profiles from public data
- Reviews and approves restaurant claims and verification requests
- Monitors platform health

---

## 3. Platform Overview

Chooz is a multi-platform product with three applications sharing a common backend:

| Application | Audience | Purpose |
|---|---|---|
| **Web Dashboard** | Restaurant owners + Admin | Create, manage, and publish menus |
| **Mobile App** | Customers | Discover, search, filter, and save menus |
| **Web Fallback** | Customers (no app installed) | View a restaurant's profile and menu via direct link or QR code |

### 3.1 Web Dashboard (Owner + Admin)
The primary tool for restaurant owners to manage their presence on Chooz. Also serves as the admin interface for seeding restaurants and reviewing claims.

### 3.2 Mobile App (Customer)
The primary customer experience. Search, filter, browse, and interact with menus. All account-based features (notes, favorites, reviews) live here.

### 3.3 Web Fallback (Customer — Minimal)
A read-only web experience for customers who don't have the app. Accessed via:
- Direct link (e.g. `choozmenu.com/restaurant/{id}`)
- QR code scan (if app is not installed, falls back to web)

**Web fallback scope is intentionally minimal:**
- Search for a restaurant by name
- View restaurant profile (name, address, hours, images)
- View the menu
- Prompt to download the mobile app for full features

No account creation, no notes, no favorites, no social features on the web fallback.

---

## 4. Tech Stack (Recommended)

### 4.1 Web Dashboard + Web Fallback

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | **Next.js 14+ (App Router)** | React-based (familiar), SSR for customer-facing pages (SEO for restaurant pages), API routes for server-side logic (admin tools, claim processing, AI integration), deploys to Firebase/GCP |
| **Language** | **TypeScript** | Already in use, type safety across the stack |
| **UI Library** | **MUI 5 (Material-UI)** | Already in use, good component library, keep for continuity |
| **State Management** | **Zustand** | Lightweight, TypeScript-first, simple API. No boilerplate like Redux, more structured than raw Context |
| **Styling** | **MUI sx prop + Emotion** | Already in use via MUI, drop Styled Components (unnecessary second CSS-in-JS lib) |
| **Build** | **Next.js built-in (Turbopack)** | Replaces CRA + Webpack, much faster builds |

**Why Next.js over plain React + Vite:**
- Restaurant pages need to be indexed by Google (SEO) — SSR/SSG handles this
- API routes provide a server-side layer for admin tools, claim processing, and future AI integration without needing a separate backend service
- The customer web fallback pages are mostly static/server-rendered content (perfect fit)
- The owner dashboard pages are client-side interactive (Next.js supports both patterns)
- Deploys natively to Firebase App Hosting or Vercel

### 4.2 Mobile App

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | **React Native + Expo** | TypeScript, shared knowledge with web codebase, Expo handles camera (QR scanner), push notifications, location services out of the box |
| **Navigation** | **Expo Router** | File-based routing (similar to Next.js), deep linking support |
| **State Management** | **Zustand** | Same as web — shared patterns, shared mental model |
| **UI Library** | **React Native Paper** or **Tamagui** | Material-inspired components for RN. Evaluate during implementation |

### 4.3 Backend (Shared)

| Layer | Choice | Rationale |
|---|---|---|
| **Auth** | **Firebase Authentication** | Already in use, supports email/password + Google + Facebook + Apple |
| **Database** | **Cloud Firestore** | Migrate from Realtime DB. Better querying (compound queries, collection group queries), needed for filters/search. Scales better |
| **Storage** | **Firebase Storage** | Already in use, keep for images |
| **Server Logic** | **Cloud Functions for Firebase** | Server-side operations: claim processing, admin actions, data validation, AI pipeline triggers |
| **Full-Text Search** | **Algolia** (via Firebase Extension) | Firebase is weak at text search. Algolia enables item-level search ("burger near me") across all restaurants. First-party Firebase integration exists |
| **Geolocation Queries** | **Firestore GeoHash** + Algolia Geo | Location-based filtering for "restaurants near me" |
| **AI (Future)** | **Google Cloud Vertex AI / Vision API** | Menu photo parsing, AI-assisted menu creation. Architect the hooks now, implement in Phase 3 |
| **Hosting** | **Firebase App Hosting** | Supports Next.js SSR natively, stays in GCP ecosystem |

### 4.4 Monorepo Structure

Both apps share TypeScript types, Firebase service logic, and validation. Use a monorepo:

```
chooz/
├── apps/
│   ├── web/                 # Next.js (owner dashboard + customer fallback)
│   └── mobile/              # Expo React Native (customer app)
├── packages/
│   ├── shared/              # Shared TypeScript types, constants, validation
│   └── services/            # Firebase service layer (auth, db, storage)
├── functions/               # Cloud Functions for Firebase
├── turbo.json               # Turborepo config
├── package.json
└── firebase.json
```

**Tooling:** Turborepo for monorepo orchestration, pnpm for package management.

---

## 5. Data Model

Migrating from Firebase Realtime Database to Cloud Firestore. New schema designed for query flexibility.

### 5.1 Core Collections

#### `users/{uid}`
```typescript
interface User {
  uid: string
  email: string
  displayName: string
  authProvider: 'google' | 'facebook' | 'apple' | 'email'
  role: 'customer' | 'owner' | 'admin'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `restaurants/{restaurantId}`
```typescript
interface Restaurant {
  id: string
  name: string
  description: string
  ownerUid: string | null          // null if seeded/unclaimed
  ownershipStatus: 'seeded' | 'claimed' | 'verified'
  claimedBy: string | null         // uid of claimant
  claimDate: Timestamp | null
  verifiedDate: Timestamp | null
  isPublished: boolean

  // Contact & Location
  phone: string
  address: string
  geoHash: string                  // for proximity queries
  latitude: number
  longitude: number

  // Hours (structured for time-contextual features)
  hours: OperatingHours

  // Metadata
  tags: string[]                   // cuisine type, dietary flags, etc.
  bannerImageUrl: string | null
  logoImageUrl: string | null

  createdAt: Timestamp
  updatedAt: Timestamp
}

interface OperatingHours {
  [day: string]: {                 // 'monday', 'tuesday', etc.
    open: string                   // '09:00' (24hr format)
    close: string                  // '22:00'
    isClosed: boolean
  }
}
```

#### `restaurants/{restaurantId}/menus/{menuId}`
```typescript
interface Menu {
  id: string
  name: string                     // 'Breakfast', 'Lunch', 'Dinner', 'Drinks'
  sortOrder: number                // for drag-drop ordering
  isActive: boolean

  // Time-contextual availability
  availableFrom: string | null     // '11:00' — null means always available
  availableTo: string | null       // '15:00'
  availableDays: string[] | null   // ['monday', 'tuesday', ...] — null means every day

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}`
```typescript
interface Category {
  id: string
  name: string
  description: string
  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `restaurants/{restaurantId}/menus/{menuId}/categories/{categoryId}/items/{itemId}`
```typescript
interface Item {
  id: string
  name: string
  description: string
  price: number
  ingredients: string[]            // array instead of comma-separated string
  tags: string[]                   // 'vegetarian', 'spicy', 'gluten-free', etc.
  imageUrl: string | null          // Phase 3: item-level photos
  isAvailable: boolean             // can be toggled (e.g. 86'd items)
  sortOrder: number

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 5.2 Search Index (Algolia)

A denormalized index synced from Firestore for fast cross-restaurant search:

```typescript
// Algolia 'menuItems' index
interface MenuItemSearchRecord {
  objectID: string                 // itemId
  itemName: string
  description: string
  price: number
  ingredients: string[]
  tags: string[]

  // Denormalized restaurant info for display
  restaurantId: string
  restaurantName: string
  restaurantAddress: string
  _geoloc: { lat: number, lng: number }  // Algolia geo format

  // Denormalized menu/category for context
  menuName: string
  categoryName: string
}
```

### 5.3 User-Specific Collections

#### `users/{uid}/notes/{noteId}`
```typescript
interface Note {
  id: string
  restaurantId: string | null      // null = global note
  content: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `users/{uid}/favorites/{favoriteId}`
```typescript
// Phase 2
interface Favorite {
  id: string
  type: 'restaurant' | 'item'
  restaurantId: string
  itemId: string | null            // null if favoriting a restaurant
  createdAt: Timestamp
}
```

### 5.4 Claim Requests

#### `claimRequests/{requestId}`
```typescript
interface ClaimRequest {
  id: string
  restaurantId: string
  claimantUid: string
  claimantName: string
  claimantEmail: string
  claimantPhone: string
  claimantRole: string             // 'owner', 'manager', etc.
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Timestamp
  reviewedAt: Timestamp | null
  reviewedBy: string | null        // admin uid
  notes: string                    // admin notes
}
```

---

## 6. Feature Specification by Phase

### Phase 0: Foundation (The Rebuild)

**Goal:** Modernize the codebase and establish clean architecture. No new user-facing features — the app should work exactly as it does today, but on a solid foundation.

**Scope:**
- [ ] Set up monorepo (Turborepo + pnpm)
- [ ] Scaffold Next.js app (replaces CRA)
- [ ] Scaffold Expo React Native app (mobile shell)
- [ ] Create shared packages (types, services)
- [ ] Migrate all class components → functional components with hooks
- [ ] Implement Zustand stores (auth, restaurant, menu)
- [ ] Build Firebase service layer in `packages/services/` (decouple from components)
- [ ] Migrate Firebase Realtime DB → Cloud Firestore
- [ ] Redesign data model per Section 5
- [ ] Clean up: remove dead code, console.logs, fix typos, remove unused deps
- [ ] Set up Algolia and sync pipeline (Cloud Function: Firestore → Algolia)
- [ ] Set up CI/CD (GitHub Actions → Firebase App Hosting)
- [ ] Basic test infrastructure (Vitest for web, Jest for mobile)

**Exit criteria:** Existing owner dashboard features work on the new stack. Data is in Firestore. Algolia is syncing.

---

### Phase 1: Launch Features

**Goal:** Ship the complete V1 product across all three platforms.

#### 1.1 Owner Dashboard (Web)

**Existing features (cleaned up):**
- [ ] Auth flow (email/password, Google, Facebook, email verification, password reset)
- [ ] Restaurant profile management (name, description, address, phone, hours)
- [ ] Menu builder with drag-drop reordering
- [ ] Image management (banner, logo)
- [ ] Publish / unpublish
- [ ] QR code generation + share

**New features:**
- [ ] Time-contextual menu settings — owner sets available hours/days per menu
- [ ] Structured operating hours input (per-day open/close times)
- [ ] Tags input — owner selects cuisine type, dietary flags for their restaurant
- [ ] "Claim this restaurant" flow (for seeded restaurants)

#### 1.2 Admin Dashboard (Web — Founder-Only)

A dedicated dashboard accessible only to the platform admin (founder). Serves as the central operations hub for managing the platform. Starts with seeding and claim review, and expands over time into a tool for directly assisting restaurant owners with administrative tasks.

**Phase 1 scope:**
- [ ] Admin panel (protected route, role-based access — founder only)
- [ ] Seed restaurant tool — create restaurant profiles from public data
- [ ] Claim request review queue — approve/reject ownership claims
- [ ] Restaurant moderation — view all restaurants, edit, unpublish if needed
- [ ] Platform overview stats (total restaurants, pending claims, published count)

**Future expansion (Phase 2+):**
- [ ] Owner support tools — edit a restaurant's menu/profile on behalf of an owner (e.g., owner calls in and needs help)
- [ ] Account management — view/manage user accounts, reset owner access, reassign ownership
- [ ] Platform health monitoring — flagged content, inactive restaurants, stale menus
- [ ] Onboarding assistance — walk new owners through setup, pre-populate data for them
- [ ] Bulk operations — batch-update tags, hours, or menu structures across restaurants

#### 1.3 Customer Mobile App

- [ ] Auth (email/password, Google, Facebook, Apple Sign-In)
- [ ] Home screen — nearby restaurants list
- [ ] Restaurant profile view (name, address, hours, images, menus)
- [ ] Menu viewer with time-contextual graying out
  - Grey out unavailable menus/items based on current time
  - Grey out closed restaurants
- [ ] Item-level search — search "burger" → results across all nearby restaurants
- [ ] Filter by: tags (cuisine), price range, location/proximity
- [ ] Notes page — simple personal notepad for order planning
- [ ] Share restaurant via QR code / link
- [ ] Deep linking — QR code opens app if installed, web fallback if not

#### 1.4 Customer Web Fallback

- [ ] Restaurant search by name
- [ ] Restaurant profile page (SSR for SEO)
- [ ] Menu viewer (read-only)
- [ ] "Download the app" prompt
- [ ] QR code / deep link routing (app installed → app, else → web)

#### 1.5 Trust & Safety

- [ ] Restaurant ownership states (seeded → claimed → verified)
- [ ] Admin approval required before new owner-created restaurants are published
- [ ] "Unclaimed" badge on seeded restaurants
- [ ] "Verified" badge on approved restaurants

---

### Phase 2: Engagement & Social

- [ ] Go-to items — customers mark their "go-to" at a restaurant, with counters
- [ ] Save favorites — favorite restaurants and individual items
- [ ] Reviews — customers leave reviews on restaurants
  - Verified reviews (from verified users) vs. all reviews
  - Delete-all-or-nothing policy for restaurant owners (with "Has reset reviews" badge)
- [ ] Verified users — users with consistent account history
- [ ] Restaurant media page — showcases food photos
  - Customer photo submissions (max 3/day)
  - Restaurant approves before posting
- [ ] Trending menu items — set/promoted by restaurant
- [ ] In-app QR scanner

---

### Phase 3: Monetization & Advanced

- [ ] Promotions system
  - Restaurants create promotions with expiration (12hr, 1 week, etc.)
  - Customers must follow a restaurant to see promos
  - Promo feed on home screen (filterable by nearby)
  - Promotion validation system (prevent screenshot reuse)
- [ ] AI-powered menu creation
  - Upload photo of physical menu → AI extracts structured data (Vertex AI / Vision API)
  - AI suggestions for descriptions, tags, categorization
- [ ] Item-level photos — owners upload images per menu item
- [ ] Flexible menu structures — support non-standard menu layouts
- [ ] Wait times — updated by restaurant employees, shown to customers with recency
- [ ] Analytics dashboard for restaurant owners (paid tier)
- [ ] Restaurant verification as paid service (business optimization)
- [ ] Verified user subscriptions

---

### Phase 4: Platform / Community

- [ ] Restaurant forum / community space
- [ ] Full social features (sharing experiences, activity feeds)
- [ ] Rewards management (loyalty programs)
- [ ] Advanced promotion validation
- [ ] Last online indicator for restaurants

---

## 7. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Next.js Web  │  │  Expo Mobile │  │  Web Fallback      │    │
│  │  (Owner +     │  │  (Customer)  │  │  (SSR pages in     │    │
│  │   Admin)      │  │              │  │   Next.js)         │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘    │
│         │                 │                    │                │
│         └─────────┬───────┴────────────────────┘                │
│                   │                                             │
│         ┌─────────▼─────────┐                                   │
│         │  packages/services │ (shared Firebase service layer)  │
│         │  packages/shared   │ (shared types, validation)       │
│         └─────────┬─────────┘                                   │
└───────────────────┼─────────────────────────────────────────────┘
                    │
┌───────────────────┼─────────────────────────────────────────────┐
│                   │          Backend Layer                       │
│                   ▼                                              │
│  ┌──────────────────────────────────────────────────┐           │
│  │              Firebase / GCP                       │           │
│  │                                                   │           │
│  │  ┌─────────────┐  ┌──────────┐  ┌─────────────┐ │           │
│  │  │  Firestore   │  │ Firebase │  │  Firebase   │ │           │
│  │  │  (Database)  │  │   Auth   │  │  Storage    │ │           │
│  │  └──────┬──────┘  └──────────┘  └─────────────┘ │           │
│  │         │                                         │           │
│  │  ┌──────▼──────┐  ┌───────────────────────────┐  │           │
│  │  │   Cloud     │  │   Algolia                  │  │           │
│  │  │  Functions  │──│   (Full-text search +      │  │           │
│  │  │  (sync,     │  │    geo queries)            │  │           │
│  │  │   admin,    │  └───────────────────────────┘  │           │
│  │  │   AI hooks) │                                  │           │
│  │  └─────────────┘                                  │           │
│  │                                                   │           │
│  │  ┌───────────────────────────────────────┐        │           │
│  │  │  Vertex AI / Vision API (Phase 3)     │        │           │
│  │  └───────────────────────────────────────┘        │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Service layer abstraction** — Components never call Firebase directly. All data access goes through `packages/services/`. This makes it possible to swap backends, add caching, or change data sources without touching UI code.

2. **Shared types** — All TypeScript interfaces live in `packages/shared/`. Both web and mobile import from the same source of truth.

3. **Firestore as source of truth, Algolia for search** — Firestore handles all CRUD and real-time updates. A Cloud Function syncs relevant data to Algolia for cross-restaurant search and geo queries.

4. **SSR for public pages, CSR for dashboard** — Customer-facing restaurant pages are server-rendered (SEO). The owner dashboard is client-side interactive.

5. **AI-ready architecture** — Cloud Functions provide the server-side hook. When Phase 3 arrives, add a function that takes an image, sends it to Vertex AI, and returns structured menu data. The pipeline is: upload image → Cloud Function → Vertex AI → write to Firestore.

---

## 8. Open Questions

1. **Algolia pricing** — Free tier supports 10K records and 10K searches/month. Sufficient for launch. Need to evaluate costs at scale.
2. **Apple Sign-In** — Required by Apple if you offer Google/Facebook sign-in on iOS. Need to add this to auth.
3. **Flexible menu structures (Phase 3)** — Need concrete examples of menus that don't fit the current model to design the right abstraction. Revisit before Phase 3.
4. **Promotion validation (Phase 3)** — The screenshot-reuse problem needs more design thinking. Possible solutions: one-time-use codes, time-based QR codes, employee-side app for scanning. Revisit before Phase 3.
5. **Firebase Dynamic Links deprecation** — Firebase Dynamic Links is deprecated. Need to evaluate alternatives (custom deep linking, Branch.io, or custom solution with App Links / Universal Links).
6. **Monorepo vs. separate repos** — Monorepo recommended for shared code benefits. If mobile team is separate, could split later. Start with monorepo.

---

## 9. Revenue Model (Future Reference)

| Stream | Phase | Description |
|---|---|---|
| Restaurant verification (premium) | 3 | Paid verification with business optimization services |
| Verified user subscriptions | 3 | Premium features for power users |
| Restaurant analytics | 3 | Paid dashboard with insights (views, searches, popular items) |
| Premium menu templates | 3+ | Different visual layouts for menus |
| Promoted listings | 4+ | Restaurants pay for visibility in search results |

---

## 10. Success Metrics

| Metric | Target (Launch) |
|---|---|
| Restaurants on platform (seeded + verified) | 50+ in target area |
| Published menus with complete data | 80% of restaurants |
| Monthly active customers (mobile) | Track baseline |
| Searches per customer per month | Track baseline |
| Restaurant claim rate (seeded → claimed) | Track baseline |
| QR code scans | Track baseline |

---

*This is a living document. It will be updated as decisions are made and features are refined.*
