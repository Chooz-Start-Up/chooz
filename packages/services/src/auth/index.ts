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
import { getAuthInstance } from "../firebase";
import { toAppError } from "../errors";

// Email/password
export async function loginWithEmail(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(getAuthInstance(), email, password);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function registerWithEmail(email: string, password: string) {
  try {
    const credential = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
    await sendEmailVerification(credential.user);
    return credential;
  } catch (error) {
    throw toAppError(error);
  }
}

// OAuth providers
export async function loginWithGoogle() {
  try {
    return await signInWithPopup(getAuthInstance(), new GoogleAuthProvider());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function loginWithFacebook() {
  try {
    return await signInWithPopup(getAuthInstance(), new FacebookAuthProvider());
  } catch (error) {
    throw toAppError(error);
  }
}

export async function loginWithApple() {
  try {
    return await signInWithPopup(getAuthInstance(), new OAuthProvider("apple.com"));
  } catch (error) {
    throw toAppError(error);
  }
}

// Account management
export async function resetPassword(email: string) {
  try {
    return await sendPasswordResetEmail(getAuthInstance(), email);
  } catch (error) {
    throw toAppError(error);
  }
}

export async function verifyEmail() {
  try {
    const user = getAuthInstance().currentUser;
    if (user) {
      return await sendEmailVerification(user);
    }
  } catch (error) {
    throw toAppError(error);
  }
}

export async function logout() {
  try {
    return await signOut(getAuthInstance());
  } catch (error) {
    throw toAppError(error);
  }
}

// Auth state listener
export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(getAuthInstance(), callback);
}

export function getCurrentUser(): FirebaseUser | null {
  return getAuthInstance().currentUser;
}
