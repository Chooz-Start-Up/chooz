"use client";

import { useEffect } from "react";
import { authService, userService } from "@chooz/services";
import { useAuthStore } from "@/stores/authStore";

/**
 * Listens to Firebase auth state and syncs it to the Zustand store.
 * Also fetches the user profile from Firestore on login.
 * Mount this once in the root layout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const setProfile = useAuthStore((s) => s.setProfile);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const profile = await userService.getUser(firebaseUser.uid);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return unsubscribe;
  }, [setFirebaseUser, setProfile]);

  return <>{children}</>;
}
