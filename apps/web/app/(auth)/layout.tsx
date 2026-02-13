"use client";

/**
 * Auth route group layout.
 * These pages are public (login, register, etc.) — no auth guard needed.
 * Provides a centered layout for auth forms.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      {children}
    </div>
  );
}
