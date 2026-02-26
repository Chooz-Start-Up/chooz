"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Link from "next/link";
import { use } from "react";
import type { Restaurant } from "@chooz/shared";
import { restaurantService } from "@chooz/services";
import { RestaurantHero } from "@/components/public/RestaurantHero";

function PageSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={220} />
      <Box sx={{ px: 2, pt: 2 }}>
        <Skeleton variant="circular" width={56} height={56} sx={{ mt: "-28px", mb: 1 }} />
        <Skeleton width="60%" height={32} />
        <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
        <Skeleton width="50%" height={20} sx={{ mt: 0.75 }} />
        <Skeleton width="55%" height={20} sx={{ mt: 0.75 }} />
      </Box>
    </Box>
  );
}

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    restaurantService
      .getRestaurant(id)
      .then((rest) => {
        if (!rest) {
          setNotFound(true);
        } else {
          setRestaurant(rest);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setPageLoading(false));
  }, [id]);

  if (pageLoading) return <PageSkeleton />;

  if (notFound) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          px: 3,
        }}
      >
        <Box component="img" src="/logo.png" alt="Chooz" sx={{ width: 40, height: 40 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center" }}>
          Hmm, we can&apos;t find that spot.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", maxWidth: 280 }}>
          This restaurant might have moved or the link is no longer active.
        </Typography>
        <Typography
          component={Link}
          href="/"
          variant="body2"
          sx={{
            mt: 1,
            color: "#D11D27",
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Explore restaurants →
        </Typography>
      </Box>
    );
  }

  if (!restaurant) return null;

  if (!restaurant.isPublished) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#FFFAEF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", px: 3, maxWidth: 320 }}>
          <Box component="img" src="/logo.png" alt="Chooz" sx={{ width: 40, height: 40, mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            This restaurant isn&apos;t available right now.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Check back soon.
          </Typography>
          <Typography
            component={Link}
            href="/"
            variant="body2"
            sx={{
              mt: 2,
              display: "block",
              color: "#D11D27",
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Explore restaurants →
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    // Tan page background — the card "floats" on it at wider viewports
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFFAEF" }}>
      <Box
        sx={{
          maxWidth: 640,
          mx: "auto",
          pb: 10,
          bgcolor: "white",
          boxShadow: { xs: "none", sm: 4 },
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
          minHeight: "100vh",
        }}
      >
      <RestaurantHero restaurant={restaurant} />

      {/* Conditional FAB — Menu Ready */}
      {restaurant.isMenuReady === false ? (
        <Fab
          variant="extended"
          disabled
          sx={{ position: "fixed", bottom: 24, right: 24, boxShadow: 4 }}
        >
          <MenuBookIcon sx={{ mr: 1 }} />
          Menu coming soon
        </Fab>
      ) : (
        <Fab
          variant="extended"
          component={Link}
          href={`/restaurant/${id}/menu`}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            bgcolor: "#D11D27",
            color: "white",
            "&:hover": { bgcolor: "#A90011" },
            boxShadow: 4,
            textDecoration: "none",
          }}
        >
          <MenuBookIcon sx={{ mr: 1 }} />
          Menu
        </Fab>
      )}
      </Box>
    </Box>
  );
}
