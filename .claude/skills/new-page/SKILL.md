---
description: Scaffold a new Next.js page in the web app
user-invocable: true
allowed-tools: Read, Write, Edit, Glob
argument-hint: "(route-group)/path"
---

Create a new page in the Next.js web app following the project conventions.

The user will provide a route path via `$ARGUMENTS` (e.g., "(dashboard)/settings", "(admin)/users", "(auth)/forgot-password", "about").

**Route groups:**
- `(auth)` — Public auth pages (centered layout, no auth required)
- `(dashboard)` — Owner-protected routes (requires `owner` role, sidebar layout)
- `(admin)` — Admin-protected routes (requires `admin` role, sidebar layout)
- Top-level (no group) — Public pages

**Steps:**
1. Create `apps/web/app/$ARGUMENTS/page.tsx`
2. Add `"use client"` directive only if the page needs interactivity/hooks
3. Include a basic page structure with the page title
4. Keep pages thin — data fetching and business logic belong in stores and services
5. If the page needs a Zustand store, check if one exists in `apps/web/stores/` or note that one should be created

**Follow the patterns of existing pages** — read a few first to match the style.
