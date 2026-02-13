import { create } from "zustand";
import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "@chooz/shared";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  loading: true,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser, loading: false }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));
