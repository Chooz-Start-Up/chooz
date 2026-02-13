import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import type { Item } from "@chooz/shared";
import { db } from "../firebase";

function itemsCollection(restaurantId: string, menuId: string, categoryId: string) {
  return collection(
    db,
    "restaurants",
    restaurantId,
    "menus",
    menuId,
    "categories",
    categoryId,
    "items",
  );
}

export async function getItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
): Promise<Item | null> {
  const snap = await getDoc(doc(itemsCollection(restaurantId, menuId, categoryId), itemId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Item) : null;
}

export async function getItems(
  restaurantId: string,
  menuId: string,
  categoryId: string,
): Promise<Item[]> {
  const q = query(itemsCollection(restaurantId, menuId, categoryId), orderBy("sortOrder"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Item);
}

export async function createItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  data: Omit<Item, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  await setDoc(doc(itemsCollection(restaurantId, menuId, categoryId), itemId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  data: Partial<Omit<Item, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(itemsCollection(restaurantId, menuId, categoryId), itemId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
): Promise<void> {
  await deleteDoc(doc(itemsCollection(restaurantId, menuId, categoryId), itemId));
}
