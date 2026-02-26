"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { RestaurantForm, type RestaurantFormData } from "@/components/restaurant/RestaurantForm";
import { ImageUploadSection } from "@/components/restaurant/ImageUploadSection";
import { ConfirmChangesDialog, computeChanges } from "@/components/restaurant/ConfirmChangesDialog";
import { VisibilityPanel } from "@/components/restaurant/VisibilityPanel";

export default function ProfilePage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { restaurants, selectedRestaurantId, fetchRestaurantForOwner, updateRestaurant } = useRestaurantStore();
  const restaurant = restaurants.find((r) => r.id === selectedRestaurantId) ?? null;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [noChangesSnackOpen, setNoChangesSnackOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<RestaurantFormData | null>(null);

  // Snapshot of the restaurant state when the page loads, used to detect image changes
  const initialSnapshot = useRef<{
    form: RestaurantFormData;
    images: { banner: string | null; logo: string | null };
  } | null>(null);

  // Promise resolve callback — kept in a ref so handleConfirm can resolve the
  // promise that handleSubmit returned to RestaurantForm.  This lets the form
  // know the save actually completed so it can update its clean snapshot.
  const pendingResolve = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchRestaurantForOwner(firebaseUser.uid).finally(() => setLoading(false));
  }, [firebaseUser, fetchRestaurantForOwner]);

  useEffect(() => {
    if (!loading && !restaurant) {
      router.replace("/welcome");
    }
  }, [loading, restaurant, router]);

  // Capture initial snapshot once the restaurant data is first available
  useEffect(() => {
    if (restaurant && !initialSnapshot.current) {
      initialSnapshot.current = {
        form: {
          name: restaurant.name,
          description: restaurant.description,
          phone: restaurant.phone,
          address: restaurant.address,
          hours: restaurant.hours,
          tags: restaurant.tags,
          isPublished: restaurant.isPublished,
        },
        images: {
          banner: restaurant.bannerImageUrl,
          logo: restaurant.logoImageUrl,
        },
      };
    }
  }, [restaurant]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!restaurant) return null;

  const handleSubmit = (data: RestaurantFormData): Promise<void> => {
    if (!initialSnapshot.current) return Promise.resolve();

    const changes = computeChanges(
      initialSnapshot.current.form,
      data,
      initialSnapshot.current.images,
      { banner: restaurant.bannerImageUrl, logo: restaurant.logoImageUrl },
    );

    if (changes.length === 0) {
      setNoChangesSnackOpen(true);
      return Promise.resolve();
    }

    // Return a promise that only resolves when the user confirms.
    // If they cancel, the promise stays pending so RestaurantForm
    // never updates its clean snapshot (keeping the form dirty).
    return new Promise<void>((resolve) => {
      setPendingFormData(data);
      pendingResolve.current = resolve;
      setConfirmDialogOpen(true);
    });
  };

  const handleConfirm = async () => {
    if (!pendingFormData) return;
    setSubmitting(true);
    setConfirmError(null);
    try {
      await updateRestaurant(restaurant.id, {
        name: pendingFormData.name,
        description: pendingFormData.description,
        phone: pendingFormData.phone,
        address: pendingFormData.address,
        hours: pendingFormData.hours,
        tags: pendingFormData.tags,
        // isPublished is managed by VisibilityPanel and saved independently
        isPublished: restaurant.isPublished,
      });
      setConfirmDialogOpen(false);
      setPendingFormData(null);
      setSnackOpen(true);
      // Resolve the promise so RestaurantForm updates its clean snapshot
      pendingResolve.current?.();
      pendingResolve.current = null;
      // Update the snapshot to reflect the newly saved state
      initialSnapshot.current = {
        form: { ...pendingFormData },
        images: {
          banner: restaurant.bannerImageUrl,
          logo: restaurant.logoImageUrl,
        },
      };
    } catch (error) {
      setConfirmError(
        error instanceof Error ? error.message : "Failed to save changes. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmChanges = pendingFormData && initialSnapshot.current
    ? computeChanges(
        initialSnapshot.current.form,
        pendingFormData,
        initialSnapshot.current.images,
        { banner: restaurant.bannerImageUrl, logo: restaurant.logoImageUrl },
      )
    : [];

  return (
    <>
      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {/* Left column — main form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Restaurant Profile
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Update your restaurant information.
          </Typography>
          <ImageUploadSection
            variant="hero"
            ownerUid={firebaseUser?.uid ?? ""}
            restaurantId={restaurant.id}
            bannerImageUrl={restaurant.bannerImageUrl}
            logoImageUrl={restaurant.logoImageUrl}
            onImageUpdated={async (field, url) => {
              await updateRestaurant(restaurant.id, { [field]: url });
              if (initialSnapshot.current) {
                const key = field === "bannerImageUrl" ? "banner" : "logo";
                initialSnapshot.current.images[key] = url;
              }
            }}
          />
          <RestaurantForm
            initialData={restaurant}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            submitting={submitting}
            draftKey={`chooz:draft:profile:${restaurant.id}`}
            hideVisibility
          />
        </Box>

        {/* Right sidebar */}
        <Box sx={{ width: 300, flexShrink: 0, position: "sticky", top: 24 }}>
          <VisibilityPanel />
        </Box>
      </Box>

      <ConfirmChangesDialog
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setPendingFormData(null);
          setConfirmError(null);
          // Drop the pending promise — it stays unresolved so the form
          // keeps its dirty state and the sticky bar reappears.
          pendingResolve.current = null;
        }}
        onConfirm={handleConfirm}
        confirming={submitting}
        changes={confirmChanges}
        error={confirmError}
      />
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnackOpen(false)}>
          Changes saved successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={noChangesSnackOpen}
        autoHideDuration={4000}
        onClose={() => setNoChangesSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setNoChangesSnackOpen(false)}>
          No changes to save.
        </Alert>
      </Snackbar>
    </>
  );
}
