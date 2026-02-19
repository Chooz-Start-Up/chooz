import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import type { ClaimRequest } from "@chooz/shared";
import { getDbInstance } from "../firebase";
import { toAppError } from "../errors";
import { claimRequestConverter } from "./converters";

const COLLECTION = "claimRequests";

function claimsRef() {
  return collection(getDbInstance(), COLLECTION).withConverter(claimRequestConverter);
}

export async function getClaimRequest(id: string): Promise<ClaimRequest | null> {
  try {
    const snap = await getDoc(doc(claimsRef(), id));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getPendingClaims(): Promise<ClaimRequest[]> {
  try {
    const q = query(
      claimsRef(),
      where("status", "==", "pending"),
      orderBy("submittedAt"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getAllClaims(): Promise<ClaimRequest[]> {
  try {
    const q = query(claimsRef(), orderBy("submittedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createClaimRequest(
  id: string,
  data: Omit<ClaimRequest, "id" | "submittedAt" | "reviewedAt" | "reviewedBy">,
): Promise<void> {
  try {
    await setDoc(doc(getDbInstance(), COLLECTION, id), {
      ...data,
      submittedAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateClaimRequest(
  id: string,
  data: Partial<Omit<ClaimRequest, "id" | "submittedAt">>,
): Promise<void> {
  try {
    await updateDoc(doc(getDbInstance(), COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}
