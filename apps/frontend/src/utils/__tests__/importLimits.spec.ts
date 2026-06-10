import { describe, it, expect } from 'vitest'
import { MAX_IMPORT_BYTES } from '../importLimits'

describe('importLimits', () => {
  it('MAX_IMPORT_BYTES equals 10 MB', () => {
    expect(MAX_IMPORT_BYTES).toBe(10 * 1024 * 1024)
  })

  it('MAX_IMPORT_BYTES is a positive number', () => {
    expect(MAX_IMPORT_BYTES).toBeGreaterThan(0)
  })
})
