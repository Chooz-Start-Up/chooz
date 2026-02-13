import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  authProvider: "google" | "facebook" | "apple" | "email";
  role: "customer" | "owner" | "admin";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
