---
paths:
  - "apps/web/**/*.ts"
  - "apps/web/**/*.tsx"
---

# Web App Rules

- Use `"use client"` directive only for components that need interactivity, hooks, or browser APIs.
- Keep pages thin. Data fetching and business logic belong in Zustand stores and `@chooz/services`.
- State lives in Zustand stores (`apps/web/stores/`). Do not use React Context for state management.
- Import services as namespaces: `import { restaurantService } from "@chooz/services"`.
- Handle errors with `AppError` — check `error instanceof AppError` and switch on `error.code`.
- Route groups: `(auth)` = public, `(dashboard)` = owner role, `(admin)` = admin role.
- Use MUI components and the `sx` prop for styling. Do not add Styled Components or Tailwind.
