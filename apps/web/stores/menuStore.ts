import { create } from "zustand";
import type { Menu, Category, Item } from "@chooz/shared";
import { menuService, categoryService, itemService } from "@chooz/services";

interface MenuState {
  menus: Menu[];
  categories: Record<string, Category[]>; // keyed by menuId
  items: Record<string, Item[]>; // keyed by categoryId
  selectedMenuId: string | null;
  loading: boolean;

  // Menu CRUD
  fetchMenus: (restaurantId: string) => Promise<void>;
  createMenu: (restaurantId: string, name: string) => Promise<void>;
  renameMenu: (restaurantId: string, menuId: string, name: string) => Promise<void>;
  updateMenuSettings: (restaurantId: string, menuId: string, data: Partial<Menu>) => Promise<void>;
  deleteMenu: (restaurantId: string, menuId: string) => Promise<void>;
  reorderMenus: (restaurantId: string, orderedIds: string[]) => Promise<void>;
  selectMenu: (menuId: string | null) => void;

  // Category CRUD
  fetchCategories: (restaurantId: string, menuId: string) => Promise<void>;
  createCategory: (restaurantId: string, menuId: string, name: string) => Promise<void>;
  renameCategory: (restaurantId: string, menuId: string, catId: string, name: string) => Promise<void>;
  updateCategory: (restaurantId: string, menuId: string, catId: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (restaurantId: string, menuId: string, catId: string) => Promise<void>;
  reorderCategories: (restaurantId: string, menuId: string, orderedIds: string[]) => Promise<void>;

  // Item CRUD
  fetchItems: (restaurantId: string, menuId: string, categoryId: string) => Promise<void>;
  createItem: (
    restaurantId: string,
    menuId: string,
    catId: string,
    data: Omit<Item, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateItem: (
    restaurantId: string,
    menuId: string,
    catId: string,
    itemId: string,
    data: Partial<Item>,
  ) => Promise<void>;
  deleteItem: (restaurantId: string, menuId: string, catId: string, itemId: string) => Promise<void>;
  reorderItems: (restaurantId: string, menuId: string, catId: string, orderedIds: string[]) => Promise<void>;

  clearAll: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: [],
  categories: {},
  items: {},
  selectedMenuId: null,
  loading: false,

  // ---------- Menu CRUD ----------

  fetchMenus: async (restaurantId) => {
    set({ loading: true });
    try {
      const menus = await menuService.getMenus(restaurantId);
      set({ menus });
    } finally {
      set({ loading: false });
    }
  },

  createMenu: async (restaurantId, name) => {
    const id = menuService.generateMenuId(restaurantId);
    const sortOrder = get().menus.length;
    await menuService.createMenu(restaurantId, id, {
      name,
      sortOrder,
      isActive: true,
      availableFrom: null,
      availableTo: null,
      availableDays: null,
    });
    const menus = await menuService.getMenus(restaurantId);
    set({ menus, selectedMenuId: id });
  },

  renameMenu: async (restaurantId, menuId, name) => {
    // Optimistic update
    set((s) => ({
      menus: s.menus.map((m) => (m.id === menuId ? { ...m, name } : m)),
    }));
    try {
      await menuService.updateMenu(restaurantId, menuId, { name });
    } catch (error) {
      // Rollback
      const menus = await menuService.getMenus(restaurantId);
      set({ menus });
      throw error;
    }
  },

  updateMenuSettings: async (restaurantId, menuId, data) => {
    // Optimistic update
    set((s) => ({
      menus: s.menus.map((m) => (m.id === menuId ? { ...m, ...data } : m)),
    }));
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...rest } = data;
      await menuService.updateMenu(restaurantId, menuId, rest);
    } catch (error) {
      const menus = await menuService.getMenus(restaurantId);
      set({ menus });
      throw error;
    }
  },

  deleteMenu: async (restaurantId, menuId) => {
    const { categories, items } = get();
    const cats = categories[menuId] ?? [];

    // Delete all items in each category, then categories, then the menu
    for (const cat of cats) {
      const catItems = items[cat.id] ?? [];
      for (const item of catItems) {
        await itemService.deleteItem(restaurantId, menuId, cat.id, item.id);
      }
      await categoryService.deleteCategory(restaurantId, menuId, cat.id);
    }
    await menuService.deleteMenu(restaurantId, menuId);

    // Clean up local state
    const newCategories = { ...categories };
    const newItems = { ...items };
    for (const cat of cats) {
      delete newItems[cat.id];
    }
    delete newCategories[menuId];

    const menus = get().menus.filter((m) => m.id !== menuId);
    const selectedMenuId = get().selectedMenuId === menuId ? (menus[0]?.id ?? null) : get().selectedMenuId;
    set({ menus, categories: newCategories, items: newItems, selectedMenuId });
  },

  reorderMenus: async (restaurantId, orderedIds) => {
    const prev = get().menus;
    // Optimistic: reorder locally
    const reordered = orderedIds
      .map((id, i) => {
        const menu = prev.find((m) => m.id === id);
        return menu ? { ...menu, sortOrder: i } : null;
      })
      .filter((m): m is Menu => m !== null);
    set({ menus: reordered });

    try {
      await Promise.all(
        reordered.map((m) => menuService.updateMenu(restaurantId, m.id, { sortOrder: m.sortOrder })),
      );
    } catch {
      // Rollback
      const menus = await menuService.getMenus(restaurantId);
      set({ menus });
    }
  },

  selectMenu: (menuId) => set({ selectedMenuId: menuId }),

  // ---------- Category CRUD ----------

  fetchCategories: async (restaurantId, menuId) => {
    const cats = await categoryService.getCategories(restaurantId, menuId);
    set((s) => ({ categories: { ...s.categories, [menuId]: cats } }));
  },

  createCategory: async (restaurantId, menuId, name) => {
    const id = categoryService.generateCategoryId(restaurantId, menuId);
    const existing = get().categories[menuId] ?? [];
    await categoryService.createCategory(restaurantId, menuId, id, {
      name,
      description: "",
      isVisible: true,
      sortOrder: existing.length,
    });
    const cats = await categoryService.getCategories(restaurantId, menuId);
    set((s) => ({ categories: { ...s.categories, [menuId]: cats } }));
  },

  renameCategory: async (restaurantId, menuId, catId, name) => {
    set((s) => ({
      categories: {
        ...s.categories,
        [menuId]: (s.categories[menuId] ?? []).map((c) =>
          c.id === catId ? { ...c, name } : c,
        ),
      },
    }));
    try {
      await categoryService.updateCategory(restaurantId, menuId, catId, { name });
    } catch (error) {
      const cats = await categoryService.getCategories(restaurantId, menuId);
      set((s) => ({ categories: { ...s.categories, [menuId]: cats } }));
      throw error;
    }
  },

  updateCategory: async (restaurantId, menuId, catId, data) => {
    set((s) => ({
      categories: {
        ...s.categories,
        [menuId]: (s.categories[menuId] ?? []).map((c) =>
          c.id === catId ? { ...c, ...data } : c,
        ),
      },
    }));
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...rest } = data;
      await categoryService.updateCategory(restaurantId, menuId, catId, rest);
    } catch (error) {
      const cats = await categoryService.getCategories(restaurantId, menuId);
      set((s) => ({ categories: { ...s.categories, [menuId]: cats } }));
      throw error;
    }
  },

  deleteCategory: async (restaurantId, menuId, catId) => {
    const catItems = get().items[catId] ?? [];
    for (const item of catItems) {
      await itemService.deleteItem(restaurantId, menuId, catId, item.id);
    }
    await categoryService.deleteCategory(restaurantId, menuId, catId);

    set((s) => {
      const newItems = { ...s.items };
      delete newItems[catId];
      return {
        categories: {
          ...s.categories,
          [menuId]: (s.categories[menuId] ?? []).filter((c) => c.id !== catId),
        },
        items: newItems,
      };
    });
  },

  reorderCategories: async (restaurantId, menuId, orderedIds) => {
    const prev = get().categories[menuId] ?? [];
    const reordered = orderedIds
      .map((id, i) => {
        const cat = prev.find((c) => c.id === id);
        return cat ? { ...cat, sortOrder: i } : null;
      })
      .filter((c): c is Category => c !== null);
    set((s) => ({ categories: { ...s.categories, [menuId]: reordered } }));

    try {
      await Promise.all(
        reordered.map((c) =>
          categoryService.updateCategory(restaurantId, menuId, c.id, { sortOrder: c.sortOrder }),
        ),
      );
    } catch {
      const cats = await categoryService.getCategories(restaurantId, menuId);
      set((s) => ({ categories: { ...s.categories, [menuId]: cats } }));
    }
  },

  // ---------- Item CRUD ----------

  fetchItems: async (restaurantId, menuId, categoryId) => {
    const items = await itemService.getItems(restaurantId, menuId, categoryId);
    set((s) => ({ items: { ...s.items, [categoryId]: items } }));
  },

  createItem: async (restaurantId, menuId, catId, data) => {
    const id = itemService.generateItemId(restaurantId, menuId, catId);
    await itemService.createItem(restaurantId, menuId, catId, id, data);
    const items = await itemService.getItems(restaurantId, menuId, catId);
    set((s) => ({ items: { ...s.items, [catId]: items } }));
  },

  updateItem: async (restaurantId, menuId, catId, itemId, data) => {
    const { id: _, createdAt: __, updatedAt: ___, ...rest } = data;
    await itemService.updateItem(restaurantId, menuId, catId, itemId, rest);
    const items = await itemService.getItems(restaurantId, menuId, catId);
    set((s) => ({ items: { ...s.items, [catId]: items } }));
  },

  deleteItem: async (restaurantId, menuId, catId, itemId) => {
    await itemService.deleteItem(restaurantId, menuId, catId, itemId);
    set((s) => ({
      items: {
        ...s.items,
        [catId]: (s.items[catId] ?? []).filter((i) => i.id !== itemId),
      },
    }));
  },

  reorderItems: async (restaurantId, menuId, catId, orderedIds) => {
    const prev = get().items[catId] ?? [];
    const reordered = orderedIds
      .map((id, i) => {
        const item = prev.find((it) => it.id === id);
        return item ? { ...item, sortOrder: i } : null;
      })
      .filter((it): it is Item => it !== null);
    set((s) => ({ items: { ...s.items, [catId]: reordered } }));

    try {
      await Promise.all(
        reordered.map((it) =>
          itemService.updateItem(restaurantId, menuId, catId, it.id, { sortOrder: it.sortOrder }),
        ),
      );
    } catch {
      const items = await itemService.getItems(restaurantId, menuId, catId);
      set((s) => ({ items: { ...s.items, [catId]: items } }));
    }
  },

  clearAll: () =>
    set({ menus: [], categories: {}, items: {}, selectedMenuId: null, loading: false }),
}));
