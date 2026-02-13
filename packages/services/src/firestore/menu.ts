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
import type { Menu } from "@chooz/shared";
import { getDbInstance } from "../firebase";
import { toAppError } from "../errors";
import { menuConverter } from "./converters";

function menusRef(restaurantId: string) {
  return collection(getDbInstance(), "restaurants", restaurantId, "menus").withConverter(menuConverter);
}

export async function getMenu(restaurantId: string, menuId: string): Promise<Menu | null> {
  try {
    const snap = await getDoc(doc(menusRef(restaurantId), menuId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getMenus(restaurantId: string): Promise<Menu[]> {
  try {
    const q = query(menusRef(restaurantId), orderBy("sortOrder"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createMenu(
  restaurantId: string,
  menuId: string,
  data: Omit<Menu, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  try {
    await setDoc(doc(getDbInstance(), "restaurants", restaurantId, "menus", menuId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateMenu(
  restaurantId: string,
  menuId: string,
  data: Partial<Omit<Menu, "id" | "createdAt">>,
): Promise<void> {
  try {
    await updateDoc(doc(getDbInstance(), "restaurants", restaurantId, "menus", menuId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteMenu(restaurantId: string, menuId: string): Promise<void> {
  try {
    await deleteDoc(doc(getDbInstance(), "restaurants", restaurantId, "menus", menuId));
  } catch (error) {
    throw toAppError(error);
  }
}
