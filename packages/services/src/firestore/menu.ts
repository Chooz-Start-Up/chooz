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
import { db } from "../firebase";

function menusCollection(restaurantId: string) {
  return collection(db, "restaurants", restaurantId, "menus");
}

export async function getMenu(restaurantId: string, menuId: string): Promise<Menu | null> {
  const snap = await getDoc(doc(menusCollection(restaurantId), menuId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Menu) : null;
}

export async function getMenus(restaurantId: string): Promise<Menu[]> {
  const q = query(menusCollection(restaurantId), orderBy("sortOrder"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Menu);
}

export async function createMenu(
  restaurantId: string,
  menuId: string,
  data: Omit<Menu, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  await setDoc(doc(menusCollection(restaurantId), menuId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMenu(
  restaurantId: string,
  menuId: string,
  data: Partial<Omit<Menu, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(menusCollection(restaurantId), menuId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMenu(restaurantId: string, menuId: string): Promise<void> {
  await deleteDoc(doc(menusCollection(restaurantId), menuId));
}
