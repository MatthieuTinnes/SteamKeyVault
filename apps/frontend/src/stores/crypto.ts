import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { KdfParams } from '@/utils/crypto'

const STORAGE_KEYS = {
  masterKey: 'skv_master_key',
  mkSalt: 'skv_mk_salt',
  kdfParams: 'skv_kdf_params'
}

function readSessionStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeSessionStorage(key: string, value: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (value === null) {
      window.sessionStorage.removeItem(key)
    } else {
      window.sessionStorage.setItem(key, value)
    }
  } catch {
    // Ignore storage errors (e.g., disabled storage)
  }
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

export const useCryptoStore = defineStore('crypto', () => {
  const storedMasterKey = readSessionStorage(STORAGE_KEYS.masterKey)
  const storedMkSalt = readSessionStorage(STORAGE_KEYS.mkSalt)
  const storedKdfParams = readSessionStorage(STORAGE_KEYS.kdfParams)

  let parsedMasterKey: Uint8Array | null = null
  if (storedMasterKey) {
    try {
      parsedMasterKey = base64ToBytes(storedMasterKey)
    } catch {
      writeSessionStorage(STORAGE_KEYS.masterKey, null)
    }
  }

  const masterKeyBytes = ref<Uint8Array | null>(parsedMasterKey)
  const mkSalt = ref<string | null>(storedMkSalt)
  let parsedKdfParams: KdfParams | null = null
  if (storedKdfParams) {
    try {
      parsedKdfParams = JSON.parse(storedKdfParams) as KdfParams
    } catch {
      writeSessionStorage(STORAGE_KEYS.kdfParams, null)
    }
  }

  const kdfParams = ref<KdfParams | null>(parsedKdfParams)

  function setMasterKeyBytes(bytes: Uint8Array) {
    masterKeyBytes.value = bytes
    writeSessionStorage(STORAGE_KEYS.masterKey, bytesToBase64(bytes))
  }

  function setKdfContext(salt: string, params: KdfParams) {
    mkSalt.value = salt
    kdfParams.value = params
    writeSessionStorage(STORAGE_KEYS.mkSalt, salt)
    writeSessionStorage(STORAGE_KEYS.kdfParams, JSON.stringify(params))
  }

  function clearMasterKey() {
    masterKeyBytes.value = null
    mkSalt.value = null
    kdfParams.value = null
    writeSessionStorage(STORAGE_KEYS.masterKey, null)
    writeSessionStorage(STORAGE_KEYS.mkSalt, null)
    writeSessionStorage(STORAGE_KEYS.kdfParams, null)
  }

  return {
    masterKeyBytes,
    mkSalt,
    kdfParams,
    setMasterKeyBytes,
    setKdfContext,
    clearMasterKey
  }
})
