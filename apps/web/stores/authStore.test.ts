import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      firebaseUser: null,
      profile: null,
      loading: true,
    });
  });

  it("starts with loading true and no user", () => {
    const state = useAuthStore.getState();
    expect(state.loading).toBe(true);
    expect(state.firebaseUser).toBeNull();
    expect(state.profile).toBeNull();
  });

  it("setFirebaseUser updates user and clears loading", () => {
    const mockUser = { uid: "test-uid" } as any;
    useAuthStore.getState().setFirebaseUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.firebaseUser).toBe(mockUser);
    expect(state.loading).toBe(false);
  });

  it("setFirebaseUser with null clears user", () => {
    useAuthStore.getState().setFirebaseUser({ uid: "test" } as any);
    useAuthStore.getState().setFirebaseUser(null);

    const state = useAuthStore.getState();
    expect(state.firebaseUser).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("setProfile updates profile", () => {
    const mockProfile = {
      uid: "test-uid",
      email: "test@example.com",
      displayName: "Test User",
      authProvider: "email" as const,
      role: "owner" as const,
      createdAt: { seconds: 0, nanoseconds: 0 },
      updatedAt: { seconds: 0, nanoseconds: 0 },
    };
    useAuthStore.getState().setProfile(mockProfile);

    expect(useAuthStore.getState().profile).toEqual(mockProfile);
  });

  it("setLoading updates loading state", () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().loading).toBe(false);

    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().loading).toBe(true);
  });
});
