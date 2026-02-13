import { Timestamp } from "firebase/firestore";

export interface Favorite {
  id: string;
  type: "restaurant" | "item";
  restaurantId: string;
  itemId: string | null; // null if favoriting a restaurant
  createdAt: Timestamp;
}
