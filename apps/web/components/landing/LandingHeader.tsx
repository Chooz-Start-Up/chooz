"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "next/link";

export function LandingHeader() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Chooz"
              sx={{ width: 24, height: 24 }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "primary.main",
                fontWeight: 700,
              }}
            >
              Chooz
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={Link}
              href="/login"
              variant="text"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              Log In
            </Button>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              disableElevation
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
