import type { Timestamp } from "./common";

export interface Category {
  id: string;
  name: string;
  description: string;
  isVisible: boolean;
  sortOrder: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
