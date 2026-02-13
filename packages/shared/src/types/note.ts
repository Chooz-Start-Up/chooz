import { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  restaurantId: string | null; // null = global note
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
