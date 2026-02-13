// Firebase app (lazy singletons — initialized on first call)
export {
  getAppInstance,
  getAuthInstance,
  getDbInstance,
  getStorageInstance,
} from "./firebase";

// Environment
export { getFirebaseConfig, type FirebaseEnv } from "./env";

// Errors
export { AppError, toAppError, type AppErrorCode } from "./errors";

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
