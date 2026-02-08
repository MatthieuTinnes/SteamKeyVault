import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'
import { useCryptoStore } from '@/stores/crypto'
import { decryptValue, encryptValue } from '@/utils/crypto'
import { handleMissingMasterKey } from '@/utils/missingMasterKey'

export async function getKeysForGame(userGameId: number | string) {
  const res = await axios.get(`${API_BASE_URL}/keys/list/${userGameId}`, getAxiosConfig())
  const store = useCryptoStore()
  if (!store.masterKeyBytes) {
    await handleMissingMasterKey()
    throw new Error('Missing master key. Please log in again.')
  }
  const decrypted = await Promise.all(
    res.data.map(async (item: any) => ({
      ...item,
      key: await decryptValue(item.key, store.masterKeyBytes)
    }))
  )
  return decrypted
}

export async function addKey({ key, user_game_id, current_use }: { key: string, user_game_id: number, current_use?: string }) {
  const store = useCryptoStore()
  if (!store.masterKeyBytes) {
    await handleMissingMasterKey()
    throw new Error('Missing master key. Please log in again.')
  }
  const encrypted = await encryptValue(key, store.masterKeyBytes)
  const res = await axios.post(`${API_BASE_URL}/keys/add`, { key: encrypted, user_game_id, current_use }, getAxiosConfig())
  return res.data
}

export async function updateKey(userGameId: number, keyId: number | string, data: { key?: string, used?: boolean, current_use?: string }) {
  const store = useCryptoStore()
  if (!store.masterKeyBytes) {
    await handleMissingMasterKey()
    throw new Error('Missing master key. Please log in again.')
  }
  const payload = { ...data }
  if (payload.key) {
    payload.key = await encryptValue(payload.key, store.masterKeyBytes)
  }
  const res = await axios.patch(`${API_BASE_URL}/keys/${userGameId}/update/${keyId}`, payload, getAxiosConfig())
  return res.data
}

export async function removeKey(userGameId: number, keyId: number | string) {
  const res = await axios.delete(`${API_BASE_URL}/keys/${userGameId}/remove/${keyId}`, getAxiosConfig())
  return res.data
}

export async function createShareLink(keyId: number, keyValue: string) {
  const res = await axios.post(`${API_BASE_URL}/keys/share/${keyId}/create`, { key: keyValue }, getAxiosConfig())
  return res.data
}

export async function getShareInfo(token: string) {
  const res = await axios.get(`${API_BASE_URL}/keys/share/${token}`)
  return res.data
}

export async function revealSharedKey(token: string, turnstileToken: string) {
  const res = await axios.post(`${API_BASE_URL}/keys/share/${token}/reveal`, { turnstile_token: turnstileToken }, getAxiosConfig())
  return res.data
}

export async function sendShareMessage(token: string, turnstileToken: string, message: string) {
  const res = await axios.post(`${API_BASE_URL}/keys/share/${token}/message`, { turnstile_token: turnstileToken, message }, getAxiosConfig())
  return res.data
}

export async function cancelShareLink(keyId: number) {
  const res = await axios.delete(`${API_BASE_URL}/keys/share/${keyId}/cancel`, getAxiosConfig())
  return res.data
}

export async function removeAllUsedKeys() {
  const res = await axios.delete(`${API_BASE_URL}/keys/bulk/remove-used`, getAxiosConfig())
  return res.data
}
