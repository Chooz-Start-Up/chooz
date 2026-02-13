import type { Timestamp } from "./common";

export interface ClaimRequest {
  id: string;
  restaurantId: string;
  claimantUid: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantRole: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Timestamp;
  reviewedAt: Timestamp | null;
  reviewedBy: string | null;
  notes: string;
}
