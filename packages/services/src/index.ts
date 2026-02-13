// Firebase app
export { app, auth, db, storage } from "./firebase";

// Auth
export * as authService from "./auth";

// Firestore
export * as restaurantService from "./firestore/restaurant";
export * as menuService from "./firestore/menu";
export * as categoryService from "./firestore/category";
export * as itemService from "./firestore/item";
export * as userService from "./firestore/user";
export * as claimService from "./firestore/claim";

// Storage
export * as storageService from "./storage";
