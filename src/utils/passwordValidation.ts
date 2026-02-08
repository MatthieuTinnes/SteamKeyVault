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
import { i18n } from '@/i18n'

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push(i18n.global.t('validation.password.minLength'))
  }

  if (!/[a-z]/.test(password)) {
    errors.push(i18n.global.t('validation.password.lowercase'))
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(i18n.global.t('validation.password.uppercase'))
  }

  if (!/\d/.test(password)) {
    errors.push(i18n.global.t('validation.password.digit'))
  }

  if (!/[#?!@$%^&*\-'+()_[\]]/.test(password)) {
    errors.push(i18n.global.t('validation.password.special'))
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
  return i18n.global.t('account.security.passwordRequirements')
}
