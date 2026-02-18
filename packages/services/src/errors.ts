/**
 * Structured error types for the service layer.
 * Firebase errors are caught and wrapped at the boundary so consumers
 * never deal with raw Firebase exceptions.
 */

export type AppErrorCode =
  | "not-found"
  | "already-exists"
  | "permission-denied"
  | "unauthenticated"
  | "invalid-argument"
  | "failed-precondition"
  | "storage/object-not-found"
  | "storage/quota-exceeded"
  | "auth/email-already-in-use"
  | "auth/invalid-credential"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/too-many-requests"
  | "auth/popup-closed-by-user"
  | "unknown";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Maps a Firebase error code to an AppErrorCode.
 * Unknown codes fall through to "unknown".
 */
function mapFirebaseCode(firebaseCode: string): AppErrorCode {
  const mapping: Record<string, AppErrorCode> = {
    "not-found": "not-found",
    "already-exists": "already-exists",
    "permission-denied": "permission-denied",
    "unauthenticated": "unauthenticated",
    "invalid-argument": "invalid-argument",
    "failed-precondition": "failed-precondition",
    "storage/object-not-found": "storage/object-not-found",
    "storage/quota-exceeded": "storage/quota-exceeded",
    "auth/email-already-in-use": "auth/email-already-in-use",
    "auth/invalid-credential": "auth/invalid-credential",
    "auth/user-not-found": "auth/user-not-found",
    "auth/wrong-password": "auth/wrong-password",
    "auth/too-many-requests": "auth/too-many-requests",
    "auth/popup-closed-by-user": "auth/popup-closed-by-user",
  };
  return mapping[firebaseCode] ?? "unknown";
}

/**
 * Wraps a Firebase error into an AppError.
 * Call this in catch blocks throughout the service layer.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (
    error != null &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const firebaseError = error as { code: string; message?: string };
    return new AppError(
      mapFirebaseCode(firebaseError.code),
      firebaseError.message ?? firebaseError.code,
      error,
    );
  }

  if (error instanceof Error) {
    return new AppError("unknown", error.message, error);
  }

  return new AppError("unknown", String(error), error);
}
