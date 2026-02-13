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
import { getDbInstance } from "../firebase";
import { toAppError } from "../errors";
import { categoryConverter } from "./converters";

function categoriesRef(restaurantId: string, menuId: string) {
  return collection(
    getDbInstance(), "restaurants", restaurantId, "menus", menuId, "categories",
  ).withConverter(categoryConverter);
}

export async function getCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
): Promise<Category | null> {
  try {
    const snap = await getDoc(doc(categoriesRef(restaurantId, menuId), categoryId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getCategories(restaurantId: string, menuId: string): Promise<Category[]> {
  try {
    const q = query(categoriesRef(restaurantId, menuId), orderBy("sortOrder"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  data: Omit<Category, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  try {
    await setDoc(
      doc(getDbInstance(), "restaurants", restaurantId, "menus", menuId, "categories", categoryId),
      { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
    );
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
  data: Partial<Omit<Category, "id" | "createdAt">>,
): Promise<void> {
  try {
    await updateDoc(
      doc(getDbInstance(), "restaurants", restaurantId, "menus", menuId, "categories", categoryId),
      { ...data, updatedAt: serverTimestamp() },
    );
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteCategory(
  restaurantId: string,
  menuId: string,
  categoryId: string,
): Promise<void> {
  try {
    await deleteDoc(
      doc(getDbInstance(), "restaurants", restaurantId, "menus", menuId, "categories", categoryId),
    );
  } catch (error) {
    throw toAppError(error);
  }
}
