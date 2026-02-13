---
paths:
  - "packages/services/**/*.ts"
---

# Service Layer Rules

- Never expose raw Firebase types to consumers. All public function signatures use types from `@chooz/shared`.
- Always wrap errors with `toAppError()` in catch blocks. Never let Firebase exceptions propagate.
- Use typed Firestore converters (`withConverter()`) for all reads. Never use `as Type` assertions.
- Use `serverTimestamp()` for `createdAt` on creates and `updatedAt` on all writes.
- Collection reference helpers should use `getDbInstance()` (lazy init), never a module-level constant.
- Keep functions focused — one Firestore operation per function. Compose in the calling code if needed.
