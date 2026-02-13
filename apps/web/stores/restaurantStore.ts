import { create } from "zustand";
import type { Restaurant } from "@chooz/shared";

interface RestaurantState {
  restaurant: Restaurant | null;
  restaurants: Restaurant[];
  loading: boolean;
  setRestaurant: (restaurant: Restaurant | null) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurant: null,
  restaurants: [],
  loading: false,
  setRestaurant: (restaurant) => set({ restaurant }),
  setRestaurants: (restaurants) => set({ restaurants }),
  setLoading: (loading) => set({ loading }),
}));
