"use client";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { Menu } from "@chooz/shared";
import { isMenuAvailable } from "./menuUtils";

interface MenuTabsProps {
  menus: Menu[];
  selectedMenuId: string | null;
  onChange: (id: string) => void;
}

export function MenuTabs({ menus, selectedMenuId, onChange }: MenuTabsProps) {
  if (menus.length === 0) return null;

  const selectedIndex = menus.findIndex((m) => m.id === selectedMenuId);
  const currentIndex = selectedIndex === -1 ? 0 : selectedIndex;

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Tabs
        value={currentIndex}
        onChange={(_, idx) => onChange(menus[idx].id)}
        variant="scrollable"
        scrollButtons={false}
      >
        {menus.map((menu) => {
          const available = isMenuAvailable(menu);
          return (
            <Tab
              key={menu.id}
              label={
                available ? (
                  menu.name
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 14 }} />
                    {menu.name}
                  </Box>
                )
              }
              sx={{ color: available ? undefined : "text.disabled" }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}
