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
import { getDbInstance } from "../firebase";
import { toAppError } from "../errors";
import { itemConverter } from "./converters";

function itemsRef(restaurantId: string, menuId: string, categoryId: string) {
  return collection(
    getDbInstance(), "restaurants", restaurantId, "menus", menuId, "categories", categoryId, "items",
  ).withConverter(itemConverter);
}

function itemPath(restaurantId: string, menuId: string, categoryId: string, itemId: string) {
  return doc(
    getDbInstance(), "restaurants", restaurantId, "menus", menuId, "categories", categoryId, "items", itemId,
  );
}

/** Returns a Firestore auto-generated document ID without creating the document. */
export function generateItemId(restaurantId: string, menuId: string, categoryId: string): string {
  return doc(collection(getDbInstance(), "restaurants", restaurantId, "menus", menuId, "categories", categoryId, "items")).id;
}

export async function getItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
): Promise<Item | null> {
  try {
    const snap = await getDoc(
      doc(itemsRef(restaurantId, menuId, categoryId), itemId),
    );
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getItems(
  restaurantId: string,
  menuId: string,
  categoryId: string,
): Promise<Item[]> {
  try {
    const q = query(itemsRef(restaurantId, menuId, categoryId), orderBy("sortOrder"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  data: Omit<Item, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  try {
    await setDoc(itemPath(restaurantId, menuId, categoryId, itemId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  data: Partial<Omit<Item, "id" | "createdAt">>,
): Promise<void> {
  try {
    await updateDoc(itemPath(restaurantId, menuId, categoryId, itemId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteItem(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
): Promise<void> {
  try {
    await deleteDoc(itemPath(restaurantId, menuId, categoryId, itemId));
  } catch (error) {
    throw toAppError(error);
  }
}
