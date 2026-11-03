import { getFirestoreErrorMessage } from "../utils/firestoreError";

describe("firestoreError utility", () => {
  it("translates permission-denied error", () => {
    const error = { code: "permission-denied", message: "Missing permissions" };
    expect(getFirestoreErrorMessage(error)).toBe(
      "Access denied. You do not have permission to perform this action.",
    );
  });

  it("translates offline / unavailable error", () => {
    const error = { code: "unavailable", message: "Backend unreachable" };
    expect(getFirestoreErrorMessage(error)).toBe(
      "Network connection issue or offline mode. Please check your connection and retry.",
    );
  });

  it("translates unauthenticated error", () => {
    const error = { code: "unauthenticated" };
    expect(getFirestoreErrorMessage(error)).toBe(
      "Your session expired. Please sign in again.",
    );
  });

  it("falls back to generic Error message if standard Error", () => {
    const error = new Error("Custom validation error");
    expect(getFirestoreErrorMessage(error)).toBe("Custom validation error");
  });

  it("uses provided fallback message for unknown errors", () => {
    expect(getFirestoreErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });
});
