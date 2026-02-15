"use client";

import Box from "@mui/material/Box";
import { AuthGuard } from "@/components/AuthGuard";

/**
 * Onboarding route group layout.
 * Auth-protected with "owner" role but no sidebar navigation.
 * Used for first-time setup flows (welcome, etc.)
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="owner">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        {children}
      </Box>
    </AuthGuard>
  );
}
