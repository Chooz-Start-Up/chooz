import { describe, it, expect, vi, afterEach } from "vitest";
import { getFirebaseConfig } from "./env";

describe("getFirebaseConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads NEXT_PUBLIC_ prefixed env vars", () => {
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_API_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "test.firebaseapp.com");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "test-project");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "test.appspot.com");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "123456");
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_APP_ID", "1:123:web:abc");

    const config = getFirebaseConfig();
    expect(config.apiKey).toBe("test-key");
    expect(config.projectId).toBe("test-project");
  });

  it("reads EXPO_PUBLIC_ prefixed env vars", () => {
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_API_KEY", "expo-key");
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", "expo.firebaseapp.com");
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID", "expo-project");
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", "expo.appspot.com");
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "789");
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_APP_ID", "1:789:web:xyz");

    const config = getFirebaseConfig();
    expect(config.apiKey).toBe("expo-key");
    expect(config.projectId).toBe("expo-project");
  });

  it("throws when env vars are missing", () => {
    expect(() => getFirebaseConfig()).toThrow(
      "Missing or invalid Firebase environment variables",
    );
  });

  it("lists all missing variables in the error message", () => {
    try {
      getFirebaseConfig();
    } catch (error) {
      expect((error as Error).message).toContain("apiKey");
      expect((error as Error).message).toContain("projectId");
    }
  });
});
