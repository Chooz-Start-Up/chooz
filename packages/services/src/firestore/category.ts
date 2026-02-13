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
import type { Category } from "@chooz/shared";
import { db } from "../firebase";

function categoriesCollection(restaurantId: string, menuId: string) {
  return collection(db, "restaurants", restaurantId, "menus", menuId, "categories");
}

export async function getCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
): Promise<Category | null> {
  const snap = await getDoc(doc(categoriesCollection(restaurantId, menuId), categoryId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Category) : null;
}

export async function getCategories(restaurantId: string, menuId: string): Promise<Category[]> {
  const q = query(categoriesCollection(restaurantId, menuId), orderBy("sortOrder"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function createCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  data: Omit<Category, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  await setDoc(doc(categoriesCollection(restaurantId, menuId), categoryId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  data: Partial<Omit<Category, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(categoriesCollection(restaurantId, menuId), categoryId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
): Promise<void> {
  await deleteDoc(doc(categoriesCollection(restaurantId, menuId), categoryId));
}
