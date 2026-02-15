import { create } from "zustand";
import type { Restaurant } from "@chooz/shared";
import { restaurantService } from "@chooz/services";

interface RestaurantState {
  restaurant: Restaurant | null;
  setRestaurant: (restaurant: Restaurant | null) => void;
  fetchRestaurantForOwner: (ownerUid: string) => Promise<Restaurant | null>;
  createRestaurant: (
    data: Omit<Restaurant, "id" | "createdAt" | "updatedAt">,
    id?: string,
  ) => Promise<string>;
  updateRestaurant: (
    id: string,
    data: Partial<Omit<Restaurant, "id" | "createdAt">>,
  ) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurant: null,
  setRestaurant: (restaurant) => set({ restaurant }),

  fetchRestaurantForOwner: async (ownerUid: string) => {
    const results = await restaurantService.getRestaurantsByOwner(ownerUid);
    const restaurant = results[0] ?? null;
    set({ restaurant });
    return restaurant;
  },

  createRestaurant: async (data, id?) => {
    id = id ?? restaurantService.generateRestaurantId();
    await restaurantService.createRestaurant(id, data);
    const created = await restaurantService.getRestaurant(id);
    set({ restaurant: created });
    return id;
  },

  updateRestaurant: async (id, data) => {
    await restaurantService.updateRestaurant(id, data);
    const updated = await restaurantService.getRestaurant(id);
    set({ restaurant: updated });
  },
}));
