import { create } from "zustand";
import type {
  Restaurant,
  ClaimRequest,
  SeedRestaurantData,
  SeedRestaurantResult,
  ProcessClaimResult,
} from "@chooz/shared";
import {
  restaurantService,
  claimService,
  adminService,
} from "@chooz/services";

interface AdminState {
  restaurants: Restaurant[];
  claims: ClaimRequest[];
  loading: boolean;
  error: string | null;

  fetchRestaurants: () => Promise<void>;
  fetchClaims: () => Promise<void>;
  seedRestaurant: (data: SeedRestaurantData) => Promise<SeedRestaurantResult>;
  processClaim: (
    claimRequestId: string,
    action: "approve" | "reject",
    notes?: string,
  ) => Promise<ProcessClaimResult>;
  updateRestaurant: (
    id: string,
    data: Partial<Omit<Restaurant, "id" | "createdAt">>,
  ) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  restaurants: [],
  claims: [],
  loading: false,
  error: null,

  fetchRestaurants: async () => {
    set({ loading: true, error: null });
    try {
      const restaurants = await restaurantService.getAllRestaurants();
      set({ restaurants, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchClaims: async () => {
    set({ loading: true, error: null });
    try {
      const claims = await claimService.getAllClaims();
      set({ claims, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  seedRestaurant: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await adminService.seedRestaurant(data);
      // Refresh restaurants list after seeding
      await get().fetchRestaurants();
      set({ loading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  processClaim: async (claimRequestId, action, notes) => {
    set({ loading: true, error: null });
    try {
      const result = await adminService.processClaim({
        claimRequestId,
        action,
        notes,
      });
      // Refresh both claims and restaurants after processing
      await Promise.all([get().fetchClaims(), get().fetchRestaurants()]);
      set({ loading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateRestaurant: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await restaurantService.updateRestaurant(id, data);
      await get().fetchRestaurants();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
