import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import type { Restaurant } from "@chooz/shared";
import { getDbInstance } from "../firebase";
import { toAppError } from "../errors";
import { restaurantConverter } from "./converters";

const COLLECTION = "restaurants";

function restaurantsCol() {
  return collection(getDbInstance(), COLLECTION).withConverter(restaurantConverter);
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  try {
    const snap = await getDoc(doc(restaurantsCol(), id));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getRestaurantsByOwner(ownerUid: string): Promise<Restaurant[]> {
  try {
    const q = query(restaurantsCol(), where("ownerUid", "==", ownerUid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getPublishedRestaurants(): Promise<Restaurant[]> {
  try {
    const q = query(restaurantsCol(), where("isPublished", "==", true), orderBy("name"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createRestaurant(
  id: string,
  data: Omit<Restaurant, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  try {
    await setDoc(doc(getDbInstance(), COLLECTION, id), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateRestaurant(
  id: string,
  data: Partial<Omit<Restaurant, "id" | "createdAt">>,
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

export async function deleteRestaurant(id: string): Promise<void> {
  try {
    await deleteDoc(doc(getDbInstance(), COLLECTION, id));
  } catch (error) {
    throw toAppError(error);
  }
}
