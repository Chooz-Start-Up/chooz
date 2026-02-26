"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Link from "next/link";
import { use } from "react";
import type { Category, Item, Menu, Restaurant } from "@chooz/shared";
import { categoryService, itemService, menuService, restaurantService } from "@chooz/services";
import { useAuthStore } from "@/stores/authStore";
import { MenuContent } from "@/components/public/MenuContent";
import { MenuTabs } from "@/components/public/MenuTabs";
import { isMenuAvailable } from "@/components/public/menuUtils";

type MenuCache = Record<string, { categories: Category[]; items: Record<string, Item[]> }>;

function HeaderSkeleton() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton width={160} height={24} />
    </Box>
  );
}

export default function MenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [menuCache, setMenuCache] = useState<MenuCache>({});
  const [menuLoading, setMenuLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { firebaseUser } = useAuthStore();

  // Fetch restaurant name + menus on mount
  useEffect(() => {
    Promise.all([restaurantService.getRestaurant(id), menuService.getMenus(id)])
      .then(([rest, fetchedMenus]) => {
        if (rest) {
          setRestaurant(rest);
          setRestaurantName(rest.name);
        }
        setMenus(fetchedMenus);
        if (fetchedMenus.length > 0) {
          const available = fetchedMenus.find((m) => isMenuAvailable(m));
          setSelectedMenuId((available ?? fetchedMenus[0]).id);
        }
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, [id]);

  // Fetch menu content when selectedMenuId changes
  const fetchingRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedMenuId) return;
    if (menuCache[selectedMenuId]) return;
    if (fetchingRef.current === selectedMenuId) return;

    fetchingRef.current = selectedMenuId;
    setMenuLoading(true);

    categoryService
      .getCategories(id, selectedMenuId)
      .then(async (cats) => {
        const itemEntries = await Promise.all(
          cats.map((cat) =>
            itemService.getItems(id, selectedMenuId, cat.id).then((its) => [cat.id, its] as const),
          ),
        );
        setMenuCache((prev) => ({
          ...prev,
          [selectedMenuId]: { categories: cats, items: Object.fromEntries(itemEntries) },
        }));
      })
      .catch(() => {
        setMenuCache((prev) => ({
          ...prev,
          [selectedMenuId]: { categories: [], items: {} },
        }));
      })
      .finally(() => {
        fetchingRef.current = null;
        setMenuLoading(false);
      });
  }, [id, selectedMenuId, menuCache]);

  const selectedMenu = menus.find((m) => m.id === selectedMenuId);
  const cached = selectedMenuId ? menuCache[selectedMenuId] : undefined;

  const isOwner = !!firebaseUser && !!restaurant && firebaseUser.uid === restaurant.ownerUid;

  if (!pageLoading && restaurant?.isMenuReady === false && !isOwner) {
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
        <Box sx={{ textAlign: "center", px: 3 }}>
          <MenuBookIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menu coming soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            This restaurant is still preparing their menu.
          </Typography>
          <Typography
            component={Link}
            href={`/restaurant/${id}`}
            variant="body2"
            sx={{
              color: "#D11D27",
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            ← Back to profile
          </Typography>
        </Box>
      </Box>
    );
  }

  const bannerMessage = restaurant && !restaurant.isPublished
    ? "Restaurant not published — customers can't see this menu yet."
    : "Menu isn't enabled — customers see a \"coming soon\" page.";
  const bannerVisible = isOwner
    && !!restaurant
    && (!restaurant.isPublished || restaurant.isMenuReady === false);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFFAEF", pt: bannerVisible ? "48px" : 0 }}>
      {bannerVisible && (
        <Paper elevation={0} sx={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1400,
          bgcolor: "warning.dark", color: "white",
          display: "flex", alignItems: "center",
          px: 2, py: 1, gap: 1,
        }}>
          <VisibilityOffIcon fontSize="small" />
          <Typography variant="body2">
            {bannerMessage}
          </Typography>
        </Paper>
      )}
    <Box sx={{ maxWidth: 640, mx: "auto", pb: 6, bgcolor: "white", boxShadow: { xs: "none", sm: 4 }, borderRadius: { xs: 0, sm: 3 }, overflow: "hidden", minHeight: "100vh" }}>
      {/* Header */}
      {pageLoading ? (
        <HeaderSkeleton />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 1,
            borderBottom: 1,
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 20,
            bgcolor: "background.paper",
          }}
        >
          <IconButton component={Link} href={`/restaurant/${id}`} aria-label="Back to profile">
            <ArrowBackIcon />
          </IconButton>
          {restaurantName && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {restaurantName}
            </Typography>
          )}
        </Box>
      )}

      {!pageLoading && menus.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 6 }}>
          No menus available yet.
        </Typography>
      ) : (
        <>
          <MenuTabs menus={menus} selectedMenuId={selectedMenuId} onChange={setSelectedMenuId} />
          <MenuContent
            menu={selectedMenu}
            categories={cached?.categories ?? []}
            items={cached?.items ?? {}}
            loading={pageLoading || (menuLoading && !cached)}
          />
        </>
      )}
    </Box>
    </Box>
  );
}
