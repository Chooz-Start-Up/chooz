import { describe, it, expect } from "vitest";
import { AppError, toAppError } from "./errors";

describe("AppError", () => {
  it("creates an error with code and message", () => {
    const error = new AppError("not-found", "Restaurant not found");
    expect(error.code).toBe("not-found");
    expect(error.message).toBe("Restaurant not found");
    expect(error.name).toBe("AppError");
    expect(error).toBeInstanceOf(Error);
  });

  it("preserves the original cause", () => {
    const cause = new Error("original");
    const error = new AppError("unknown", "wrapped", cause);
    expect(error.cause).toBe(cause);
  });
});

describe("toAppError", () => {
  it("returns the same AppError if already an AppError", () => {
    const original = new AppError("not-found", "already wrapped");
    const result = toAppError(original);
    expect(result).toBe(original);
  });

  it("maps known Firebase error codes", () => {
    const firebaseError = { code: "permission-denied", message: "Access denied" };
    const result = toAppError(firebaseError);
    expect(result.code).toBe("permission-denied");
    expect(result.message).toBe("Access denied");
  });

  it("maps Firebase auth error codes", () => {
    const authError = { code: "auth/email-already-in-use", message: "Email taken" };
    const result = toAppError(authError);
    expect(result.code).toBe("auth/email-already-in-use");
    expect(result.message).toBe("Email taken");
  });

  it("maps unknown Firebase codes to 'unknown'", () => {
    const unknownError = { code: "some-new-error", message: "Something new" };
    const result = toAppError(unknownError);
    expect(result.code).toBe("unknown");
  });

  it("wraps plain Error instances", () => {
    const plainError = new Error("plain failure");
    const result = toAppError(plainError);
    expect(result.code).toBe("unknown");
    expect(result.message).toBe("plain failure");
    expect(result.cause).toBe(plainError);
  });

  it("wraps string values", () => {
    const result = toAppError("string error");
    expect(result.code).toBe("unknown");
    expect(result.message).toBe("string error");
  });

  it("wraps null/undefined", () => {
    expect(toAppError(null).code).toBe("unknown");
    expect(toAppError(undefined).code).toBe("unknown");
  });
});
