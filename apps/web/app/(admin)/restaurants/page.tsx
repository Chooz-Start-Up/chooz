"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import EditIcon from "@mui/icons-material/Edit";
import type { Restaurant } from "@chooz/shared";
import { useAdminStore } from "@/stores/adminStore";
import { RestaurantEditDialog } from "@/components/admin/RestaurantEditDialog";

type OwnershipFilter = "all" | "seeded" | "claimed" | "verified";
type PublishedFilter = "all" | "published" | "unpublished";

const OWNERSHIP_COLORS: Record<
  Restaurant["ownershipStatus"],
  "default" | "info" | "warning" | "success"
> = {
  seeded: "info",
  claimed: "warning",
  verified: "success",
};

function formatDate(ts: { seconds: number }): string {
  if (!ts.seconds) return "-";
  return new Date(ts.seconds * 1000).toLocaleDateString();
}

export default function RestaurantsPage() {
  const {
    restaurants,
    loadingRestaurants,
    error,
    fetchRestaurants,
    updateRestaurant,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>("all");
  const [publishedFilter, setPublishedFilter] =
    useState<PublishedFilter>("all");
  const [editingRestaurant, setEditingRestaurant] =
    useState<Restaurant | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [recentlyEditedId, setRecentlyEditedId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flashRow = useCallback((id: string) => {
    clearTimeout(highlightTimer.current);
    setRecentlyEditedId(id);
    highlightTimer.current = setTimeout(() => setRecentlyEditedId(null), 2000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(highlightTimer.current);
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (
        search &&
        !r.name.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (ownershipFilter !== "all" && r.ownershipStatus !== ownershipFilter) {
        return false;
      }
      if (publishedFilter === "published" && !r.isPublished) return false;
      if (publishedFilter === "unpublished" && r.isPublished) return false;
      return true;
    });
  }, [restaurants, search, ownershipFilter, publishedFilter]);

  const handleSaveEdit = async (
    id: string,
    data: Partial<Omit<Restaurant, "id" | "createdAt">>,
  ) => {
    try {
      await updateRestaurant(id, data);
      flashRow(id);
      setSnackbar({
        open: true,
        message: "Restaurant updated successfully",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: (err as Error).message || "Failed to update restaurant",
        severity: "error",
      });
    }
  };

  if (loadingRestaurants && restaurants.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Restaurants
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          label="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <ToggleButtonGroup
          value={ownershipFilter}
          exclusive
          onChange={(_, val) => val && setOwnershipFilter(val)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="seeded">Seeded</ToggleButton>
          <ToggleButton value="claimed">Claimed</ToggleButton>
          <ToggleButton value="verified">Verified</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={publishedFilter}
          exclusive
          onChange={(_, val) => val && setPublishedFilter(val)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="published">Published</ToggleButton>
          <ToggleButton value="unpublished">Unpublished</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Ownership</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRestaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No restaurants match the current filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <TableRow
                  key={restaurant.id}
                  sx={{
                    transition: "background-color 1s ease",
                    backgroundColor:
                      recentlyEditedId === restaurant.id
                        ? "success.light"
                        : "transparent",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {restaurant.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={restaurant.ownershipStatus}
                      color={OWNERSHIP_COLORS[restaurant.ownershipStatus]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={restaurant.isPublished ? "Published" : "Unpublished"}
                      color={restaurant.isPublished ? "success" : "default"}
                      size="small"
                      onClick={() => setEditingRestaurant(restaurant)}
                      sx={{ cursor: "pointer" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {restaurant.ownerUid ?? "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(restaurant.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => setEditingRestaurant(restaurant)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <RestaurantEditDialog
        restaurant={editingRestaurant}
        open={editingRestaurant !== null}
        onClose={() => setEditingRestaurant(null)}
        onSave={handleSaveEdit}
      />

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
