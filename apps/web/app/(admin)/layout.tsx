"use client";

import { AuthGuard } from "@/components/AuthGuard";

/**
 * Admin route group layout.
 * All routes here require authentication with the "admin" role.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="admin">
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <nav
          style={{
            width: 240,
            borderRight: "1px solid #eee",
            padding: "1rem",
            background: "#fafafa",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Admin</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href="/seed">Seed Restaurants</a>
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
              <a href="/claims">Claims</a>
            </li>
          </ul>
        </nav>
        <main style={{ flex: 1, padding: "2rem" }}>{children}</main>
      </div>
    </AuthGuard>
  );
}
