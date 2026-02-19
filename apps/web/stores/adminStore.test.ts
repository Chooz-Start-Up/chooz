import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  Restaurant,
  ClaimRequest,
  SeedRestaurantResult,
  ProcessClaimResult,
} from "@chooz/shared";

// Mock service modules before importing the store
vi.mock("@chooz/services", () => {
  return {
    restaurantService: {
      getAllRestaurants: vi.fn(),
      updateRestaurant: vi.fn(),
    },
    claimService: {
      getAllClaims: vi.fn(),
    },
    adminService: {
      seedRestaurant: vi.fn(),
      processClaim: vi.fn(),
    },
    AppError: class AppError extends Error {
      constructor(
        public readonly code: string,
        message: string,
      ) {
        super(message);
        this.name = "AppError";
      }
    },
  };
});

import { useAdminStore } from "./adminStore";
import {
  restaurantService,
  claimService,
  adminService,
  AppError,
} from "@chooz/services";

const MOCK_RESTAURANT: Restaurant = {
  id: "r1",
  name: "Test Restaurant",
  description: "A test restaurant",
  address: "123 Main St",
  phone: "555-1234",
  tags: ["italian"],
  ownerUid: null,
  ownershipStatus: "seeded",
  isPublished: true,
  createdAt: { seconds: 1000, nanoseconds: 0 },
  updatedAt: { seconds: 1000, nanoseconds: 0 },
} as Restaurant;

const MOCK_CLAIM: ClaimRequest = {
  id: "c1",
  restaurantId: "r1",
  claimantUid: "user1",
  claimantEmail: "user@test.com",
  claimantName: "Test User",
  status: "pending",
  submittedAt: { seconds: 2000, nanoseconds: 0 },
  reviewedAt: null,
  reviewedBy: null,
} as ClaimRequest;

function resetStore() {
  useAdminStore.setState({
    restaurants: [],
    claims: [],
    loadingRestaurants: false,
    loadingClaims: false,
    submitting: false,
    error: null,
  });
}

describe("adminStore", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("starts with empty arrays and no loading", () => {
      const state = useAdminStore.getState();
      expect(state.restaurants).toEqual([]);
      expect(state.claims).toEqual([]);
      expect(state.loadingRestaurants).toBe(false);
      expect(state.loadingClaims).toBe(false);
      expect(state.submitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("fetchRestaurants", () => {
    it("sets loadingRestaurants and populates restaurants on success", async () => {
      vi.mocked(restaurantService.getAllRestaurants).mockResolvedValue([
        MOCK_RESTAURANT,
      ]);

      const promise = useAdminStore.getState().fetchRestaurants();

      // loadingRestaurants should be true while fetching
      expect(useAdminStore.getState().loadingRestaurants).toBe(true);
      expect(useAdminStore.getState().error).toBeNull();

      await promise;

      const state = useAdminStore.getState();
      expect(state.restaurants).toEqual([MOCK_RESTAURANT]);
      expect(state.loadingRestaurants).toBe(false);
      expect(state.error).toBeNull();
    });

    it("sets error on failure and clears loadingRestaurants", async () => {
      vi.mocked(restaurantService.getAllRestaurants).mockRejectedValue(
        new AppError("permission-denied", "Access denied"),
      );

      await useAdminStore.getState().fetchRestaurants();

      const state = useAdminStore.getState();
      expect(state.loadingRestaurants).toBe(false);
      expect(state.error).toBe("Access denied");
      expect(state.restaurants).toEqual([]);
    });

    it("handles non-AppError errors", async () => {
      vi.mocked(restaurantService.getAllRestaurants).mockRejectedValue(
        new Error("Network failure"),
      );

      await useAdminStore.getState().fetchRestaurants();

      expect(useAdminStore.getState().error).toBe("Network failure");
    });

    it("does not affect loadingClaims", async () => {
      vi.mocked(restaurantService.getAllRestaurants).mockResolvedValue([]);

      await useAdminStore.getState().fetchRestaurants();

      expect(useAdminStore.getState().loadingClaims).toBe(false);
    });
  });

  describe("fetchClaims", () => {
    it("sets loadingClaims and populates claims on success", async () => {
      vi.mocked(claimService.getAllClaims).mockResolvedValue([MOCK_CLAIM]);

      const promise = useAdminStore.getState().fetchClaims();

      expect(useAdminStore.getState().loadingClaims).toBe(true);

      await promise;

      const state = useAdminStore.getState();
      expect(state.claims).toEqual([MOCK_CLAIM]);
      expect(state.loadingClaims).toBe(false);
      expect(state.error).toBeNull();
    });

    it("sets error on failure and clears loadingClaims", async () => {
      vi.mocked(claimService.getAllClaims).mockRejectedValue(
        new AppError("unauthenticated", "Not logged in"),
      );

      await useAdminStore.getState().fetchClaims();

      const state = useAdminStore.getState();
      expect(state.loadingClaims).toBe(false);
      expect(state.error).toBe("Not logged in");
    });

    it("does not affect loadingRestaurants", async () => {
      vi.mocked(claimService.getAllClaims).mockResolvedValue([]);

      await useAdminStore.getState().fetchClaims();

      expect(useAdminStore.getState().loadingRestaurants).toBe(false);
    });
  });

  describe("concurrent fetches", () => {
    it("fetchRestaurants and fetchClaims have independent loading states", async () => {
      let resolveRestaurants!: (value: Restaurant[]) => void;
      let resolveClaims!: (value: ClaimRequest[]) => void;

      vi.mocked(restaurantService.getAllRestaurants).mockImplementation(
        () => new Promise((r) => { resolveRestaurants = r; }),
      );
      vi.mocked(claimService.getAllClaims).mockImplementation(
        () => new Promise((r) => { resolveClaims = r; }),
      );

      const p1 = useAdminStore.getState().fetchRestaurants();
      const p2 = useAdminStore.getState().fetchClaims();

      // Both should be loading
      expect(useAdminStore.getState().loadingRestaurants).toBe(true);
      expect(useAdminStore.getState().loadingClaims).toBe(true);

      // Resolve restaurants first
      resolveRestaurants([MOCK_RESTAURANT]);
      await p1;

      expect(useAdminStore.getState().loadingRestaurants).toBe(false);
      expect(useAdminStore.getState().loadingClaims).toBe(true);

      // Resolve claims
      resolveClaims([MOCK_CLAIM]);
      await p2;

      expect(useAdminStore.getState().loadingRestaurants).toBe(false);
      expect(useAdminStore.getState().loadingClaims).toBe(false);
      expect(useAdminStore.getState().restaurants).toEqual([MOCK_RESTAURANT]);
      expect(useAdminStore.getState().claims).toEqual([MOCK_CLAIM]);
    });
  });

  describe("seedRestaurant", () => {
    it("calls adminService, refreshes restaurants, and returns result", async () => {
      const seedResult: SeedRestaurantResult = { restaurantId: "new-r" };
      vi.mocked(adminService.seedRestaurant).mockResolvedValue(seedResult);
      vi.mocked(restaurantService.getAllRestaurants).mockResolvedValue([
        MOCK_RESTAURANT,
        { ...MOCK_RESTAURANT, id: "new-r", name: "New Restaurant" },
      ]);

      const result = await useAdminStore.getState().seedRestaurant({
        name: "New Restaurant",
        description: "",
        address: "",
        phone: "",
        tags: [],
      });

      expect(result).toEqual(seedResult);
      expect(adminService.seedRestaurant).toHaveBeenCalledWith({
        name: "New Restaurant",
        description: "",
        address: "",
        phone: "",
        tags: [],
      });
      expect(useAdminStore.getState().restaurants).toHaveLength(2);
      expect(useAdminStore.getState().submitting).toBe(false);
    });

    it("sets submitting during the operation", async () => {
      vi.mocked(adminService.seedRestaurant).mockResolvedValue({
        restaurantId: "r",
      });
      vi.mocked(restaurantService.getAllRestaurants).mockResolvedValue([]);

      const promise = useAdminStore.getState().seedRestaurant({
        name: "Test",
        description: "",
        address: "",
        phone: "",
        tags: [],
      });

      expect(useAdminStore.getState().submitting).toBe(true);
      await promise;
      expect(useAdminStore.getState().submitting).toBe(false);
    });

    it("throws and sets error on failure", async () => {
      const err = new AppError("invalid-argument", "Name is required");
      vi.mocked(adminService.seedRestaurant).mockRejectedValue(err);

      await expect(
        useAdminStore.getState().seedRestaurant({
          name: "",
          description: "",
          address: "",
          phone: "",
          tags: [],
        }),
      ).rejects.toThrow();

      expect(useAdminStore.getState().error).toBe("Name is required");
      expect(useAdminStore.getState().submitting).toBe(false);
    });
  });

  describe("processClaim", () => {
    it("calls adminService and refreshes both claims and restaurants", async () => {
      const processResult: ProcessClaimResult = {
        success: true,
        action: "approve",
      };
      vi.mocked(adminService.processClaim).mockResolvedValue(processResult);
      vi.mocked(claimService.getAllClaims).mockResolvedValue([
        { ...MOCK_CLAIM, status: "approved" } as ClaimRequest,
      ]);
      vi.mocked(restaurantService.getAllRestaurants).mockResolvedValue([
        { ...MOCK_RESTAURANT, ownershipStatus: "claimed" } as Restaurant,
      ]);

      const result = await useAdminStore
        .getState()
        .processClaim("c1", "approve", "Looks good");

      expect(result).toEqual(processResult);
      expect(adminService.processClaim).toHaveBeenCalledWith({
        claimRequestId: "c1",
        action: "approve",
        notes: "Looks good",
      });
      expect(useAdminStore.getState().claims[0].status).toBe("approved");
      expect(useAdminStore.getState().restaurants[0].ownershipStatus).toBe(
        "claimed",
      );
      expect(useAdminStore.getState().submitting).toBe(false);
    });

    it("throws and sets error on failure", async () => {
      vi.mocked(adminService.processClaim).mockRejectedValue(
        new AppError("failed-precondition", "Claim already processed"),
      );

      await expect(
        useAdminStore.getState().processClaim("c1", "approve"),
      ).rejects.toThrow();

      expect(useAdminStore.getState().error).toBe("Claim already processed");
      expect(useAdminStore.getState().submitting).toBe(false);
    });
  });

  describe("updateRestaurant", () => {
    it("calls service and refreshes restaurants", async () => {
      vi.mocked(restaurantService.updateRestaurant).mockResolvedValue();
      vi.mocked(restaurantService.getAllRestaurants).mockResolvedValue([
        { ...MOCK_RESTAURANT, name: "Updated Name" } as Restaurant,
      ]);

      await useAdminStore
        .getState()
        .updateRestaurant("r1", { name: "Updated Name" });

      expect(restaurantService.updateRestaurant).toHaveBeenCalledWith("r1", {
        name: "Updated Name",
      });
      expect(useAdminStore.getState().restaurants[0].name).toBe(
        "Updated Name",
      );
      expect(useAdminStore.getState().submitting).toBe(false);
    });

    it("throws and sets error on failure", async () => {
      vi.mocked(restaurantService.updateRestaurant).mockRejectedValue(
        new AppError("not-found", "Restaurant not found"),
      );

      await expect(
        useAdminStore
          .getState()
          .updateRestaurant("r1", { name: "Updated" }),
      ).rejects.toThrow();

      expect(useAdminStore.getState().error).toBe("Restaurant not found");
      expect(useAdminStore.getState().submitting).toBe(false);
    });
  });
});
