"use client";

import { useEffect } from "react";
import { authService, userService } from "@chooz/services";
import type { User } from "@chooz/shared";
import { useAuthStore } from "@/stores/authStore";

function mapProviderId(providerId: string): User["authProvider"] {
  switch (providerId) {
    case "google.com":
      return "google";
    case "facebook.com":
      return "facebook";
    case "apple.com":
      return "apple";
    default:
      return "email";
  }
}

/**
 * Listens to Firebase auth state and syncs it to the Zustand store.
 * Also fetches the user profile from Firestore on login.
 * For first-time OAuth users (non-password providers), auto-creates a
 * Firestore profile with role "owner".
 * Mount this once in the root layout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await userService.getUser(firebaseUser.uid);

        // Auto-create profile for first-time OAuth users
        if (!profile) {
          const providerId =
            firebaseUser.providerData[0]?.providerId ?? "password";

          if (providerId !== "password") {
            const authProvider = mapProviderId(providerId);
            await userService.createUser(firebaseUser.uid, {
              email: firebaseUser.email ?? "",
              displayName: firebaseUser.displayName ?? "",
              authProvider,
              role: "owner",
            });
            profile = await userService.getUser(firebaseUser.uid);
          }
        }

        // Set profile before firebaseUser so AuthGuard sees both atomically
        setProfile(profile);
        setFirebaseUser(firebaseUser);
      } else {
        setProfile(null);
        setFirebaseUser(null);
      }
    });

    return unsubscribe;
  }, [setFirebaseUser, setProfile, setLoading]);

  return <>{children}</>;
}
