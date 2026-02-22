"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { use } from "react";
import type { Category, Item, Menu } from "@chooz/shared";
import { categoryService, itemService, menuService, restaurantService } from "@chooz/services";
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

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [menuCache, setMenuCache] = useState<MenuCache>({});
  const [menuLoading, setMenuLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch restaurant name + menus on mount
  useEffect(() => {
    Promise.all([restaurantService.getRestaurant(id), menuService.getMenus(id)])
      .then(([rest, fetchedMenus]) => {
        if (rest) setRestaurantName(rest.name);
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFFAEF" }}>
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
