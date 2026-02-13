---
description: Scaffold a new Expo screen in the mobile app
user-invocable: true
allowed-tools: Read, Write, Edit, Glob
argument-hint: "path (e.g., settings, (tabs)/favorites)"
---

Create a new screen in the Expo mobile app following the project conventions.

The user will provide a screen path via `$ARGUMENTS` (e.g., "settings", "(tabs)/favorites", "restaurant/[id]/reviews").

**Screen types:**
- `(tabs)/<name>.tsx` — Tab screen (appears in bottom tab bar)
- `<path>.tsx` — Stack screen (pushed onto navigation stack)
- `<path>/[param].tsx` — Dynamic route with URL parameter

**Steps:**
1. Create `apps/mobile/app/$ARGUMENTS.tsx`
2. Include a basic screen structure with the screen title
3. Use `useLocalSearchParams` for route params if the path has `[param]` segments
4. If adding a new tab, update `apps/mobile/app/(tabs)/_layout.tsx` to include it
5. If adding a new stack screen, verify it's covered by `apps/mobile/app/_layout.tsx`

**Follow the patterns of existing screens** — read a few first to match the style.
