import type { Timestamp } from "./common";

export interface Note {
  id: string;
  restaurantId: string | null; // null = global note
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
