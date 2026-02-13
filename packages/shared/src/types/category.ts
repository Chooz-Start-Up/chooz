import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  description: string;
  sortOrder: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
