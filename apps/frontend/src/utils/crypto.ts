import { generateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'

const KDF_ITERATIONS = 310000
const KDF_HASH = 'SHA-256'
const MK_LENGTH_BYTES = 32
const AES_GCM_IV_BYTES = 12
const ENVELOPE_VERSION = 'v1'

export interface WrappedKeyEnvelope {
  version: string
  iv: string
  ciphertext: string
}

export interface KdfParams {
  iterations: number
  hash: string
}

export function getDefaultKdfParams(): KdfParams {
  return { iterations: KDF_ITERATIONS, hash: KDF_HASH }
}

export function generateRecoveryPhrase(wordCount = 12): string {
  if (wordCount !== 12 && wordCount !== 24) {
    throw new Error('Recovery phrase must be 12 or 24 words')
  }
  const strength = wordCount === 12 ? 128 : 256
  return generateMnemonic(wordlist, strength)
}

export function generateSalt(bytes = 16): string {
  const salt = new Uint8Array(bytes)
  crypto.getRandomValues(salt)
  return bytesToBase64(salt)
}

export function generateMasterKeyBytes(): Uint8Array {
  const mk = new Uint8Array(MK_LENGTH_BYTES)
  crypto.getRandomValues(mk)
  return mk
}

export async function deriveKeyFromPassword(password: string, saltB64: string, params: KdfParams): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  const salt = base64ToBytes(saltB64)
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: params.iterations,
      hash: params.hash
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function wrapMasterKey(masterKeyBytes: Uint8Array, wrappingKey: CryptoKey): Promise<string> {
  const iv = new Uint8Array(AES_GCM_IV_BYTES)
  crypto.getRandomValues(iv)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    masterKeyBytes
  )
  return serializeEnvelope({
    version: ENVELOPE_VERSION,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext))
  })
}

export async function unwrapMasterKey(envelope: string, wrappingKey: CryptoKey): Promise<Uint8Array> {
  const parsed = parseEnvelope(envelope)
  const iv = base64ToBytes(parsed.iv)
  const ciphertext = base64ToBytes(parsed.ciphertext)
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    ciphertext
  )
  return new Uint8Array(plaintext)
}

export async function encryptValue(value: string, masterKeyBytes: Uint8Array): Promise<string> {
  if (!value) return value
  const key = await importMasterKey(masterKeyBytes)
  const iv = new Uint8Array(AES_GCM_IV_BYTES)
  crypto.getRandomValues(iv)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(value)
  )
  return serializeEnvelope({
    version: ENVELOPE_VERSION,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext))
  })
}

export async function decryptValue(value: string, masterKeyBytes: Uint8Array): Promise<string> {
  if (!value || !value.startsWith(`${ENVELOPE_VERSION}.`)) {
    return value
  }
  const key = await importMasterKey(masterKeyBytes)
  const parsed = parseEnvelope(value)
  const iv = base64ToBytes(parsed.iv)
  const ciphertext = base64ToBytes(parsed.ciphertext)
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  return new TextDecoder().decode(plaintext)
}

function serializeEnvelope(envelope: WrappedKeyEnvelope): string {
  return `${envelope.version}.${envelope.iv}.${envelope.ciphertext}`
}

function parseEnvelope(payload: string): WrappedKeyEnvelope {
  const parts = payload.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format')
  }
  return {
    version: parts[0],
    iv: parts[1],
    ciphertext: parts[2]
  }
}

async function importMasterKey(masterKeyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    masterKeyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  )
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
