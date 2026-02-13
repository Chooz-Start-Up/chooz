/**
 * Plain timestamp type — decoupled from Firebase.
 * Firestore Timestamps are converted to/from this at the service layer boundary.
 */
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}
