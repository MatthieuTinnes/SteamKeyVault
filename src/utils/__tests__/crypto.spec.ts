import { describe, it, expect } from 'vitest'
import {
  getDefaultKdfParams,
  generateSalt,
  generateMasterKeyBytes,
  generateRecoveryPhrase,
  encryptValue,
  decryptValue,
  wrapMasterKey,
  unwrapMasterKey,
  deriveKeyFromPassword,
} from '../crypto'

describe('getDefaultKdfParams', () => {
  it('returns correct default KDF parameters', () => {
    const params = getDefaultKdfParams()
    expect(params.iterations).toBe(310000)
    expect(params.hash).toBe('SHA-256')
  })
})

describe('generateSalt', () => {
  it('returns a non-empty base64 string', () => {
    const salt = generateSalt()
    expect(typeof salt).toBe('string')
    expect(salt.length).toBeGreaterThan(0)
  })

  it('returns different values on successive calls', () => {
    const s1 = generateSalt()
    const s2 = generateSalt()
    expect(s1).not.toBe(s2)
  })

  it('respects a custom byte length', () => {
    const salt32 = generateSalt(32)
    const decoded = atob(salt32)
    expect(decoded.length).toBe(32)
  })
})

describe('generateMasterKeyBytes', () => {
  it('returns a Uint8Array of 32 bytes', () => {
    const key = generateMasterKeyBytes()
    expect(key).toBeInstanceOf(Uint8Array)
    expect(key.length).toBe(32)
  })

  it('returns different values on successive calls', () => {
    const k1 = generateMasterKeyBytes()
    const k2 = generateMasterKeyBytes()
    expect(k1).not.toEqual(k2)
  })
})

describe('generateRecoveryPhrase', () => {
  it('generates a 12-word phrase by default', () => {
    const phrase = generateRecoveryPhrase(12)
    const words = phrase.trim().split(' ')
    expect(words.length).toBe(12)
  })

  it('generates a 24-word phrase', () => {
    const phrase = generateRecoveryPhrase(24)
    const words = phrase.trim().split(' ')
    expect(words.length).toBe(24)
  })

  it('throws for an unsupported word count', () => {
    expect(() => generateRecoveryPhrase(18 as any)).toThrow(
      'Recovery phrase must be 12 or 24 words',
    )
  })
})

describe('encryptValue / decryptValue', () => {
  it('round-trips a plaintext value', async () => {
    const masterKeyBytes = generateMasterKeyBytes()
    const plaintext = 'MY-STEAM-KEY-ABCDE'

    const encrypted = await encryptValue(plaintext, masterKeyBytes)
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted.startsWith('v1.')).toBe(true)

    const decrypted = await decryptValue(encrypted, masterKeyBytes)
    expect(decrypted).toBe(plaintext)
  })

  it('returns empty string unchanged (encryptValue)', async () => {
    const masterKeyBytes = generateMasterKeyBytes()
    const result = await encryptValue('', masterKeyBytes)
    expect(result).toBe('')
  })

  it('returns non-envelope value unchanged (decryptValue)', async () => {
    const masterKeyBytes = generateMasterKeyBytes()
    const plain = 'not-encrypted'
    const result = await decryptValue(plain, masterKeyBytes)
    expect(result).toBe(plain)
  })

  it('produces different ciphertexts for the same plaintext (random IV)', async () => {
    const masterKeyBytes = generateMasterKeyBytes()
    const c1 = await encryptValue('same-key', masterKeyBytes)
    const c2 = await encryptValue('same-key', masterKeyBytes)
    expect(c1).not.toBe(c2)
  })

  it('throws when decrypting with a wrong master key', async () => {
    const masterKeyBytes = generateMasterKeyBytes()
    const wrongKey = generateMasterKeyBytes()
    const encrypted = await encryptValue('secret', masterKeyBytes)
    await expect(decryptValue(encrypted, wrongKey)).rejects.toThrow()
  })
})

describe('wrapMasterKey / unwrapMasterKey', () => {
  it('round-trips the master key bytes via PBKDF2-derived wrapping key', async () => {
    const masterKeyBytes = generateMasterKeyBytes()
    const salt = generateSalt()
    const params = getDefaultKdfParams()
    const wrappingKey = await deriveKeyFromPassword('correct-horse-battery', salt, params)

    const envelope = await wrapMasterKey(masterKeyBytes, wrappingKey)
    expect(envelope.startsWith('v1.')).toBe(true)

    const unwrapped = await unwrapMasterKey(envelope, wrappingKey)
    expect(unwrapped).toEqual(masterKeyBytes)
  })

  it('throws when unwrapping with the wrong wrapping key', async () => {
    const masterKeyBytes = generateMasterKeyBytes()
    const salt = generateSalt()
    const params = getDefaultKdfParams()
    const wrappingKey = await deriveKeyFromPassword('correct-horse', salt, params)
    const wrongKey = await deriveKeyFromPassword('wrong-horse', salt, params)

    const envelope = await wrapMasterKey(masterKeyBytes, wrappingKey)
    await expect(unwrapMasterKey(envelope, wrongKey)).rejects.toThrow()
  })
})
