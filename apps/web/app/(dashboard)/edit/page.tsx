"use client";

import React from "react";
import type { SlideProps } from "@mui/material/Slide";
import { useEffect, useCallback, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { AppError } from "@chooz/services";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useMenuStore } from "@/stores/menuStore";
import { MenuSidebar } from "@/components/menu/MenuSidebar";
import { CategoryList } from "@/components/menu/CategoryList";
import { MenuContent } from "@/components/public/MenuContent";
import { MenuTabs } from "@/components/public/MenuTabs";

const SlideUp = React.forwardRef<HTMLElement, SlideProps>((props, ref) => (
  <Slide {...props} direction="up" ref={ref} />
));
SlideUp.displayName = "SlideUp";

export default function MenuEditPage() {
  const { firebaseUser } = useAuthStore();
  const { restaurants, selectedRestaurantId, fetchRestaurantForOwner } = useRestaurantStore();
  const {
    menus,
    categories,
    items,
    selectedMenuId,
    loading,
    hasPendingChanges,
    fetchMenus,
    createMenu,
    duplicateMenu,
    renameMenu,
    updateMenuSettings,
    deleteMenu,
    reorderMenus,
    selectMenu,
    fetchCategories,
    createCategory,
    renameCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    commitPendingChanges,
    discardPendingChanges,
  } = useMenuStore();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMenuId, setPreviewMenuId] = useState<string | null>(null);

  const handleOpenPreview = () => {
    setPreviewMenuId(selectedMenuId);
    setPreviewOpen(true);
  };

  const restaurantId = selectedRestaurantId;
  const selectedMenu = menus.find((m) => m.id === selectedMenuId) ?? null;
  const currentCategories = selectedMenuId ? (categories[selectedMenuId] ?? []) : [];

  // Load restaurant
  useEffect(() => {
    if (firebaseUser && restaurants.length === 0) {
      fetchRestaurantForOwner(firebaseUser.uid);
    }
  }, [firebaseUser, restaurants.length, fetchRestaurantForOwner]);

  // Load menus when restaurant is available
  useEffect(() => {
    if (restaurantId) {
      fetchMenus(restaurantId);
    }
  }, [restaurantId, fetchMenus]);

  // Auto-select first menu
  useEffect(() => {
    if (menus.length > 0 && !selectedMenuId) {
      selectMenu(menus[0].id);
    }
  }, [menus, selectedMenuId, selectMenu]);

  // Load categories when menu is selected
  useEffect(() => {
    if (restaurantId && selectedMenuId && !categories[selectedMenuId]) {
      fetchCategories(restaurantId, selectedMenuId);
    }
  }, [restaurantId, selectedMenuId, categories, fetchCategories]);

  // Load items for each category
  useEffect(() => {
    if (!restaurantId || !selectedMenuId) return;
    const cats = categories[selectedMenuId] ?? [];
    for (const cat of cats) {
      if (!items[cat.id]) {
        fetchItems(restaurantId, selectedMenuId, cat.id);
      }
    }
  }, [restaurantId, selectedMenuId, categories, items, fetchItems]);

  const getCascadeInfo = useCallback(
    (menuId: string) => {
      const cats = categories[menuId] ?? [];
      let totalItems = 0;
      const categoryDetails = cats.map((cat) => {
        const count = (items[cat.id] ?? []).length;
        totalItems += count;
        return { name: cat.name, itemCount: count };
      });
      return { categories: categoryDetails, totalItems };
    },
    [categories, items],
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!restaurantId || !result.destination) return;
      const { source, destination, type } = result;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      if (type === "MENU") {
        const ids = menus.map((m) => m.id);
        const [moved] = ids.splice(source.index, 1);
        ids.splice(destination.index, 0, moved);
        reorderMenus(restaurantId, ids);
      } else if (type === "CATEGORY" && selectedMenuId) {
        const cats = categories[selectedMenuId] ?? [];
        const ids = cats.map((c) => c.id);
        const [moved] = ids.splice(source.index, 1);
        ids.splice(destination.index, 0, moved);
        reorderCategories(restaurantId, selectedMenuId, ids);
      } else if (type === "ITEM") {
        if (source.droppableId !== destination.droppableId) return;
        const catId = source.droppableId.replace("items-", "");
        const catItems = items[catId] ?? [];
        const ids = catItems.map((it) => it.id);
        const [moved] = ids.splice(source.index, 1);
        ids.splice(destination.index, 0, moved);
        if (selectedMenuId) {
          reorderItems(restaurantId, selectedMenuId, catId, ids);
        }
      }
    },
    [restaurantId, selectedMenuId, menus, categories, items, reorderMenus, reorderCategories, reorderItems],
  );

  const handleUpdate = () => {
    setSaveError(null);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        commitPendingChanges(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      setConfirmOpen(false);
    } catch (e) {
      setSaveError(e instanceof AppError ? e.message : "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (restaurantId) await discardPendingChanges(restaurantId);
  };

  if (!restaurantId || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: "flex", height: "100vh", m: -4 }}>
        {/* Left sidebar: menu list */}
        <MenuSidebar
          menus={menus}
          selectedMenuId={selectedMenuId}
          onPreview={handleOpenPreview}
          onSelect={selectMenu}
          onAdd={(name) => createMenu(restaurantId!, name)}
          onDuplicate={(menuId) => duplicateMenu(restaurantId!, menuId)}
          onRename={(menuId, name) => renameMenu(restaurantId!, menuId, name)}
          onDelete={(menuId) => deleteMenu(restaurantId!, menuId)}
          onUpdateSettings={(menuId, data) => updateMenuSettings(restaurantId!, menuId, data)}
          getCascadeInfo={getCascadeInfo}
        />

        {/* Right content area */}
        <Box sx={{ flex: 1, overflow: "auto", p: 3, pb: hasPendingChanges ? 10 : 3 }}>
          {!selectedMenu ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "text.secondary",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {menus.length === 0
                  ? "Create a menu to get started"
                  : "Select a menu from the sidebar"}
              </Typography>
              <Typography variant="body2">
                {menus.length === 0
                  ? "Use the \"Add Menu\" button in the sidebar to create your first menu."
                  : "Click on a menu to view and edit its categories and items."}
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedMenu.name}
              </Typography>

              <CategoryList
                ownerUid={firebaseUser?.uid ?? ""}
                restaurantId={restaurantId!}
                categories={currentCategories}
                items={items}
                onAddCategory={(name) => createCategory(restaurantId!, selectedMenuId!, name)}
                onRenameCategory={(catId, name) =>
                  renameCategory(restaurantId!, selectedMenuId!, catId, name)
                }
                onUpdateCategory={(catId, data) =>
                  updateCategory(restaurantId!, selectedMenuId!, catId, data)
                }
                onDeleteCategory={(catId) => deleteCategory(restaurantId!, selectedMenuId!, catId)}
                onCreateItem={(catId, data) =>
                  createItem(restaurantId!, selectedMenuId!, catId, data)
                }
                onUpdateItem={(catId, itemId, data) =>
                  updateItem(restaurantId!, selectedMenuId!, catId, itemId, data)
                }
                onDeleteItem={(catId, itemId) =>
                  deleteItem(restaurantId!, selectedMenuId!, catId, itemId)
                }
              />
            </>
          )}
        </Box>
      </Box>

      {/* Sticky "Unsaved changes" bar */}
      <Slide direction="up" in={hasPendingChanges} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              maxWidth: 960,
              mx: "auto",
              px: 3,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Unsaved changes
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button onClick={handleDiscard} disabled={isSaving} sx={{ textTransform: "none" }}>
                Discard
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleOpenPreview}
                disabled={isSaving}
                sx={{ textTransform: "none" }}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={isSaving}
                sx={{ textTransform: "none" }}
              >
                Update
              </Button>
            </Box>
          </Box>
        </Paper>
      </Slide>

      {/* Full-width unsaved-changes banner — shown above the preview modal */}
      {previewOpen && hasPendingChanges && (
        <Box sx={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1302,
          bgcolor: "warning.dark", color: "white",
          display: "flex", alignItems: "center",
          px: 2, py: 1.5, gap: 1,
        }}>
          <VisibilityOffIcon fontSize="small" />
          <Typography variant="body2">
            Previewing unsaved changes — these won&apos;t be visible to customers until you click Update.
          </Typography>
        </Box>
      )}

      {/* Close button — just to the left of the phone frame, below banner if visible */}
      {previewOpen && (
        <IconButton
          onClick={() => setPreviewOpen(false)}
          aria-label="Close preview"
          sx={{
            position: "fixed",
            top: hasPendingChanges ? 56 : 16,
            left: "calc(50% - 195px - 48px)",
            zIndex: 1302,
            bgcolor: "rgba(0,0,0,0.45)", color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}

      {/* Preview Dialog — phone-proportioned window */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        TransitionComponent={SlideUp}
        PaperProps={{
          sx: {
            width: 390,
            height: "min(85vh, 760px)",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{
          flexShrink: 0,
          px: 2, py: 1.25, borderBottom: 1, borderColor: "divider",
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {restaurants.find((r) => r.id === restaurantId)?.name ?? "Preview"}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <MenuTabs
            menus={menus}
            selectedMenuId={previewMenuId}
            onChange={setPreviewMenuId}
          />
          <MenuContent
            menu={menus.find((m) => m.id === previewMenuId)}
            categories={previewMenuId ? (categories[previewMenuId] ?? []) : []}
            items={items}
            loading={false}
          />
        </Box>
      </Dialog>

      {/* Save confirm dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => !isSaving && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Save menu changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your changes will be saved and visible to customers.
          </DialogContentText>
          {saveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={isSaving}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={isSaving}
            sx={{ textTransform: "none" }}
          >
            {isSaving ? "Saving…" : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </DragDropContext>
  );
}
