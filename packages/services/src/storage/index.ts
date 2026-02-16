import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getStorageInstance } from "../firebase";
import { toAppError } from "../errors";

export async function uploadImage(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer,
): Promise<string> {
  try {
    const storageRef = ref(getStorageInstance(), path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getImageUrl(path: string): Promise<string> {
  try {
    return await getDownloadURL(ref(getStorageInstance(), path));
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteImage(path: string): Promise<void> {
  try {
    await deleteObject(ref(getStorageInstance(), path));
  } catch (error) {
    throw toAppError(error);
  }
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

// Item images
export function uploadItemImage(
  restaurantId: string,
  imageId: string,
  file: Blob | Uint8Array | ArrayBuffer,
) {
  return uploadImage(`restaurants/${restaurantId}/items/${imageId}`, file);
}

/**
 * Delete a storage object by its Firebase download URL.
 * Firebase download URLs encode the storage path in the `/o/` segment.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const encoded = urlObj.pathname.split("/o/")[1];
    if (!encoded) return;
    const path = decodeURIComponent(encoded);
    await deleteObject(ref(getStorageInstance(), path));
  } catch (error) {
    throw toAppError(error);
  }
}
