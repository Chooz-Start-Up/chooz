"use client";

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
  return (
    <AuthGuard requiredRole="owner">
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <nav
          style={{
            width: 240,
            borderRight: "1px solid #eee",
            padding: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Chooz</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href="/edit">Menu Editor</a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href="/profile">Profile</a>
            </li>
<li style={{ marginBottom: "0.5rem" }}>
              <a href="/setup">Setup</a>
            </li>
          </ul>
        </nav>
        <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
      </div>
    </AuthGuard>
  );
}
