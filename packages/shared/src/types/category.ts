import type { Timestamp } from "./common";

export interface Category {
  id: string;
  name: string;
  description: string;
  sortOrder: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
