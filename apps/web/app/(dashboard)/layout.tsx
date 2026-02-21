"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { authService } from "@chooz/services";
import { colors } from "@chooz/shared";
import { AuthGuard } from "@/components/AuthGuard";

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 64;
const TRANSITION = "width 0.2s ease";

const NAV_ITEMS = [
  { label: "Profile", href: "/profile", icon: <PersonIcon /> },
  { label: "Menu Editor", href: "/edit", icon: <MenuBookIcon /> },
];

/**
 * Dashboard route group layout.
 * All routes here require authentication with the "owner" role.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Drawer appears expanded when not collapsed OR when collapsed but hovered
  const expanded = !collapsed || hovered;
  const drawerWidth = expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED;

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <AuthGuard requiredRole="owner">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Reserve space for the drawer in the layout flow.
            When collapsed, main content shifts left to fill the gap. */}
        <Box
          sx={{
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
            flexShrink: 0,
            transition: TRANSITION,
          }}
        />
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              transition: TRANSITION,
              overflowX: "hidden",
            },
          }}
          onMouseEnter={() => { if (collapsed) setHovered(true); }}
          onMouseLeave={() => setHovered(false)}
        >
          <Box
            sx={{
              bgcolor: colors.primary.main,
              px: expanded ? 2 : 0,
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: expanded ? "flex-start" : "center",
              overflow: "hidden",
              height: 40,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Chooz"
              sx={{
                width: 52,
                height: 52,
                m: -1.5,
                mr: expanded ? -1 : -1.5,
                filter: "brightness(0) invert(1)",
              }}
            />
            {expanded && (
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: colors.white, whiteSpace: "nowrap" }}
              >
                Chooz
              </Typography>
            )}
          </Box>
          <Divider />
          <List sx={{ flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Tooltip key={item.href} title={expanded ? "" : item.label} placement="right">
                <ListItemButton
                  selected={pathname === item.href}
                  onClick={() => router.push(item.href)}
                  sx={{
                    justifyContent: expanded ? "flex-start" : "center",
                    px: expanded ? 2 : 1.5,
                    "&.Mui-selected": {
                      bgcolor: colors.secondary.main,
                      "&:hover": { bgcolor: colors.secondary.main },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: colors.primary.main,
                      minWidth: expanded ? 56 : 0,
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {expanded && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
          {expanded && (
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </Box>
            </>
          )}
          <Divider />
          <Box sx={{ display: "flex", justifyContent: expanded ? "flex-end" : "center", p: 0.5 }}>
            <IconButton size="small" onClick={() => { setCollapsed((c) => !c); setHovered(false); }}>
              <ChevronLeftIcon
                sx={{
                  transition: "transform 0.2s ease",
                  transform: collapsed ? "rotate(180deg)" : "none",
                }}
              />
            </IconButton>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flex: 1, p: 4 }}>
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
}
