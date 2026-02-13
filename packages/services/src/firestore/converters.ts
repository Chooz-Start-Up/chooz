import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import type {
  Restaurant,
  Menu,
  Category,
  Item,
  User,
  ClaimRequest,
  Timestamp,
} from "@chooz/shared";

/**
 * Converts a Firestore Timestamp to our plain Timestamp type.
 * Returns { seconds: 0, nanoseconds: 0 } for null/undefined (e.g. serverTimestamp() pending).
 */
function toPlainTimestamp(
  value: FirestoreTimestamp | null | undefined,
): Timestamp {
  if (value instanceof FirestoreTimestamp) {
    return { seconds: value.seconds, nanoseconds: value.nanoseconds };
  }
  return { seconds: 0, nanoseconds: 0 };
}

/**
 * Generic converter factory. Takes an ID field name and produces
 * a Firestore converter that handles timestamp conversion.
 *
 * - `toFirestore`: strips the ID field (Firestore stores it as the doc ID, not in the data)
 * - `fromFirestore`: spreads doc data, adds ID, and converts Timestamp fields
 */
function makeConverter<T extends DocumentData>(
  idField: string,
  timestampFields: string[],
): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T): DocumentData {
      const data = { ...model } as Record<string, unknown>;
      delete data[idField];
      return data;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions,
    ): T {
      const data = snapshot.data(options) as Record<string, unknown>;
      const result: Record<string, unknown> = {
        ...data,
        [idField]: snapshot.id,
      };
      for (const field of timestampFields) {
        result[field] = toPlainTimestamp(
          data[field] as FirestoreTimestamp | null | undefined,
        );
      }
      return result as T;
    },
  };
}

export const restaurantConverter = makeConverter<Restaurant>("id", [
  "createdAt",
  "updatedAt",
  "claimDate",
  "verifiedDate",
]);

export const menuConverter = makeConverter<Menu>("id", [
  "createdAt",
  "updatedAt",
]);

export const categoryConverter = makeConverter<Category>("id", [
  "createdAt",
  "updatedAt",
]);

export const itemConverter = makeConverter<Item>("id", [
  "createdAt",
  "updatedAt",
]);

export const userConverter = makeConverter<User>("uid", [
  "createdAt",
  "updatedAt",
]);

export const claimRequestConverter = makeConverter<ClaimRequest>("id", [
  "submittedAt",
  "reviewedAt",
]);
