import { Timestamp } from "firebase/firestore";

export interface Menu {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;

  // Time-contextual availability
  availableFrom: string | null; // '11:00' — null means always available
  availableTo: string | null; // '15:00'
  availableDays: string[] | null; // ['monday', 'tuesday', ...] — null means every day

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
