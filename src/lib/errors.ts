/**
 * Maps raw error objects to user-friendly messages.
 * Prevents exposing internal system details while keeping useful feedback.
 */
export const getSafeErrorMessage = (error: unknown): string => {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  const err = error as { code?: string; message?: string };
  
  // Supabase Auth error mappings
  if (err.message?.toLowerCase().includes("invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  }
  
  if (err.message?.toLowerCase().includes("email not confirmed")) {
    return "Please verify your email address before signing in.";
  }
  
  if (err.message?.toLowerCase().includes("user already registered")) {
    return "An account with this email already exists.";
  }
  
  if (err.message?.toLowerCase().includes("password")) {
    return "Password must be at least 6 characters.";
  }
  
  if (err.message?.toLowerCase().includes("email")) {
    return "Please enter a valid email address.";
  }
  
  // Database constraint violations
  if (err.code === "23505") {
    return "This record already exists.";
  }
  
  if (err.code === "23503") {
    return "Cannot complete this action due to related data.";
  }
  
  if (err.code === "42501") {
    return "You don't have permission to perform this action.";
  }
  
  // Network errors
  if (err.message?.toLowerCase().includes("network") || 
      err.message?.toLowerCase().includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }
  
  // Rate limiting
  if (err.code === "429" || err.message?.toLowerCase().includes("rate limit")) {
    return "Too many requests. Please wait a moment and try again.";
  }
  
  // Generic fallback - never expose raw error message
  return "An unexpected error occurred. Please try again.";
};
