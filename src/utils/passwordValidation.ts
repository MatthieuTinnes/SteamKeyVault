/**
 * Password validation utilities
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate password strength requirements.
 * 
 * Requirements:
 * - Minimum 12 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character from: #?!@$%^&*-'+()_[]
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit')
  }

  if (!/[#?!@$%^&*\-'+()_[\]]/.test(password)) {
    errors.push("Password must contain at least one special character (#?!@$%^&*-'+()_[])")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get a user-friendly password requirements message
 */
export function getPasswordRequirements(): string {
  return `Password must:
• Be at least 12 characters long
• Contain at least one lowercase letter
• Contain at least one uppercase letter
• Contain at least one digit
• Contain at least one special character (#?!@$%^&*-'+()_[])`
}
