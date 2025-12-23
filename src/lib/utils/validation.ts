/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Check if a string is not empty after trimming
 */
export function isNotEmpty(str: string | null | undefined): boolean {
  return str !== null && str !== undefined && str.trim().length > 0
}

/**
 * Validate age is within acceptable range
 */
export function isValidAge(age: number): boolean {
  return age >= 5 && age <= 120
}

/**
 * Validate coordinates (latitude and longitude)
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

/**
 * Validate score value (non-negative integer)
 */
export function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0
}

/**
 * Sanitize string input (remove potentially dangerous characters)
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '').trim()
}
