"use client";

import { useRouter } from "next/navigation";
import { authService } from "@chooz/services";
import { AuthGuard } from "@/components/AuthGuard";

/**
 * Dashboard route group layout.
 * All routes here require authentication with the "owner" role.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <AuthGuard requiredRole="owner">
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <nav
          style={{
            width: 240,
            borderRight: "1px solid #eee",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Chooz</h2>
          <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href="/edit">Menu Editor</a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href="/profile">Profile</a>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Log out
          </button>
        </nav>
        <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
      </div>
    </AuthGuard>
  );
}
