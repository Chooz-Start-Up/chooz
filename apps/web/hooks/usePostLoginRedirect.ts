"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

/**
 * Redirects authenticated users away from auth pages based on their role.
 * Call this at the top of login, register, and reset-password pages.
 */
export function usePostLoginRedirect() {
  const router = useRouter();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (loading || !firebaseUser || !profile) return;

    switch (profile.role) {
      case "admin":
        router.replace("/dashboard");
        break;
      case "owner":
      default:
        router.replace("/edit");
        break;
    }
  }, [loading, firebaseUser, profile, router]);
}
