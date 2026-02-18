/** Request/response types for admin callable Cloud Functions. */

export interface SeedRestaurantData {
  name: string;
  description: string;
  address: string;
  phone: string;
  tags: string[];
}

export interface SeedRestaurantResult {
  restaurantId: string;
}

export interface ProcessClaimData {
  claimRequestId: string;
  action: "approve" | "reject";
  notes?: string;
}

export interface ProcessClaimResult {
  success: boolean;
  action: "approve" | "reject";
}
