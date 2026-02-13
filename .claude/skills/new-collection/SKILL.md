---
description: Scaffold a new Firestore collection (type, converter, service, export, rules)
user-invocable: true
allowed-tools: Read, Write, Edit, Grep, Glob
argument-hint: "collection-name"
---

Scaffold all the files needed for a new Firestore collection, following the patterns established in the codebase.

The user will provide a collection name via `$ARGUMENTS` (e.g., "note", "favorite", "review").

Follow these steps in order:

1. **Define the type** in `packages/shared/src/types/$ARGUMENTS.ts`
   - Use `Timestamp` from `./common`, never from Firebase
   - Include `id`, `createdAt`, `updatedAt` fields
   - Export the interface

2. **Export the type** from `packages/shared/src/types/index.ts`
   - Add the export to the barrel file

3. **Create a converter** in `packages/services/src/firestore/converters.ts`
   - Use the existing `makeConverter()` helper
   - Follow the pattern of `restaurantConverter`, `menuConverter`, etc.

4. **Create the service module** at `packages/services/src/firestore/$ARGUMENTS.ts`
   - Follow the pattern of existing modules (e.g., `restaurant.ts`, `user.ts`)
   - Include: collection ref helper, get, list, create, update, delete functions
   - Use the converter for reads
   - Use `serverTimestamp()` for `createdAt`/`updatedAt` on writes
   - Wrap all errors with `toAppError()`

5. **Export the service** from `packages/services/src/index.ts`
   - Add `export * as {name}Service from "./firestore/$ARGUMENTS";`

6. **Add Firestore rules** in `firestore.rules`
   - Add appropriate read/write rules for the new collection

7. **Verify** by running `pnpm lint` to confirm no type errors

Before starting, read the existing files to match their exact patterns.
