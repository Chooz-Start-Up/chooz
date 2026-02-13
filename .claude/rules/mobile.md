---
paths:
  - "apps/mobile/**/*.ts"
  - "apps/mobile/**/*.tsx"
---

# Mobile App Rules

- Use Expo Router file-based routing. Do not use React Navigation directly.
- Use `useLocalSearchParams` for route parameters.
- Import services as namespaces: `import { restaurantService } from "@chooz/services"`.
- Handle errors with `AppError` — check `error instanceof AppError` and switch on `error.code`.
- Keep screen components focused. Extract reusable UI into a `components/` directory within the app.
