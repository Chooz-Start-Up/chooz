import { create } from "zustand";
import type { Restaurant } from "@chooz/shared";
import { restaurantService } from "@chooz/services";

interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  fetchRestaurantForOwner: (ownerUid: string) => Promise<void>;
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
  restaurants: [],
  selectedRestaurantId: null,
  setSelectedRestaurantId: (id) => set({ selectedRestaurantId: id }),

  fetchRestaurantForOwner: async (ownerUid: string) => {
    const results = await restaurantService.getRestaurantsByOwner(ownerUid);
    set({
      restaurants: results,
      selectedRestaurantId: results[0]?.id ?? null,
    });
  },

  createRestaurant: async (data, id?) => {
    id = id ?? restaurantService.generateRestaurantId();
    await restaurantService.createRestaurant(id, data);
    const created = await restaurantService.getRestaurant(id);
    const createdId = id;
    set((state) => ({
      restaurants: created ? [...state.restaurants, created] : state.restaurants,
      selectedRestaurantId: createdId,
    }));
    return id;
  },

  updateRestaurant: async (id, data) => {
    await restaurantService.updateRestaurant(id, data);
    const updated = await restaurantService.getRestaurant(id);
    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        r.id === id ? (updated ?? r) : r,
      ),
    }));
  },
}));
