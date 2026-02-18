"use client";

import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LogoutIcon from "@mui/icons-material/Logout";
import { authService } from "@chooz/services";
import { AuthGuard } from "@/components/AuthGuard";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Seed Restaurants", href: "/seed", icon: <AddBusinessIcon /> },
  { label: "Claims", href: "/claims", icon: <AssignmentIcon /> },
  { label: "Restaurants", href: "/restaurants", icon: <StorefrontIcon /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  return (
    <AuthGuard requiredRole="admin">
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Admin
            </Typography>
          </Box>
          <Divider />
          <List sx={{ flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.href}
                selected={pathname === item.href}
                onClick={() => router.push(item.href)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
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
        </Drawer>
        <Box component="main" sx={{ flex: 1, p: 4 }}>
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
}
