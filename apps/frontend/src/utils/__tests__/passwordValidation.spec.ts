import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePasswordStrength } from '../passwordValidation'

// Mock the i18n module so the function returns the translation key itself.
vi.mock('@/i18n', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}))

describe('validatePasswordStrength', () => {
  const VALID_PASSWORD = 'Abcdefgh1#23'

  it('accepts a valid password', () => {
    const result = validatePasswordStrength(VALID_PASSWORD)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects a password shorter than 12 characters', () => {
    const result = validatePasswordStrength('Ab1#efgh')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('validation.password.minLength')
  })

  it('rejects a password without a lowercase letter', () => {
    const result = validatePasswordStrength('ABCDEFGH1#23')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('validation.password.lowercase')
  })

  it('rejects a password without an uppercase letter', () => {
    const result = validatePasswordStrength('abcdefgh1#23')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('validation.password.uppercase')
  })

  it('rejects a password without a digit', () => {
    const result = validatePasswordStrength('Abcdefgh####')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('validation.password.digit')
  })

  it('rejects a password without a special character', () => {
    const result = validatePasswordStrength('Abcdefgh1234')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('validation.password.special')
  })

  it('accumulates multiple errors', () => {
    // Short, no uppercase, no digit, no special
    const result = validatePasswordStrength('abcde')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })
})
