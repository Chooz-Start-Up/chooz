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
  AppError,
} from "@chooz/services";

function extractErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

interface AdminState {
  restaurants: Restaurant[];
  claims: ClaimRequest[];
  loadingRestaurants: boolean;
  loadingClaims: boolean;
  submitting: boolean;
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
  loadingRestaurants: false,
  loadingClaims: false,
  submitting: false,
  error: null,

  fetchRestaurants: async () => {
    set({ loadingRestaurants: true, error: null });
    try {
      const restaurants = await restaurantService.getAllRestaurants();
      set({ restaurants, loadingRestaurants: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loadingRestaurants: false });
    }
  },

  fetchClaims: async () => {
    set({ loadingClaims: true, error: null });
    try {
      const claims = await claimService.getAllClaims();
      set({ claims, loadingClaims: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loadingClaims: false });
    }
  },

  seedRestaurant: async (data) => {
    set({ submitting: true, error: null });
    try {
      const result = await adminService.seedRestaurant(data);
      const restaurants = await restaurantService.getAllRestaurants();
      set({ restaurants, submitting: false });
      return result;
    } catch (error) {
      set({ error: extractErrorMessage(error), submitting: false });
      throw error;
    }
  },

  processClaim: async (claimRequestId, action, notes) => {
    set({ submitting: true, error: null });
    try {
      const result = await adminService.processClaim({
        claimRequestId,
        action,
        notes,
      });
      const [claims, restaurants] = await Promise.all([
        claimService.getAllClaims(),
        restaurantService.getAllRestaurants(),
      ]);
      set({ claims, restaurants, submitting: false });
      return result;
    } catch (error) {
      set({ error: extractErrorMessage(error), submitting: false });
      throw error;
    }
  },

  updateRestaurant: async (id, data) => {
    set({ submitting: true, error: null });
    try {
      await restaurantService.updateRestaurant(id, data);
      const restaurants = await restaurantService.getAllRestaurants();
      set({ restaurants, submitting: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), submitting: false });
      throw error;
    }
  },
}));
