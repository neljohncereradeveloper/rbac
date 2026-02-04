/**
 * Utility functions for error handling and detection
 */

/**
 * Checks if an error is an access denied (403 Forbidden) error
 */
export function isAccessDeniedError(error: unknown): boolean {
  if (!error) return false

  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase()

  return (
    errorMessage.includes("access denied") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("insufficient permissions") ||
    errorMessage.includes("don't have permission") ||
    errorMessage.includes("required role") ||
    errorMessage.includes("required permission")
  )
}

/**
 * Extracts a user-friendly access denied message from an error
 */
export function getAccessDeniedMessage(error: unknown): string {
  if (!error) return "Access denied. You don't have permission to perform this action."

  const errorMessage =
    error instanceof Error ? error.message : String(error)

  // If it's already a clear access denied message, use it
  if (isAccessDeniedError(error)) {
    // Clean up the message - remove redundant prefixes
    let message = errorMessage
    if (message.toLowerCase().startsWith("access denied")) {
      message = message.substring("access denied".length).trim()
      if (message.startsWith(".")) {
        message = message.substring(1).trim()
      }
      return message || "You don't have permission to perform this action."
    }
    return errorMessage
  }

  return "Access denied. You don't have permission to perform this action."
}
