import { onRequest } from "firebase-functions/v2/https";

// Re-export function modules
export { onItemWrite } from "./algolia/sync";
export { seedRestaurant } from "./admin/seedRestaurant";
export { processClaim } from "./claims/processClaim";

// Health check endpoint
export const healthCheck = onRequest((req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
