import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase";

export async function uploadImage(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer,
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function getImageUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path));
}

export async function deleteImage(path: string): Promise<void> {
  await deleteObject(ref(storage, path));
}

// Convenience helpers for restaurant images
export function uploadBanner(restaurantId: string, file: Blob | Uint8Array | ArrayBuffer) {
  return uploadImage(`restaurants/${restaurantId}/banner`, file);
}

export function uploadLogo(restaurantId: string, file: Blob | Uint8Array | ArrayBuffer) {
  return uploadImage(`restaurants/${restaurantId}/logo`, file);
}

export function deleteBanner(restaurantId: string) {
  return deleteImage(`restaurants/${restaurantId}/banner`);
}

export function deleteLogo(restaurantId: string) {
  return deleteImage(`restaurants/${restaurantId}/logo`);
}
