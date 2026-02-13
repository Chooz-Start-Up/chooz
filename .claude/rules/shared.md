---
paths:
  - "packages/shared/**/*.ts"
---

# Shared Package Rules

- This package has zero runtime dependencies. Do not import from Firebase, React, or any other library.
- Use the plain `Timestamp` interface from `./common` for date fields. Never import from `firebase/firestore`.
- All types are plain TypeScript interfaces, not classes.
- Export every public type from `src/types/index.ts`.
