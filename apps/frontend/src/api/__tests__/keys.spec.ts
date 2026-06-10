import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => {
  const mockAxios: any = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: {
      xsrfCookieName: '',
      xsrfHeaderName: '',
      withCredentials: false,
      withXSRFToken: false,
    },
    interceptors: {
      response: { use: vi.fn() },
      request: { use: vi.fn() },
    },
  }
  return { default: mockAxios }
})

vi.mock('../apiHelper', () => ({
  API_BASE_URL: 'http://test/api',
  getAxiosConfig: () => ({ withCredentials: true }),
  ensureCSRFToken: vi.fn(),
}))

vi.mock('@/stores/crypto', () => ({
  useCryptoStore: () => ({
    masterKeyBytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
    clearMasterKey: vi.fn(),
  }),
}))

vi.mock('@/utils/crypto', () => ({
  decryptValue: vi.fn(async (val: string) => `decrypted_${val}`),
  encryptValue: vi.fn(async (val: string) => `encrypted_${val}`),
}))

vi.mock('@/utils/missingMasterKey', () => ({
  handleMissingMasterKey: vi.fn(),
}))

import axios from 'axios'
import { getKeysForGame, addKey, updateKey, removeKey, createShareLink, getShareInfo, revealSharedKey, cancelShareLink, removeAllUsedKeys } from '../keys'

describe('keys API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getKeysForGame', () => {
    it('fetches keys and decrypts them', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: [
          { id: 1, key: 'enc1' },
          { id: 2, key: 'enc2' },
        ],
      })

      const result = await getKeysForGame(42)
      expect(axios.get).toHaveBeenCalledWith('http://test/api/keys/list/42', { withCredentials: true })
      expect(result).toEqual([
        { id: 1, key: 'decrypted_enc1' },
        { id: 2, key: 'decrypted_enc2' },
      ])
    })
  })

  describe('addKey', () => {
    it('encrypts key before sending', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { id: 1 } })

      const result = await addKey({ key: 'ABCDE', user_game_id: 10, current_use: 'trade' })
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/keys/add',
        { key: 'encrypted_ABCDE', user_game_id: 10, current_use: 'trade' },
        { withCredentials: true },
      )
      expect(result).toEqual({ id: 1 })
    })
  })

  describe('updateKey', () => {
    it('encrypts key field if present', async () => {
      vi.mocked(axios.patch).mockResolvedValue({ data: { id: 1 } })

      await updateKey(5, 10, { key: 'NEWKEY', used: true })
      expect(axios.patch).toHaveBeenCalledWith(
        'http://test/api/keys/5/update/10',
        { key: 'encrypted_NEWKEY', used: true },
        { withCredentials: true },
      )
    })

    it('does not encrypt when key is not in payload', async () => {
      vi.mocked(axios.patch).mockResolvedValue({ data: { id: 1 } })

      await updateKey(5, 10, { used: false })
      expect(axios.patch).toHaveBeenCalledWith(
        'http://test/api/keys/5/update/10',
        { used: false },
        { withCredentials: true },
      )
    })
  })

  describe('removeKey', () => {
    it('calls DELETE endpoint', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: {} })

      await removeKey(5, 10)
      expect(axios.delete).toHaveBeenCalledWith('http://test/api/keys/5/remove/10', { withCredentials: true })
    })
  })

  describe('createShareLink', () => {
    it('calls POST share/create', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { token: 'abc' } })

      const result = await createShareLink(1, 'MY-KEY')
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/keys/share/1/create',
        { key: 'MY-KEY' },
        { withCredentials: true },
      )
      expect(result).toEqual({ token: 'abc' })
    })
  })

  describe('getShareInfo', () => {
    it('calls GET share/:token', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { game: 'HL2' } })

      const result = await getShareInfo('token123')
      expect(axios.get).toHaveBeenCalledWith('http://test/api/keys/share/token123')
      expect(result).toEqual({ game: 'HL2' })
    })
  })

  describe('revealSharedKey', () => {
    it('sends turnstile token and optional message', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { key: 'ABC' } })

      const result = await revealSharedKey('t1', 'cf_token', 'thanks!')
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/keys/share/t1/reveal',
        { turnstile_token: 'cf_token', message: 'thanks!' },
        { withCredentials: true },
      )
      expect(result).toEqual({ key: 'ABC' })
    })

    it('does not include message when empty', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { key: 'ABC' } })

      await revealSharedKey('t1', 'cf_token', '')
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/keys/share/t1/reveal',
        { turnstile_token: 'cf_token' },
        { withCredentials: true },
      )
    })
  })

  describe('cancelShareLink', () => {
    it('calls DELETE share/:keyId/cancel', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: {} })

      await cancelShareLink(5)
      expect(axios.delete).toHaveBeenCalledWith('http://test/api/keys/share/5/cancel', { withCredentials: true })
    })
  })

  describe('removeAllUsedKeys', () => {
    it('calls DELETE bulk/remove-used', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: { removed: 3 } })

      const result = await removeAllUsedKeys()
      expect(axios.delete).toHaveBeenCalledWith('http://test/api/keys/bulk/remove-used', { withCredentials: true })
      expect(result).toEqual({ removed: 3 })
    })
  })
})
