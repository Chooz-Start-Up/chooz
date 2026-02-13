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
import { db } from "../firebase";

const COLLECTION = "restaurants";

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Restaurant) : null;
}

export async function getRestaurantsByOwner(ownerUid: string): Promise<Restaurant[]> {
  const q = query(collection(db, COLLECTION), where("ownerUid", "==", ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Restaurant);
}

export async function getPublishedRestaurants(): Promise<Restaurant[]> {
  const q = query(
    collection(db, COLLECTION),
    where("isPublished", "==", true),
    orderBy("name"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Restaurant);
}

export async function createRestaurant(
  id: string,
  data: Omit<Restaurant, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateRestaurant(
  id: string,
  data: Partial<Omit<Restaurant, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRestaurant(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
