import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { KdfParams } from '@/utils/crypto'

export const useCryptoStore = defineStore('crypto', () => {
  const masterKeyBytes = ref<Uint8Array | null>(null)
  const mkSalt = ref<string | null>(null)
  const kdfParams = ref<KdfParams | null>(null)

  function setMasterKeyBytes(bytes: Uint8Array) {
    masterKeyBytes.value = bytes
  }

  function setKdfContext(salt: string, params: KdfParams) {
    mkSalt.value = salt
    kdfParams.value = params
  }

  function clearMasterKey() {
    masterKeyBytes.value = null
    mkSalt.value = null
    kdfParams.value = null
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
