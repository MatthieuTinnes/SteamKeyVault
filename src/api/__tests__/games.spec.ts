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
    masterKeyBytes: new Uint8Array(32),
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
import {
  searchSteamGames,
  addUserGame,
  getUserGames,
  getSteamAppDetails,
  updateUserGame,
  removeUserGame,
} from '../games'

describe('games API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchSteamGames', () => {
    it('returns empty array for blank query', async () => {
      const result = await searchSteamGames('   ')
      expect(result).toEqual([])
      expect(axios.get).not.toHaveBeenCalled()
    })

    it('calls GET /steam/search with encoded query', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [{ appid: 1, name: 'HL2' }] })

      const result = await searchSteamGames('Half Life')
      expect(axios.get).toHaveBeenCalledWith(
        'http://test/api/steam/search/?name=Half%20Life',
        { withCredentials: true },
      )
      expect(result).toEqual([{ appid: 1, name: 'HL2' }])
    })
  })

  describe('addUserGame', () => {
    it('sends name only when no steamappid or platform', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { id: 1 } })

      await addUserGame({ name: 'My Game' })
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/games/add',
        { name: 'My Game' },
        { withCredentials: true },
      )
    })

    it('sends steamapp_id when steamappid is provided', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { id: 1 } })

      await addUserGame({ name: 'HL2', steamappid: 220 })
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/games/add',
        { name: 'HL2', steamapp_id: 220 },
        { withCredentials: true },
      )
    })

    it('sends platform when provided', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { id: 1 } })

      await addUserGame({ name: 'Game', platform: 'GOG' })
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/games/add',
        { name: 'Game', platform: 'GOG' },
        { withCredentials: true },
      )
    })
  })

  describe('getUserGames', () => {
    it('calls GET /games/list and returns data', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: [{ id: 1, name: 'HL2' }] })

      const result = await getUserGames()
      expect(axios.get).toHaveBeenCalledWith('http://test/api/games/list', { withCredentials: true })
      expect(result).toEqual([{ id: 1, name: 'HL2' }])
    })
  })

  describe('getSteamAppDetails', () => {
    it('calls GET /steam/appdetails/:appid', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { name: 'HL2' } })

      const result = await getSteamAppDetails(220)
      expect(axios.get).toHaveBeenCalledWith('http://test/api/steam/appdetails/220/', { withCredentials: true })
      expect(result).toEqual({ name: 'HL2' })
    })

    it('includes lang param when provided', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { name: 'HL2' } })

      await getSteamAppDetails(220, 'fr')
      expect(axios.get).toHaveBeenCalledWith('http://test/api/steam/appdetails/220/?lang=fr', { withCredentials: true })
    })
  })

  describe('updateUserGame', () => {
    it('calls PATCH /games/:id/update', async () => {
      vi.mocked(axios.patch).mockResolvedValue({ data: {} })

      await updateUserGame(5, { name: 'New Name' })
      expect(axios.patch).toHaveBeenCalledWith(
        'http://test/api/games/5/update',
        { name: 'New Name' },
        { withCredentials: true },
      )
    })
  })

  describe('removeUserGame', () => {
    it('calls DELETE /games/remove/:id', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: {} })

      await removeUserGame(5)
      expect(axios.delete).toHaveBeenCalledWith('http://test/api/games/remove/5', { withCredentials: true })
    })
  })
})
