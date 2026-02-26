"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { Restaurant } from "@chooz/shared";
import { restaurantService } from "@chooz/services";

const GRID_SX = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(4, 1fr)",
  },
  gap: 3,
};

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Paper
      component={Link}
      href={`/restaurant/${restaurant.id}`}
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: 140,
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 -4px 6px -4px rgba(0,0,0,0.15)",
        }}
      >
        {restaurant.bannerImageUrl ? (
          <Box
            component="img"
            src={restaurant.bannerImageUrl}
            alt={restaurant.name}
            loading="lazy"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.removeAttribute("style");
            }}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              position: "absolute",
              inset: 0,
            }}
          />
        ) : null}
        <Box
          component="img"
          src="/logo.png"
          alt=""
          sx={{
            width: 36,
            height: 36,
            opacity: 0.5,
            ...(restaurant.bannerImageUrl ? { display: "none" } : {}),
          }}
        />
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {restaurant.name}
        </Typography>

        {restaurant.tags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
            {restaurant.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 22 }} />
            ))}
          </Box>
        )}

        {restaurant.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {restaurant.description}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function SkeletonGrid() {
  return (
    <Box sx={GRID_SX}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Paper key={i} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Skeleton variant="rectangular" height={140} />
          <Box sx={{ p: 2 }}>
            <Skeleton width="60%" height={24} />
            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              <Skeleton width={60} height={24} sx={{ borderRadius: 4 }} />
              <Skeleton width={60} height={24} sx={{ borderRadius: 4 }} />
            </Box>
            <Skeleton width="90%" height={16} sx={{ mt: 1 }} />
            <Skeleton width="70%" height={16} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export function RestaurantPreviewGrid() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    restaurantService
      .getPublishedRestaurants()
      .then((data) => setRestaurants(data.slice(0, 8)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonGrid />;

  if (error) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
        Unable to load restaurants right now. Please check back later.
      </Typography>
    );
  }

  if (restaurants.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
        Restaurants coming soon — stay tuned!
      </Typography>
    );
  }

  return (
    <Box sx={GRID_SX}>
      {restaurants.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} />
      ))}
    </Box>
  );
}
