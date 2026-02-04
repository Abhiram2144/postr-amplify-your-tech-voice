/**
 * Maps raw error objects to user-friendly messages.
 * Prevents exposing internal system details while keeping useful feedback.
 */
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Pass through intentional user-facing errors
    if (msg.includes("insufficient_credits") || msg.includes("limit exceeded") ||
        msg.includes("limit reached") || msg.includes("at least one platform")) {
      return error.message;
    }

    // Auth errors
    if (msg.includes("not authenticated") || msg.includes("jwt") ||
        msg.includes("authorization") || msg.includes("token") ||
        msg.includes("no authorization header")) {
      return "Authentication required. Please log in again.";
    }

    // Stripe/payment errors
    if (msg.includes("stripe") || msg.includes("customer") ||
        msg.includes("subscription") || msg.includes("payment") ||
        msg.includes("checkout")) {
      return "Payment service error. Please try again or contact support.";
    }

    // Configuration errors
    if (msg.includes("not set") || msg.includes("not configured") ||
        msg.includes("configuration") || msg.includes("environment") ||
        msg.includes("_key") || msg.includes("_secret")) {
      return "Service temporarily unavailable. Please try again later.";
    }

    // Rate limiting
    if (msg.includes("rate") || msg.includes("too many") || msg.includes("429")) {
      return "Too many requests. Please try again in a moment.";
    }

    // Validation errors - pass through
    if (msg.includes("required") || msg.includes("invalid") ||
        msg.includes("must be") || msg.includes("at least")) {
      return error.message;
    }

    // Database/profile errors
    if (msg.includes("profile") || msg.includes("database") ||
        msg.includes("supabase") || msg.includes("failed to get")) {
      return "Unable to load your profile. Please try again.";
    }

    // AI/generation errors
    if (msg.includes("ai") || msg.includes("gateway") || msg.includes("parse")) {
      return "Content generation failed. Please try again.";
    }
  }

  return "An error occurred. Please try again later.";
};

/**
 * Sanitizes values for logging to prevent log injection attacks.
 */
export const sanitizeForLog = (value: unknown): unknown => {
  if (typeof value === "string") {
    // Remove newlines/control chars and limit length
    return value.replace(/[\n\r\t\x00-\x1F]/g, " ").substring(0, 200);
  }
  if (typeof value === "object" && value !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeForLog(val);
    }
    return sanitized;
  }
  return value;
};
