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
import { db } from "../firebase";

const COLLECTION = "claimRequests";

export async function getClaimRequest(id: string): Promise<ClaimRequest | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ClaimRequest) : null;
}

export async function getPendingClaims(): Promise<ClaimRequest[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "pending"),
    orderBy("submittedAt"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClaimRequest);
}

export async function createClaimRequest(
  id: string,
  data: Omit<ClaimRequest, "id" | "submittedAt" | "reviewedAt" | "reviewedBy">,
): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), {
    ...data,
    submittedAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
}

export async function updateClaimRequest(
  id: string,
  data: Partial<Omit<ClaimRequest, "id" | "submittedAt">>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}
