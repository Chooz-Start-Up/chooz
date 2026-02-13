# Chooz Web - Rebuild Notes

## Current State (as of 2026-02-12)

### Tech Stack
- React 18 + TypeScript (Create React App)
- Material-UI 5 (MUI) for UI components
- Firebase (Auth, Realtime DB, Storage, Hosting)
- React Beautiful DND for drag-and-drop
- No centralized state management (local state only)
- Styled Components + Emotion (via MUI)

### Existing Features
1. **Auth** - Email/password, Google OAuth, Facebook OAuth, email verification, password reset
2. **Restaurant Profile** - Owner name, restaurant name, description, address, phone, hours
3. **Menu Builder** - Drag-drop editor: Menus > Categories > Items (name, price, description, ingredients)
4. **Image Management** - Banner and logo upload/delete via Firebase Storage
5. **Publish/Unpublish** - Toggle menu visibility
6. **QR Code Generation** - Firebase Dynamic Links for mobile app deep-linking
7. **Landing Page** - Marketing page with FAQ, app store links, restaurant showcase

### Data Model
- **Restaurant**: id, name, description, isPublished, phone, ownerName, address, hours, menus[]
- **Menu**: menuName, categories[]
- **Category**: categoryName, description, items[]
- **Item**: itemName, price, description, ingredients
- **User**: uid, email, name, authProvider

### Firebase Structure
- `/users/{uid}/restaurants/{restaurantKey}`
- `/restaurants/{restaurantKey}`
- `/restaurantList/{restaurantKey}` (public listing)
- `/restaurantMenuList/{restaurantKey}` (menu data)
- `/restaurantDynamicLink/{restaurantKey}` (QR links)

### Known Issues
- ~39 console.log/error statements
- Typos in filenames (EditProfileButtonWithDilogue, general_componets)
- Dead code (UnderConstructionPage, commented imports/routes)
- Zero test files
- Mix of class and functional components
- No centralized state management
- No service layer abstraction (Firebase calls direct from components)
- Some unused dependencies (react-draggable)

### Key Files
- `owner-web/src/pages/MenuEditPage.tsx` - Main workspace
- `owner-web/src/firebase/databaseAPI/RestaurantApi.ts` - Core DB ops (~572 lines)
- `owner-web/src/App.tsx` - Route config
- `owner-web/src/firebase/authentication/firebaseAuthentication.ts` - Auth logic
- `owner-web/src/theme/theme.ts` - Design system

---

## PRD Discussion Notes

*(To be filled in as we discuss)*

### Target Vision
Chooz is a platform that makes it easy for people to find and compare restaurant menus so they can decide where to eat. It has two sides:
- **Restaurant owners** — reliably serve/manage their menus digitally
- **Customers** — reliably find, browse, and compare menus

### User Personas
1. **Restaurant Owner** — wants to create, update, and publish their menu with minimal friction
2. **Customer / Diner** — wants to browse and compare menus to decide where to eat

### Core Features

#### Owner Side (Web Dashboard)
**Keep (existing):**
- Auth (email/password, Google, Facebook, email verification, password reset)
- Restaurant profile management (name, description, address, phone, hours)
- Menu builder with drag-drop reordering (Menus > Categories > Items)
- Image management (banner, logo)
- Publish / unpublish menus
- QR code generation

**Add (new - future phases):**
- Item-level photos (add pictures to individual menu items)
- AI-powered menu creation
  - Upload a photo of a physical menu → AI parses it into structured data
  - AI assistance for filling out menu details
- Flexible menu structures
  - Current: rigid Category > Subcategory hierarchy
  - Goal: support restaurants with non-standard/complex menu layouts
- (Future) Rewards management, coupon distribution

#### Customer Side (Mobile-first, web fallback)
**Primary platform:** Mobile app
**Fallback:** Browser-based experience (for users without the app)

**Core customer features (new):**
- Browse/discover restaurant menus
- Filter menus by:
  - Tags (cuisine type, dietary, etc.)
  - Price range
  - Location / proximity
- Search for specific menu items across restaurants
  - e.g. search "burger" → see all burgers nearby
- Save favorites (menu items and restaurants)

**Future / stretch:**
- Social features (reviews, shared experiences)
- Restaurant-to-customer engagement (rewards, coupons, promos)

### Tech Decisions
- Framework: React (staying)
- Backend: Firebase + potentially other GCP services
- State management: TBD (no strong opinion — will recommend)
- Migrate off Create React App (dead project) → likely Vite
- Architect for AI features from the start

### Web Fallback Scope (Customer)
The web fallback is intentionally minimal:
- Search for a restaurant
- View restaurant profile
- View the menu
- QR code behavior: if app installed → open app, else → open web fallback
- NO account features, no notes, no favorites, no social — that's all mobile app

### Restaurant Verification & Seeding Strategy

**The cold-start problem:** No restaurants → no customers → no restaurants.

**Solution: Seed the marketplace with pre-built profiles.**
- Admin (you) manually creates restaurant profiles using publicly available info
- Menus sourced from restaurant websites, Google, Yelp, photos, etc.
- These profiles are marked as "unclaimed" — visible to customers but not managed by an owner
- Restaurant owners can later "claim" their profile and take ownership

**Restaurant ownership states:**
1. **Seeded (unclaimed)** — Created by admin, publicly visible, marked "Menu sourced from public info — claim this restaurant to manage it"
2. **Claimed (pending verification)** — Owner has requested ownership, pending admin approval
3. **Verified (owner-managed)** — Owner approved, full edit access, verified badge

**Claim flow:**
1. Owner signs up and searches for their restaurant (or lands on it via a link/outreach)
2. Clicks "Claim this restaurant"
3. Submits verification info (business name match, phone verification, or document upload)
4. Admin reviews and approves → ownership transfers, owner gets full edit access
5. Restaurant profile updates to "Verified" status

**V1 implementation (simple):**
- Admin tool: a page or script to create seeded restaurant profiles
- Claim button on unclaimed profiles → triggers a request with basic info (name, role, phone)
- Admin reviews claims manually (Firebase console or simple admin panel)
- On approval: link restaurant to owner's account, grant edit permissions

**Data model additions:**
- Restaurant gets: `ownershipStatus` (seeded | claimed | verified), `claimedBy` (uid), `claimDate`, `verifiedDate`
- New collection or field for claim requests

**Why this works:**
- Proven strategy (Yelp, Google Maps, DoorDash all did this)
- Customers see a populated platform from day one
- Gives you a reason to reach out to restaurant owners ("Your menu is already on Chooz — claim it!")
- "Unclaimed" label is transparent and builds trust

### Time-Contextual Menus
- Owners set time windows per menu (e.g. "Lunch: 11am-3pm", "Dinner: 5pm-10pm")
- Customer apps grey out menus/items outside their active window
- Closed restaurants are also greyed out (based on restaurant hours)

### Notes Page
- Mobile-only customer feature
- Simple personal notepad per restaurant (or global)
- Stores what the user plans to order
- Lightweight — stored in user's Firebase profile

### Architecture Decisions
*(To be discussed)*

### Priority / Phases

#### Phase 0: Foundation (The Rebuild)
Modernize codebase, clean architecture, no new features yet.
- Migrate CRA → Vite
- All functional components (kill class components)
- Centralized state management
- Service layer abstraction (decouple Firebase from components)
- Clean up dead code, typos, console.logs
- Data model redesign to support future flexibility

#### Phase 1: Launch Features
**Owner side (web dashboard):**
- Existing features cleaned up and working (auth, profile, menu builder, images, publish, QR)
- Arrangeable/drag-drop menus (keep + improve)
- Share QR code (improved)

**Customer side — mobile app features (architecture/API support from web):**
- Item-level search across restaurants
- Filter by tags, price range, location
- Notes page (personal order planning)
- Contextual graying out (closed restaurants, unavailable menus/items by time)
- Time-contextual menu support (owner sets time windows for menus)

**Customer side — web fallback:**
- Search for a restaurant
- View restaurant profile + menu
- QR code → app or web routing

**Trust & safety:**
- Restaurant verification (lightweight v1 — see discussion below)

#### Phase 2: Engagement & Social
- Go-to items + counters
- Save favorites
- Reviews (with verified vs. all distinction)
- Restaurant media page + customer photo submissions
- Trending menu items
- In-app QR scanner

#### Phase 3: Monetization & Advanced
- Promotions system (with validation)
- AI-powered menu creation (photo upload → structured data)
- Item-level photos
- Flexible menu structures (non-standard layouts)
- Wait times
- Analytics for restaurant owners (paid)
- Restaurant verification as revenue stream
- Verified user subscriptions

#### Phase 4: Platform / Community
- Restaurant forum
- Full social features
- Rewards management
- Advanced promotion validation

---

## Full Feature Dump (Raw — to be prioritized)

### Mission
- Bringing attention and accessibility to local/smaller restaurants

### Verification & Trust Systems
- **Restaurant Verified** — verification process:
  - Submit required documents/information
  - 100 customer responses threshold
  - Potential revenue stream (business optimization services)
- **Verified Users** — users who maintain the same account over time
  - Verified reviews vs. all reviews distinction
  - Potential subscription model
- **Review integrity** — if a restaurant deletes reviews, they must delete ALL reviews
  - Profile displays notification: "Has reset reviews"

### Customer Experience Features
- **Notes page** — personal notepad to track what you plan to order
- **Go-to items** — mark an item as your "go-to" at a restaurant
  - Items display go-to counters (social proof)
- **Save favorites** — favorite menu items and restaurants
- **Item-level search** — search "burger" and see all burgers nearby
- **Filter by** tags, price range, location/proximity
- **In-app QR scanner** — scan restaurant QR codes from within the app
- **Share QR code** — pull up a QR code to share a restaurant with a friend

### Time-Contextual Features
- **Time-contextual menus** — Lunch, Dinner, Breakfast, Drinks, etc.
  - Grey out menus/items that are not currently available
- **Grey out closed restaurants** — visual indicator for closed places
- **Wait times** — displayed in-app to reduce phone calls
  - Updated by restaurant employees
  - Shows recency: "30min wait (updated 1hr ago)"
- **Last online** — indicator for restaurant activity

### Social / Community Features
- **Reviews** — customers leave reviews on restaurants
  - Verified reviews vs. all reviews
  - Delete-all-or-nothing policy for restaurants
- **Restaurant Media Page** — showcases food photos/content for a restaurant
  - Customers can submit food pics for the restaurant to post
  - Limit: 3 photo submissions per day per user
- **Restaurant Forum** — community discussion space
- **Trending menu items** — set/promoted by the restaurant

### Promotions & Engagement
- **Promotions system**
  - Restaurants send out promotions/deals
  - Customers must follow a restaurant to receive promotions
  - Following requires an account
  - Promotions have expiration (12hrs, 1 week, etc.)
  - **Promotions as home screen** — feed of promos from followed restaurants
    - Filter by nearby restaurants
  - **Promotion validation system** — prevent reuse/screenshot abuse
    - Use case: customer shows promo on phone to employee
    - Challenge: enforce expiration without requiring employee knowledge of active promos

### Revenue Streams (Identified)
- Business verification / optimization services
- Verified user subscriptions
- Analytics (pay-for-analytics model for restaurant owners)
- Different menu format templates (premium?)

### Uncategorized / Incomplete
- "Arrangeable and" — likely referring to easy drag-drop menu rearrangement for owners (already core)
- Different menu formats — support various layout styles

