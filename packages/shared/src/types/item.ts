import { Timestamp } from "firebase/firestore";

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  ingredients: string[];
  tags: string[];
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
