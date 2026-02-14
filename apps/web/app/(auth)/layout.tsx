"use client";

import Box from "@mui/material/Box";

/**
 * Auth route group layout.
 * These pages are public (login, register, etc.) — no auth guard needed.
 * Provides a centered layout with cream background for auth forms.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
        bgcolor: "secondary.main",
      }}
    >
      {children}
    </Box>
  );
}
