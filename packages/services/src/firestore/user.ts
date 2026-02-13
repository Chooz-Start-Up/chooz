import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "@chooz/shared";
import { getDbInstance } from "../firebase";
import { toAppError } from "../errors";
import { userConverter } from "./converters";

const COLLECTION = "users";

function usersRef() {
  return collection(getDbInstance(), COLLECTION).withConverter(userConverter);
}

export async function getUser(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(usersRef(), uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createUser(
  uid: string,
  data: Omit<User, "uid" | "createdAt" | "updatedAt">,
): Promise<void> {
  try {
    await setDoc(doc(getDbInstance(), COLLECTION, uid), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<User, "uid" | "createdAt">>,
): Promise<void> {
  try {
    await updateDoc(doc(getDbInstance(), COLLECTION, uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}
