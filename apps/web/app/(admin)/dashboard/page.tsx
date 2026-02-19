"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useAdminStore } from "@/stores/adminStore";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Paper sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h3" fontWeight="bold" color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Paper>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { restaurants, claims, loadingRestaurants, loadingClaims, error, fetchRestaurants, fetchClaims } =
    useAdminStore();

  useEffect(() => {
    fetchRestaurants();
    fetchClaims();
  }, [fetchRestaurants, fetchClaims]);

  const totalRestaurants = restaurants.length;
  const publishedCount = restaurants.filter((r) => r.isPublished).length;
  const seededCount = restaurants.filter(
    (r) => r.ownershipStatus === "seeded",
  ).length;
  const pendingClaims = claims.filter((c) => c.status === "pending").length;

  if ((loadingRestaurants || loadingClaims) && restaurants.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Restaurants" value={totalRestaurants} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Published"
            value={publishedCount}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Seeded" value={seededCount} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Pending Claims"
            value={pendingClaims}
            color={pendingClaims > 0 ? "warning.main" : undefined}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<AddBusinessIcon />}
            onClick={() => router.push("/seed")}
          >
            Seed Restaurant
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={() => router.push("/claims")}
          >
            Review Claims
            {pendingClaims > 0 && ` (${pendingClaims})`}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<StorefrontIcon />}
            onClick={() => router.push("/restaurants")}
          >
            Manage Restaurants
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
