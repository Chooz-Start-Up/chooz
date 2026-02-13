import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "@chooz/shared";
import { db } from "../firebase";

const COLLECTION = "users";

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  return snap.exists() ? ({ uid: snap.id, ...snap.data() } as User) : null;
}

export async function createUser(
  uid: string,
  data: Omit<User, "uid" | "createdAt" | "updatedAt">,
): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<User, "uid" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
