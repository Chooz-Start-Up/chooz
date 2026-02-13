---
paths:
  - "functions/**/*.ts"
---

# Cloud Functions Rules

- Use `firebase-admin` for server-side Firestore access, not the client SDK.
- Use `onDocumentWritten`, `onCall`, or `onRequest` from `firebase-functions/v2`.
- Keep functions small and focused — one trigger or endpoint per file.
- Export all functions from `src/index.ts`.
- Store secrets and API keys using Firebase environment config, never hardcode.
