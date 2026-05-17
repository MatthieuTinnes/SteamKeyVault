import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCryptoStore } from '../crypto'
import type { KdfParams } from '@/utils/crypto'

const STORAGE_KEY_MASTER = 'skv_master_key'
const STORAGE_KEY_SALT = 'skv_mk_salt'
const STORAGE_KEY_KDF = 'skv_kdf_params'

const TEST_KDF_PARAMS: KdfParams = { iterations: 310000, hash: 'SHA-256' }

describe('useCryptoStore', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('initializes with null values when sessionStorage is empty', () => {
    const store = useCryptoStore()
    expect(store.masterKeyBytes).toBeNull()
    expect(store.mkSalt).toBeNull()
    expect(store.kdfParams).toBeNull()
  })

  it('setMasterKeyBytes stores the bytes in state and sessionStorage', () => {
    const store = useCryptoStore()
    const bytes = new Uint8Array([1, 2, 3, 4, 5])

    store.setMasterKeyBytes(bytes)

    expect(store.masterKeyBytes).toEqual(bytes)
    expect(sessionStorage.getItem(STORAGE_KEY_MASTER)).not.toBeNull()
  })

  it('setKdfContext stores salt and kdf params in state and sessionStorage', () => {
    const store = useCryptoStore()

    store.setKdfContext('base64salt==', TEST_KDF_PARAMS)

    expect(store.mkSalt).toBe('base64salt==')
    expect(store.kdfParams).toEqual(TEST_KDF_PARAMS)
    expect(sessionStorage.getItem(STORAGE_KEY_SALT)).toBe('base64salt==')
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY_KDF)!)).toEqual(TEST_KDF_PARAMS)
  })

  it('clearMasterKey resets all state and removes sessionStorage entries', () => {
    const store = useCryptoStore()
    store.setMasterKeyBytes(new Uint8Array([10, 20, 30]))
    store.setKdfContext('somesalt', TEST_KDF_PARAMS)

    store.clearMasterKey()

    expect(store.masterKeyBytes).toBeNull()
    expect(store.mkSalt).toBeNull()
    expect(store.kdfParams).toBeNull()
    expect(sessionStorage.getItem(STORAGE_KEY_MASTER)).toBeNull()
    expect(sessionStorage.getItem(STORAGE_KEY_SALT)).toBeNull()
    expect(sessionStorage.getItem(STORAGE_KEY_KDF)).toBeNull()
  })

  it('rehydrates masterKeyBytes from sessionStorage on store creation', () => {
    // Pre-populate sessionStorage as if a previous session set it
    const bytes = new Uint8Array([7, 8, 9])
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join('')
    sessionStorage.setItem(STORAGE_KEY_MASTER, btoa(binary))

    // Create a fresh pinia so the store re-initializes from sessionStorage
    setActivePinia(createPinia())
    const store = useCryptoStore()

    expect(store.masterKeyBytes).not.toBeNull()
    expect(store.masterKeyBytes).toEqual(bytes)
  })

  it('rehydrates kdfParams from sessionStorage on store creation', () => {
    sessionStorage.setItem(STORAGE_KEY_KDF, JSON.stringify(TEST_KDF_PARAMS))

    setActivePinia(createPinia())
    const store = useCryptoStore()

    expect(store.kdfParams).toEqual(TEST_KDF_PARAMS)
  })
})
