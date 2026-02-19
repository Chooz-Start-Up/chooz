import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "../errors";

// Mock firebase/functions
vi.mock("firebase/functions", () => ({
  httpsCallable: vi.fn(),
}));

// Mock firebase.ts
vi.mock("../firebase", () => ({
  getFunctionsInstance: vi.fn(() => "mock-functions-instance"),
}));

import { httpsCallable } from "firebase/functions";
import { seedRestaurant, processClaim } from "./index";

const mockHttpsCallable = httpsCallable as unknown as ReturnType<typeof vi.fn>;

describe("callable function wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("seedRestaurant", () => {
    it("calls httpsCallable with correct function name and returns data", async () => {
      const mockCallable = vi.fn().mockResolvedValue({
        data: { restaurantId: "new-123" },
      });
      mockHttpsCallable.mockReturnValue(mockCallable);

      const result = await seedRestaurant({
        name: "Test",
        description: "Desc",
        address: "123 St",
        phone: "555",
        tags: ["pizza"],
      });

      expect(httpsCallable).toHaveBeenCalledWith(
        "mock-functions-instance",
        "seedRestaurant",
      );
      expect(mockCallable).toHaveBeenCalledWith({
        name: "Test",
        description: "Desc",
        address: "123 St",
        phone: "555",
        tags: ["pizza"],
      });
      expect(result).toEqual({ restaurantId: "new-123" });
    });

    it("wraps errors with toAppError", async () => {
      const mockCallable = vi.fn().mockRejectedValue({
        code: "permission-denied",
        message: "Not authorized",
      });
      mockHttpsCallable.mockReturnValue(mockCallable);

      await expect(
        seedRestaurant({
          name: "Test",
          description: "",
          address: "",
          phone: "",
          tags: [],
        }),
      ).rejects.toThrow(AppError);
    });
  });

  describe("processClaim", () => {
    it("calls httpsCallable with correct function name and returns data", async () => {
      const mockCallable = vi.fn().mockResolvedValue({
        data: { success: true, action: "approve" },
      });
      mockHttpsCallable.mockReturnValue(mockCallable);

      const result = await processClaim({
        claimRequestId: "c1",
        action: "approve",
        notes: "Verified",
      });

      expect(httpsCallable).toHaveBeenCalledWith(
        "mock-functions-instance",
        "processClaim",
      );
      expect(mockCallable).toHaveBeenCalledWith({
        claimRequestId: "c1",
        action: "approve",
        notes: "Verified",
      });
      expect(result).toEqual({ success: true, action: "approve" });
    });

    it("wraps errors with toAppError", async () => {
      const mockCallable = vi.fn().mockRejectedValue({
        code: "failed-precondition",
        message: "Already processed",
      });
      mockHttpsCallable.mockReturnValue(mockCallable);

      try {
        await processClaim({
          claimRequestId: "c1",
          action: "reject",
        });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe("failed-precondition");
      }
    });
  });
});
