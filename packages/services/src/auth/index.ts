import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "../firebase";

// Email/password
export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  return credential;
}

// OAuth providers
export async function loginWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function loginWithFacebook() {
  return signInWithPopup(auth, new FacebookAuthProvider());
}

export async function loginWithApple() {
  return signInWithPopup(auth, new OAuthProvider("apple.com"));
}

// Account management
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function verifyEmail() {
  if (auth.currentUser) {
    return sendEmailVerification(auth.currentUser);
  }
}

export async function logout() {
  return signOut(auth);
}

// Auth state listener
export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
