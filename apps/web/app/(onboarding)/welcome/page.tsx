"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";

export default function WelcomePage() {
  const router = useRouter();
  const { firebaseUser, profile } = useAuthStore();
  const { restaurant, fetchRestaurantForOwner } = useRestaurantStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchRestaurantForOwner(firebaseUser.uid).finally(() => setLoading(false));
  }, [firebaseUser, fetchRestaurantForOwner]);

  useEffect(() => {
    if (!loading && restaurant) {
      router.replace("/profile");
    }
  }, [loading, restaurant, router]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (restaurant) return null;

  const displayName = profile?.displayName?.split(" ")[0] ?? "there";

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        maxWidth: 560,
        p: 5,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: "primary.main", fontWeight: 700, mb: 3 }}
      >
        Chooz
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Welcome, {displayName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Let&apos;s get your restaurant set up on Chooz so customers can discover
        your menu.
      </Typography>

      {/* Onboarding steps overview */}
      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 4, textAlign: "left", bgcolor: "grey.50" }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Here&apos;s what we&apos;ll do:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip label="1" size="small" color="primary" sx={{ fontWeight: 600, minWidth: 28 }} />
            <Typography variant="body2">
              <strong>Create your restaurant profile</strong> — name, hours,
              location, and images
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip label="2" size="small" variant="outlined" sx={{ fontWeight: 600, minWidth: 28 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Build your menu</strong> — add categories, items, and
              pricing (coming soon)
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => router.push("/setup")}
          sx={{ textTransform: "none", py: 1.5 }}
        >
          Start a new restaurant
        </Button>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          disabled
          sx={{ textTransform: "none", py: 1.5 }}
        >
          Claim an existing restaurant
          <Chip
            label="Coming Soon"
            size="small"
            sx={{ ml: 1, fontSize: "0.7rem", height: 20 }}
          />
        </Button>
      </Box>
    </Paper>
  );
}
