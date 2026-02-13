"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@chooz/shared";

interface AuthGuardProps {
  children: React.ReactNode;
  /** If set, user must have this role. Redirects to / otherwise. */
  requiredRole?: User["role"];
}

/**
 * Protects routes that require authentication.
 * Redirects to /login if not authenticated.
 * Optionally enforces a required role (e.g. "owner", "admin").
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { firebaseUser, profile, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    if (requiredRole && profile?.role !== requiredRole) {
      router.replace("/");
    }
  }, [firebaseUser, profile, loading, requiredRole, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!firebaseUser) return null;
  if (requiredRole && profile?.role !== requiredRole) return null;

  return <>{children}</>;
}
