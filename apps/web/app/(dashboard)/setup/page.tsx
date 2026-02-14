"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { RestaurantForm, type RestaurantFormData } from "@/components/restaurant/RestaurantForm";

export default function SetupPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { restaurant, fetchRestaurantForOwner, createRestaurant } = useRestaurantStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (data: RestaurantFormData) => {
    if (!firebaseUser) return;
    setSubmitting(true);
    try {
      await createRestaurant({
        name: data.name,
        description: data.description,
        phone: data.phone,
        address: data.address,
        hours: data.hours,
        tags: data.tags,
        isPublished: false,
        ownerUid: firebaseUser.uid,
        ownershipStatus: "claimed",
        claimedBy: null,
        claimDate: null,
        verifiedDate: null,
        latitude: 0,
        longitude: 0,
        geoHash: "",
        bannerImageUrl: null,
        logoImageUrl: null,
      });
      router.push("/profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Set Up Your Restaurant
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Fill in your restaurant details to get started on Chooz.
      </Typography>
      <RestaurantForm
        onSubmit={handleSubmit}
        submitLabel="Create Restaurant"
        submitting={submitting}
        draftKey="chooz:draft:setup"
      />
    </Box>
  );
}
