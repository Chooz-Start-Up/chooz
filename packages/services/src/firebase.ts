import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";
import { getFirebaseConfig } from "./env";

/**
 * Lazy initialization helpers. Firebase is initialized on first call,
 * not at import time. This prevents build-time errors during
 * Next.js static page generation where env vars are not available.
 */
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _functions: Functions | null = null;

function ensureApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApp();
  }
  return _app;
}

export function getAppInstance(): FirebaseApp {
  return ensureApp();
}

export function getAuthInstance(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}

export function getDbInstance(): Firestore {
  if (!_db) _db = getFirestore(ensureApp());
  return _db;
}

export function getStorageInstance(): FirebaseStorage {
  if (!_storage) _storage = getStorage(ensureApp());
  return _storage;
}

export function getFunctionsInstance(): Functions {
  if (!_functions) _functions = getFunctions(ensureApp());
  return _functions;
}
