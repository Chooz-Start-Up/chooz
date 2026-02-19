"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import type { SeedRestaurantData } from "@chooz/shared";
import { TagsSelect } from "@/components/restaurant/TagsSelect";
import { useAdminStore } from "@/stores/adminStore";

const EMPTY_FORM: SeedRestaurantData = {
  name: "",
  description: "",
  address: "",
  phone: "",
  tags: [],
};

export default function SeedPage() {
  const { seedRestaurant, submitting } = useAdminStore();
  const [form, setForm] = useState<SeedRestaurantData>(EMPTY_FORM);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleChange = (field: keyof SeedRestaurantData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await seedRestaurant(form);
      setSnackbar({
        open: true,
        message: `Restaurant seeded successfully (ID: ${result.restaurantId})`,
        severity: "success",
      });
      setForm(EMPTY_FORM);
    } catch (error) {
      setSnackbar({
        open: true,
        message: (error as Error).message || "Failed to seed restaurant",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Seed Restaurant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create restaurant profiles from public data. Seeded restaurants are
        published immediately and available for owners to claim.
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Restaurant Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            multiline
            rows={3}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 3 }}>
            <TagsSelect
              value={form.tags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !form.name.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> : undefined}
          >
            {submitting ? "Seeding..." : "Seed Restaurant"}
          </Button>
        </form>
      </Paper>

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
