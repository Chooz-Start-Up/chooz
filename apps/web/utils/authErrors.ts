import type { AppErrorCode } from "@chooz/services";

const messages: Partial<Record<AppErrorCode, string>> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
};

export function getAuthErrorMessage(code: AppErrorCode): string {
  return messages[code] ?? "Something went wrong. Please try again.";
}
