import { httpsCallable } from "firebase/functions";
import type {
  SeedRestaurantData,
  SeedRestaurantResult,
  ProcessClaimData,
  ProcessClaimResult,
} from "@chooz/shared";
import { getFunctionsInstance } from "../firebase";
import { toAppError } from "../errors";

export async function seedRestaurant(
  data: SeedRestaurantData,
): Promise<SeedRestaurantResult> {
  try {
    const fn = httpsCallable<SeedRestaurantData, SeedRestaurantResult>(
      getFunctionsInstance(),
      "seedRestaurant",
    );
    const result = await fn(data);
    return result.data;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function processClaim(
  data: ProcessClaimData,
): Promise<ProcessClaimResult> {
  try {
    const fn = httpsCallable<ProcessClaimData, ProcessClaimResult>(
      getFunctionsInstance(),
      "processClaim",
    );
    const result = await fn(data);
    return result.data;
  } catch (error) {
    throw toAppError(error);
  }
}
