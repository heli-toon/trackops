/**
 * Normalizes Firestore and Firebase errors into clear, user-actionable messages.
 */
export function getFirestoreErrorMessage(
  error: unknown,
  fallbackMessage = "Unable to complete request. Please try again.",
): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);

    if (code.includes("permission-denied")) {
      return "Access denied. You do not have permission to perform this action.";
    }
    if (code.includes("unavailable") || code.includes("deadline-exceeded")) {
      return "Network connection issue or offline mode. Please check your connection and retry.";
    }
    if (code.includes("unauthenticated")) {
      return "Your session expired. Please sign in again.";
    }
    if (code.includes("not-found")) {
      return "The requested record was not found.";
    }
    if (code.includes("already-exists")) {
      return "This record already exists.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
