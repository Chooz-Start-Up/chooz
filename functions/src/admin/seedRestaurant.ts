import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface SeedRestaurantData {
  name: string;
  description: string;
  address: string;
  phone: string;
  tags: string[];
}

/**
 * Callable function for admins to seed restaurant profiles from public data.
 * Creates a restaurant with ownershipStatus: 'seeded'.
 */
export const seedRestaurant = onCall(async (request) => {
  // Verify caller is admin
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated");
  }

  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userData = userDoc.data();

  if (!userData || userData.role !== "admin") {
    throw new HttpsError("permission-denied", "Must be an admin");
  }

  const data = request.data as SeedRestaurantData;

  const restaurantRef = db.collection("restaurants").doc();
  await restaurantRef.set({
    name: data.name,
    description: data.description,
    address: data.address,
    phone: data.phone,
    tags: data.tags || [],
    ownerUid: null,
    ownershipStatus: "seeded",
    claimedBy: null,
    claimDate: null,
    verifiedDate: null,
    isPublished: true,
    geoHash: "",
    latitude: 0,
    longitude: 0,
    hours: {},
    bannerImageUrl: null,
    logoImageUrl: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { restaurantId: restaurantRef.id };
});
