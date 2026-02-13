export interface MenuItemSearchRecord {
  objectID: string;
  itemName: string;
  description: string;
  price: number;
  ingredients: string[];
  tags: string[];

  // Denormalized restaurant info
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  _geoloc: { lat: number; lng: number };

  // Denormalized menu/category
  menuName: string;
  categoryName: string;
}
