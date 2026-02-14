import { z } from "zod";

/**
 * Firebase config schema. All values are required — if any are missing,
 * initialization fails fast with a clear error listing exactly which
 * variables are undefined.
 *
 * Both NEXT_PUBLIC_ and EXPO_PUBLIC_ prefixes are checked so the same
 * validation works in both Next.js and Expo environments.
 */
const firebaseEnvSchema = z.object({
  apiKey: z.string().min(1, "Firebase API key is required"),
  authDomain: z.string().min(1, "Firebase auth domain is required"),
  projectId: z.string().min(1, "Firebase project ID is required"),
  storageBucket: z.string().min(1, "Firebase storage bucket is required"),
  messagingSenderId: z.string().min(1, "Firebase messaging sender ID is required"),
  appId: z.string().min(1, "Firebase app ID is required"),
});

export type FirebaseEnv = z.infer<typeof firebaseEnvSchema>;

/**
 * Reads and validates Firebase environment variables.
 * Throws a descriptive error at startup if any are missing.
 *
 * NOTE: Each env var must be referenced as a literal `process.env.NEXT_PUBLIC_*`
 * string. Next.js (and Expo) perform static string replacement at build time —
 * dynamic access like `process.env[key]` is never replaced.
 */
export function getFirebaseConfig(): FirebaseEnv {
  const raw = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  const result = firebaseEnvSchema.safeParse(raw);

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Missing or invalid Firebase environment variables:\n${missing}\n\n` +
      "Create a .env.local file with your Firebase config. " +
      "See apps/web/.env.local.example for the template.",
    );
  }

  return result.data;
}
