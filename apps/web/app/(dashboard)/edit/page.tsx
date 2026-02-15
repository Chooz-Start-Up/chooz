"use client";

import { useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useMenuStore } from "@/stores/menuStore";
import { MenuSidebar } from "@/components/menu/MenuSidebar";
import { CategoryList } from "@/components/menu/CategoryList";

export default function MenuEditPage() {
  const { firebaseUser } = useAuthStore();
  const { restaurant, fetchRestaurantForOwner } = useRestaurantStore();
  const {
    menus,
    categories,
    items,
    selectedMenuId,
    loading,
    fetchMenus,
    createMenu,
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
  } = useMenuStore();

  const restaurantId = restaurant?.id ?? null;
  const selectedMenu = menus.find((m) => m.id === selectedMenuId) ?? null;
  const currentCategories = selectedMenuId ? (categories[selectedMenuId] ?? []) : [];

  // Load restaurant
  useEffect(() => {
    if (firebaseUser && !restaurant) {
      fetchRestaurantForOwner(firebaseUser.uid);
    }
  }, [firebaseUser, restaurant, fetchRestaurantForOwner]);

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

  if (!restaurant || loading) {
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
          onSelect={selectMenu}
          onAdd={(name) => createMenu(restaurant.id, name)}
          onRename={(menuId, name) => renameMenu(restaurant.id, menuId, name)}
          onDelete={(menuId) => deleteMenu(restaurant.id, menuId)}
          onUpdateSettings={(menuId, data) => updateMenuSettings(restaurant.id, menuId, data)}
          getCascadeInfo={getCascadeInfo}
        />

        {/* Right content area */}
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
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
                categories={currentCategories}
                items={items}
                onAddCategory={(name) => createCategory(restaurant.id, selectedMenuId!, name)}
                onRenameCategory={(catId, name) =>
                  renameCategory(restaurant.id, selectedMenuId!, catId, name)
                }
                onUpdateCategory={(catId, data) =>
                  updateCategory(restaurant.id, selectedMenuId!, catId, data)
                }
                onDeleteCategory={(catId) => deleteCategory(restaurant.id, selectedMenuId!, catId)}
                onCreateItem={(catId, data) =>
                  createItem(restaurant.id, selectedMenuId!, catId, data)
                }
                onUpdateItem={(catId, itemId, data) =>
                  updateItem(restaurant.id, selectedMenuId!, catId, itemId, data)
                }
                onDeleteItem={(catId, itemId) =>
                  deleteItem(restaurant.id, selectedMenuId!, catId, itemId)
                }
              />
            </>
          )}
        </Box>
      </Box>
    </DragDropContext>
  );
}
