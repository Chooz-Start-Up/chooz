import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface ProcessClaimData {
  claimRequestId: string;
  action: "approve" | "reject";
  notes?: string;
}

/**
 * Callable function for admins to approve or reject restaurant claim requests.
 * On approval, transfers ownership and updates restaurant status.
 */
export const processClaim = onCall(async (request) => {
  // Verify caller is admin
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated");
  }

  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userData = userDoc.data();

  if (!userData || userData.role !== "admin") {
    throw new HttpsError("permission-denied", "Must be an admin");
  }

  const { claimRequestId, action, notes } = request.data as ProcessClaimData;

  const claimRef = db.collection("claimRequests").doc(claimRequestId);
  const claimDoc = await claimRef.get();

  if (!claimDoc.exists) {
    throw new HttpsError("not-found", "Claim request not found");
  }

  const claimData = claimDoc.data()!;

  if (claimData.status !== "pending") {
    throw new HttpsError("failed-precondition", "Claim has already been processed");
  }

  const batch = db.batch();

  // Update claim request
  batch.update(claimRef, {
    status: action === "approve" ? "approved" : "rejected",
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    reviewedBy: request.auth.uid,
    notes: notes || "",
  });

  if (action === "approve") {
    // Transfer ownership
    const restaurantRef = db.collection("restaurants").doc(claimData.restaurantId);
    batch.update(restaurantRef, {
      ownerUid: claimData.claimantUid,
      ownershipStatus: "verified",
      claimedBy: claimData.claimantUid,
      claimDate: admin.firestore.FieldValue.serverTimestamp(),
      verifiedDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user role to owner
    const userRef = db.collection("users").doc(claimData.claimantUid);
    batch.update(userRef, {
      role: "owner",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  return { success: true, action };
});
