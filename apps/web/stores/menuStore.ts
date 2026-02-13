import { create } from "zustand";
import type { Menu, Category, Item } from "@chooz/shared";

interface MenuState {
  menus: Menu[];
  categories: Record<string, Category[]>;
  items: Record<string, Item[]>;
  loading: boolean;
  setMenus: (menus: Menu[]) => void;
  setCategories: (menuId: string, categories: Category[]) => void;
  setItems: (categoryId: string, items: Item[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  categories: {},
  items: {},
  loading: false,
  setMenus: (menus) => set({ menus }),
  setCategories: (menuId, categories) =>
    set((state) => ({ categories: { ...state.categories, [menuId]: categories } })),
  setItems: (categoryId, items) =>
    set((state) => ({ items: { ...state.items, [categoryId]: items } })),
  setLoading: (loading) => set({ loading }),
}));
