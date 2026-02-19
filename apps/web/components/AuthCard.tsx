"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

interface AuthCardProps {
  heading: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ heading, subtitle, children }: AuthCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        maxWidth: 440,
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        component="img"
        src="/logo.png"
        alt="Chooz"
        sx={{ width: 100, height: 100, mb: 0 }}
      />

      <Typography
        variant="h4"
        sx={{ color: "primary.main", fontWeight: 700, mb: 3 }}
      >
        Chooz
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: subtitle ? 1 : 3 }}>
        {heading}
      </Typography>

      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          {subtitle}
        </Typography>
      )}

      <Box sx={{ width: "100%" }}>{children}</Box>
    </Paper>
  );
}
