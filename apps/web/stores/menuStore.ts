import { create } from "zustand";
import type { Menu, Category, Item } from "@chooz/shared";
import { menuService, categoryService, itemService, storageService, toAppError } from "@chooz/services";

interface PendingOp {
  key: string;
  execute: () => Promise<void>;
}

interface MenuState {
  menus: Menu[];
  categories: Record<string, Category[]>; // keyed by menuId
  items: Record<string, Item[]>; // keyed by categoryId
  selectedMenuId: string | null;
  loading: boolean;
  pendingOps: PendingOp[];
  hasPendingChanges: boolean;
  saving: boolean;

  // Commit / discard
  commitPendingChanges: () => Promise<void>;
  discardPendingChanges: (restaurantId: string) => Promise<void>;

  // Menu CRUD
  fetchMenus: (restaurantId: string) => Promise<void>;
  createMenu: (restaurantId: string, name: string) => Promise<void>;
  duplicateMenu: (restaurantId: string, menuId: string) => Promise<void>;
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

export const useMenuStore = create<MenuState>((set, get) => {
  // Deduplicating enqueue: replacing any existing op with the same key
  const enqueue = (key: string, execute: () => Promise<void>) =>
    set((s) => ({
      pendingOps: [...s.pendingOps.filter((op) => op.key !== key), { key, execute }],
      hasPendingChanges: true,
    }));

  return {
    menus: [],
    categories: {},
    items: {},
    selectedMenuId: null,
    loading: false,
    pendingOps: [],
    hasPendingChanges: false,
    saving: false,

    // ---------- Commit / Discard ----------

    commitPendingChanges: async () => {
      const ops = get().pendingOps;
      set({ saving: true });
      try {
        for (const op of ops) await op.execute(); // sequential to avoid races
        set({ pendingOps: [], hasPendingChanges: false, saving: false });
      } catch (error) {
        set({ saving: false });
        throw toAppError(error);
      }
    },

    discardPendingChanges: async (restaurantId) => {
      const { selectedMenuId } = get();
      set({ pendingOps: [], hasPendingChanges: false, categories: {}, items: {} });
      await get().fetchMenus(restaurantId);
      if (selectedMenuId) await get().fetchCategories(restaurantId, selectedMenuId);
    },

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
      const fakeTs = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
      const newMenu: Menu = {
        id,
        name,
        sortOrder,
        isActive: true,
        availableFrom: null,
        availableTo: null,
        availableDays: null,
        createdAt: fakeTs,
        updatedAt: fakeTs,
      };
      set((s) => ({ menus: [...s.menus, newMenu], selectedMenuId: id }));
      enqueue(`menu:create:${id}`, () =>
        menuService.createMenu(restaurantId, id, {
          name,
          sortOrder,
          isActive: true,
          availableFrom: null,
          availableTo: null,
          availableDays: null,
        }),
      );
    },

    duplicateMenu: async (restaurantId, menuId) => {
      const sourceMenu = get().menus.find((m) => m.id === menuId);
      if (!sourceMenu) return;

      // Pre-generate all IDs so local state and the Firestore thunk use the same values
      const newMenuId = menuService.generateMenuId(restaurantId);
      const sourceCats = get().categories[menuId] ?? [];

      const catIdMap: Record<string, string> = {};
      for (const cat of sourceCats) {
        catIdMap[cat.id] = categoryService.generateCategoryId(restaurantId, newMenuId);
      }

      const fakeTs = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };

      const newMenuObj: Menu = {
        id: newMenuId,
        name: `${sourceMenu.name} (Copy)`,
        sortOrder: get().menus.length,
        isActive: sourceMenu.isActive,
        availableFrom: sourceMenu.availableFrom,
        availableTo: sourceMenu.availableTo,
        availableDays: sourceMenu.availableDays,
        createdAt: fakeTs,
        updatedAt: fakeTs,
      };

      const newCats: Category[] = sourceCats.map((cat) => ({
        ...cat,
        id: catIdMap[cat.id],
        createdAt: fakeTs,
        updatedAt: fakeTs,
      }));

      const newItemsByCatId: Record<string, Item[]> = {};
      for (const cat of sourceCats) {
        const newCatId = catIdMap[cat.id];
        const sourceItems = get().items[cat.id] ?? [];
        newItemsByCatId[newCatId] = sourceItems.map((item) => ({
          ...item,
          id: itemService.generateItemId(restaurantId, newMenuId, newCatId),
          createdAt: fakeTs,
          updatedAt: fakeTs,
        }));
      }

      // Update local state immediately
      set((s) => ({
        menus: [...s.menus, newMenuObj],
        selectedMenuId: newMenuId,
        categories: { ...s.categories, [newMenuId]: newCats },
        items: { ...s.items, ...newItemsByCatId },
      }));

      // Enqueue the full cascade as a single staged op
      enqueue(`menu:create:${newMenuId}`, async () => {
        await menuService.createMenu(restaurantId, newMenuId, {
          name: newMenuObj.name,
          sortOrder: newMenuObj.sortOrder,
          isActive: newMenuObj.isActive,
          availableFrom: newMenuObj.availableFrom,
          availableTo: newMenuObj.availableTo,
          availableDays: newMenuObj.availableDays,
        });
        for (const cat of newCats) {
          await categoryService.createCategory(restaurantId, newMenuId, cat.id, {
            name: cat.name,
            description: cat.description,
            isVisible: cat.isVisible,
            sortOrder: cat.sortOrder,
          });
          for (const item of newItemsByCatId[cat.id] ?? []) {
            await itemService.createItem(restaurantId, newMenuId, cat.id, item.id, {
              name: item.name,
              description: item.description,
              price: item.price,
              ingredients: [...item.ingredients],
              tags: [...item.tags],
              imageUrl: item.imageUrl,
              isAvailable: item.isAvailable,
              sortOrder: item.sortOrder,
            });
          }
        }
      });
    },

    renameMenu: async (restaurantId, menuId, name) => {
      set((s) => ({
        menus: s.menus.map((m) => (m.id === menuId ? { ...m, name } : m)),
      }));
      enqueue(`menu:rename:${menuId}`, () =>
        menuService.updateMenu(restaurantId, menuId, { name }),
      );
    },

    updateMenuSettings: async (restaurantId, menuId, data) => {
      const current = get().menus.find((m) => m.id === menuId);
      if (current) {
        const keys = Object.keys(data) as Array<keyof Partial<Menu>>;
        const hasChange = keys.some((k) => data[k] !== current[k]);
        if (!hasChange) return;
      }
      set((s) => ({
        menus: s.menus.map((m) => (m.id === menuId ? { ...m, ...data } : m)),
      }));
      const { id: _, createdAt: __, updatedAt: ___, ...cleanData } = data;
      enqueue(`menu:settings:${menuId}`, () =>
        menuService.updateMenu(restaurantId, menuId, cleanData),
      );
    },

    deleteMenu: async (restaurantId, menuId) => {
      const { categories, items } = get();
      const cats = categories[menuId] ?? [];

      // Capture snapshots for closure before mutating state
      const catsSnapshot = [...cats];
      const itemsSnapshot: Record<string, Item[]> = {};
      for (const cat of cats) {
        itemsSnapshot[cat.id] = [...(items[cat.id] ?? [])];
      }

      // Update local state
      const newCategories = { ...categories };
      const newItems = { ...items };
      for (const cat of cats) {
        delete newItems[cat.id];
      }
      delete newCategories[menuId];
      const menus = get().menus.filter((m) => m.id !== menuId);
      const selectedMenuId =
        get().selectedMenuId === menuId ? (menus[0]?.id ?? null) : get().selectedMenuId;
      set({ menus, categories: newCategories, items: newItems, selectedMenuId });

      // Local-only optimization: if menu was never committed, just clean up pending ops
      const createKey = `menu:create:${menuId}`;
      if (get().pendingOps.some((op) => op.key === createKey)) {
        const catIds = cats.map((c) => c.id);
        const itemIds = cats.flatMap((cat) => (items[cat.id] ?? []).map((it) => it.id));
        set((s) => {
          const newOps = s.pendingOps.filter((op) => {
            if (op.key === createKey) return false;
            if (op.key === `menu:rename:${menuId}`) return false;
            if (op.key === `menu:settings:${menuId}`) return false;
            for (const cId of catIds) {
              if (op.key === `cat:create:${cId}`) return false;
              if (op.key === `cat:rename:${menuId}:${cId}`) return false;
              if (op.key === `cat:update:${menuId}:${cId}`) return false;
            }
            for (const itId of itemIds) {
              for (const cId of catIds) {
                if (op.key === `item:create:${itId}`) return false;
                if (op.key === `item:update:${cId}:${itId}`) return false;
              }
            }
            return true;
          });
          return { pendingOps: newOps, hasPendingChanges: newOps.length > 0 };
        });
        return;
      }

      enqueue(`menu:delete:${menuId}`, async () => {
        for (const cat of catsSnapshot) {
          const catItems = itemsSnapshot[cat.id] ?? [];
          for (const item of catItems) {
            if (item.imageUrl) {
              try {
                await storageService.deleteImageByUrl(item.imageUrl);
              } catch { /* best-effort */ }
            }
            await itemService.deleteItem(restaurantId, menuId, cat.id, item.id);
          }
          await categoryService.deleteCategory(restaurantId, menuId, cat.id);
        }
        await menuService.deleteMenu(restaurantId, menuId);
      });
    },

    reorderMenus: async (restaurantId, orderedIds) => {
      const prev = get().menus;
      const reordered = orderedIds
        .map((id, i) => {
          const menu = prev.find((m) => m.id === id);
          return menu ? { ...menu, sortOrder: i } : null;
        })
        .filter((m): m is Menu => m !== null);
      set({ menus: reordered });
      enqueue(`menu:reorder`, async () => {
        await Promise.all(
          reordered.map((m) => menuService.updateMenu(restaurantId, m.id, { sortOrder: m.sortOrder })),
        );
      });
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
      const fakeTs = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
      const newCat: Category = {
        id,
        name,
        description: "",
        isVisible: true,
        sortOrder: existing.length,
        createdAt: fakeTs,
        updatedAt: fakeTs,
      };
      set((s) => ({
        categories: {
          ...s.categories,
          [menuId]: [...(s.categories[menuId] ?? []), newCat],
        },
      }));
      enqueue(`cat:create:${id}`, () =>
        categoryService.createCategory(restaurantId, menuId, id, {
          name,
          description: "",
          isVisible: true,
          sortOrder: existing.length,
        }),
      );
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
      enqueue(`cat:rename:${menuId}:${catId}`, () =>
        categoryService.updateCategory(restaurantId, menuId, catId, { name }),
      );
    },

    updateCategory: async (restaurantId, menuId, catId, data) => {
      const current = (get().categories[menuId] ?? []).find((c) => c.id === catId);
      if (current) {
        const { id: _, createdAt: __, updatedAt: ___, ...rest } = data;
        const keys = Object.keys(rest) as Array<keyof typeof rest>;
        const hasChange = keys.some((k) => rest[k] !== current[k as keyof Category]);
        if (!hasChange) return;
      }
      set((s) => ({
        categories: {
          ...s.categories,
          [menuId]: (s.categories[menuId] ?? []).map((c) =>
            c.id === catId ? { ...c, ...data } : c,
          ),
        },
      }));
      const { id: _, createdAt: __, updatedAt: ___, ...cleanData } = data;
      enqueue(`cat:update:${menuId}:${catId}`, () =>
        categoryService.updateCategory(restaurantId, menuId, catId, cleanData),
      );
    },

    deleteCategory: async (restaurantId, menuId, catId) => {
      // Capture items before mutating state
      const catItems = get().items[catId] ?? [];
      const catItemsSnapshot = [...catItems];
      const catItemIds = catItems.map((it) => it.id);

      // Update local state
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

      // Local-only optimization: if category was never committed, just clean up pending ops
      const createKey = `cat:create:${catId}`;
      if (get().pendingOps.some((op) => op.key === createKey)) {
        set((s) => {
          const newOps = s.pendingOps.filter((op) => {
            if (op.key === createKey) return false;
            if (op.key === `cat:rename:${menuId}:${catId}`) return false;
            if (op.key === `cat:update:${menuId}:${catId}`) return false;
            for (const itemId of catItemIds) {
              if (op.key === `item:create:${itemId}`) return false;
              if (op.key === `item:update:${catId}:${itemId}`) return false;
              if (op.key === `item:delete:${catId}:${itemId}`) return false;
            }
            return true;
          });
          return { pendingOps: newOps, hasPendingChanges: newOps.length > 0 };
        });
        return;
      }

      enqueue(`cat:delete:${menuId}:${catId}`, async () => {
        for (const item of catItemsSnapshot) {
          if (item.imageUrl) {
            try {
              await storageService.deleteImageByUrl(item.imageUrl);
            } catch { /* best-effort */ }
          }
          await itemService.deleteItem(restaurantId, menuId, catId, item.id);
        }
        await categoryService.deleteCategory(restaurantId, menuId, catId);
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
      enqueue(`cat:reorder:${menuId}`, async () => {
        await Promise.all(
          reordered.map((c) =>
            categoryService.updateCategory(restaurantId, menuId, c.id, { sortOrder: c.sortOrder }),
          ),
        );
      });
    },

    // ---------- Item CRUD ----------

    fetchItems: async (restaurantId, menuId, categoryId) => {
      const items = await itemService.getItems(restaurantId, menuId, categoryId);
      set((s) => ({ items: { ...s.items, [categoryId]: items } }));
    },

    createItem: async (restaurantId, menuId, catId, data) => {
      const id = itemService.generateItemId(restaurantId, menuId, catId);
      const fakeTs = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
      const newItem: Item = { id, ...data, createdAt: fakeTs, updatedAt: fakeTs };
      set((s) => ({
        items: {
          ...s.items,
          [catId]: [...(s.items[catId] ?? []), newItem],
        },
      }));
      enqueue(`item:create:${id}`, () =>
        itemService.createItem(restaurantId, menuId, catId, id, data),
      );
    },

    updateItem: async (restaurantId, menuId, catId, itemId, data) => {
      const current = (get().items[catId] ?? []).find((it) => it.id === itemId);
      if (current) {
        const { id: _, createdAt: __, updatedAt: ___, ...rest } = data;
        const keys = Object.keys(rest) as Array<keyof typeof rest>;
        const hasChange = keys.some((k) => {
          const newVal = rest[k];
          const curVal = current[k as keyof Item];
          if (Array.isArray(newVal) && Array.isArray(curVal)) {
            return JSON.stringify(newVal) !== JSON.stringify(curVal);
          }
          return newVal !== curVal;
        });
        if (!hasChange) return;
      }
      set((s) => ({
        items: {
          ...s.items,
          [catId]: (s.items[catId] ?? []).map((it) =>
            it.id === itemId ? { ...it, ...data } : it,
          ),
        },
      }));
      const { id: _, createdAt: __, updatedAt: ___, ...rest } = data;
      enqueue(`item:update:${catId}:${itemId}`, () =>
        itemService.updateItem(restaurantId, menuId, catId, itemId, rest),
      );
    },

    deleteItem: async (restaurantId, menuId, catId, itemId) => {
      // Capture imageUrl before mutating state
      const targetItem = (get().items[catId] ?? []).find((i) => i.id === itemId);
      const imageUrl = targetItem?.imageUrl ?? null;

      // Update local state
      set((s) => ({
        items: {
          ...s.items,
          [catId]: (s.items[catId] ?? []).filter((i) => i.id !== itemId),
        },
      }));

      // Local-only optimization: if item was never committed, just clean up pending ops
      const createKey = `item:create:${itemId}`;
      if (get().pendingOps.some((op) => op.key === createKey)) {
        set((s) => {
          const newOps = s.pendingOps.filter(
            (op) => op.key !== createKey && op.key !== `item:update:${catId}:${itemId}`,
          );
          return { pendingOps: newOps, hasPendingChanges: newOps.length > 0 };
        });
        return;
      }

      enqueue(`item:delete:${catId}:${itemId}`, async () => {
        if (imageUrl) {
          try {
            await storageService.deleteImageByUrl(imageUrl);
          } catch { /* best-effort */ }
        }
        await itemService.deleteItem(restaurantId, menuId, catId, itemId);
      });
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
      enqueue(`item:reorder:${catId}`, async () => {
        await Promise.all(
          reordered.map((it) =>
            itemService.updateItem(restaurantId, menuId, catId, it.id, { sortOrder: it.sortOrder }),
          ),
        );
      });
    },

    clearAll: () =>
      set({
        menus: [],
        categories: {},
        items: {},
        selectedMenuId: null,
        loading: false,
        pendingOps: [],
        hasPendingChanges: false,
        saving: false,
      }),
  };
});
