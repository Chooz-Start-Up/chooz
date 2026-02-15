"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import type { Menu } from "@chooz/shared";
import { InlineEdit } from "./InlineEdit";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { MenuSettingsPanel } from "./MenuSettingsPanel";

interface MenuSidebarProps {
  menus: Menu[];
  selectedMenuId: string | null;
  onSelect: (menuId: string) => void;
  onAdd: (name: string) => Promise<void>;
  onRename: (menuId: string, name: string) => Promise<void>;
  onDelete: (menuId: string) => Promise<void>;
  onUpdateSettings: (menuId: string, data: Partial<Menu>) => Promise<void>;
  getCascadeInfo: (menuId: string) => { categories: { name: string; itemCount: number }[]; totalItems: number };
}

export function MenuSidebar({
  menus,
  selectedMenuId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onUpdateSettings,
  getCascadeInfo,
}: MenuSidebarProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [settingsMenuId, setSettingsMenuId] = useState<string | null>(null);

  const settingsMenu = settingsMenuId ? menus.find((m) => m.id === settingsMenuId) ?? null : null;

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    await onAdd(name);
    setNewName("");
    setAdding(false);
  };

  const handleOpenSettings = (e: React.MouseEvent<HTMLElement>, menuId: string) => {
    e.stopPropagation();
    setSettingsAnchor(e.currentTarget);
    setSettingsMenuId(menuId);
  };

  const handleCloseSettings = () => {
    setSettingsAnchor(null);
    setSettingsMenuId(null);
  };

  const cascadeInfo = deleteTarget ? getCascadeInfo(deleteTarget.id) : { categories: [], totalItems: 0 };
  const cascadeText = deleteTarget
    ? `This will delete "${deleteTarget.name}"${
        cascadeInfo.categories.length > 0
          ? ` and all ${cascadeInfo.categories.length} ${cascadeInfo.categories.length === 1 ? "category" : "categories"} and ${cascadeInfo.totalItems} ${cascadeInfo.totalItems === 1 ? "item" : "items"} within it`
          : ""
      }.\n\n${cascadeInfo.categories.map((c) => `\u2022 ${c.name} (${c.itemCount} ${c.itemCount === 1 ? "item" : "items"})`).join("\n")}`
    : "";

  return (
    <Box
      sx={{
        width: 280,
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Menus
        </Typography>
      </Box>

      <Droppable droppableId="menus" type="MENU">
        {(provided) => (
          <List
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ flex: 1, overflow: "auto", py: 0 }}
          >
            {menus.map((menu, index) => (
              <Draggable key={menu.id} draggableId={menu.id} index={index}>
                {(dragProvided, snapshot) => (
                  <ListItemButton
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    selected={menu.id === selectedMenuId}
                    onClick={() => onSelect(menu.id)}
                    sx={{
                      opacity: snapshot.isDragging ? 0.8 : 1,
                      bgcolor: snapshot.isDragging ? "action.hover" : undefined,
                    }}
                  >
                    <ListItemIcon
                      {...dragProvided.dragHandleProps}
                      sx={{ minWidth: 32 }}
                    >
                      <DragIndicatorIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={menu.name}
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: { opacity: menu.isActive ? 1 : 0.5 },
                      }}
                    />
                    {!menu.isActive && (
                      <VisibilityOffIcon
                        fontSize="small"
                        sx={{ color: "text.disabled", mr: 0.5 }}
                      />
                    )}
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={(e) => handleOpenSettings(e, menu.id)}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>

      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        {adding ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              autoFocus
              size="small"
              placeholder="e.g. Lunch, Dinner, Drinks"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="contained" size="small" onClick={handleAdd} disabled={!newName.trim()}>
              Add
            </Button>
          </Box>
        ) : (
          <Button fullWidth startIcon={<AddIcon />} onClick={() => setAdding(true)}>
            Add Menu
          </Button>
        )}
      </Box>

      {/* Delete menu dialog */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete Menu"
        description={cascadeText}
        confirmText={deleteTarget?.name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => (deleteTarget ? onDelete(deleteTarget.id) : Promise.resolve())}
      />

      {/* Settings popover with rename, settings, and delete */}
      <Popover
        open={!!settingsAnchor}
        anchorEl={settingsAnchor}
        onClose={handleCloseSettings}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {settingsMenu && (
          <Box sx={{ minWidth: 320 }}>
            {/* Rename section */}
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Menu Name
              </Typography>
              <InlineEdit
                value={settingsMenu.name}
                onSave={(name) => onRename(settingsMenu.id, name)}
                variant="body1"
              />
            </Box>

            <Divider />

            {/* Settings section */}
            <MenuSettingsPanel
              menu={settingsMenu}
              onUpdate={(data) => onUpdateSettings(settingsMenu.id, data)}
            />

            <Divider />

            {/* Delete section */}
            <Box sx={{ p: 2 }}>
              <Button
                color="error"
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  handleCloseSettings();
                  setDeleteTarget(settingsMenu);
                }}
              >
                Delete Menu
              </Button>
            </Box>
          </Box>
        )}
      </Popover>
    </Box>
  );
}
