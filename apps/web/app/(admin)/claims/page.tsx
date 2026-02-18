"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useAdminStore } from "@/stores/adminStore";
import { ClaimReviewCard } from "@/components/admin/ClaimReviewCard";

type Filter = "pending" | "all";

export default function ClaimsPage() {
  const {
    claims,
    restaurants,
    loading,
    error,
    fetchClaims,
    fetchRestaurants,
    processClaim,
  } = useAdminStore();
  const [filter, setFilter] = useState<Filter>("pending");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchClaims();
    fetchRestaurants();
  }, [fetchClaims, fetchRestaurants]);

  const restaurantMap = new Map(restaurants.map((r) => [r.id, r.name]));

  const filteredClaims =
    filter === "pending"
      ? claims.filter((c) => c.status === "pending")
      : claims;

  const handleProcess = async (
    claimId: string,
    action: "approve" | "reject",
    notes?: string,
  ) => {
    try {
      await processClaim(claimId, action, notes);
      setSnackbar({
        open: true,
        message: `Claim ${action === "approve" ? "approved" : "rejected"} successfully`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: (err as Error).message || `Failed to ${action} claim`,
        severity: "error",
      });
    }
  };

  if (loading && claims.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Claim Requests
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          size="small"
        >
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredClaims.length === 0 ? (
        <Typography color="text.secondary">
          {filter === "pending"
            ? "No pending claims to review."
            : "No claims found."}
        </Typography>
      ) : (
        filteredClaims.map((claim) => (
          <ClaimReviewCard
            key={claim.id}
            claim={claim}
            restaurantName={
              restaurantMap.get(claim.restaurantId) ?? "Unknown Restaurant"
            }
            onProcess={handleProcess}
            disabled={loading}
          />
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
