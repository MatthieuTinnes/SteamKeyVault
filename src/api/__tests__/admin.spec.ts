import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => {
  const mockAxios: any = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

import axios from 'axios'
import {
  getAdminStats,
  getAllUsers,
  getUserDetails,
  updateUserEmail,
  updateUserPassword,
  updateUserAdminStatus,
  deleteUser,
  deleteUserGamesAndKeys,
  refreshSteamApps,
  getSteamStats,
} from '../admin'

describe('admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAdminStats', () => {
    it('calls GET /admin/stats', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { total_users: 5 } })
      await getAdminStats()
      expect(axios.get).toHaveBeenCalledWith('http://test/api/admin/stats', { withCredentials: true })
    })
  })

  describe('getAllUsers', () => {
    it('calls GET /admin/users with default params', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { users: [], total: 0 } })
      await getAllUsers()
      expect(axios.get).toHaveBeenCalledWith('http://test/api/admin/users', {
        withCredentials: true,
        params: { limit: 25, offset: 0 },
      })
    })

    it('passes search param when provided', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { users: [], total: 0 } })
      await getAllUsers(10, 5, 'alice')
      expect(axios.get).toHaveBeenCalledWith('http://test/api/admin/users', {
        withCredentials: true,
        params: { limit: 10, offset: 5, search: 'alice' },
      })
    })
  })

  describe('getUserDetails', () => {
    it('calls GET /admin/users/:id', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { id: 1 } })
      await getUserDetails(1)
      expect(axios.get).toHaveBeenCalledWith('http://test/api/admin/users/1', { withCredentials: true })
    })
  })

  describe('updateUserEmail', () => {
    it('calls PUT /admin/users/:id/email', async () => {
      vi.mocked(axios.put).mockResolvedValue({ data: {} })
      await updateUserEmail(1, 'new@test.com')
      expect(axios.put).toHaveBeenCalledWith('http://test/api/admin/users/1/email', { email: 'new@test.com' }, { withCredentials: true })
    })
  })

  describe('updateUserPassword', () => {
    it('calls PUT /admin/users/:id/password', async () => {
      vi.mocked(axios.put).mockResolvedValue({ data: {} })
      await updateUserPassword(1, 'newpass')
      expect(axios.put).toHaveBeenCalledWith('http://test/api/admin/users/1/password', { password: 'newpass' }, { withCredentials: true })
    })
  })

  describe('updateUserAdminStatus', () => {
    it('calls PUT /admin/users/:id/admin', async () => {
      vi.mocked(axios.put).mockResolvedValue({ data: {} })
      await updateUserAdminStatus(1, true)
      expect(axios.put).toHaveBeenCalledWith('http://test/api/admin/users/1/admin', { is_admin: true }, { withCredentials: true })
    })
  })

  describe('deleteUser', () => {
    it('calls DELETE /admin/users/:id', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: {} })
      await deleteUser(1)
      expect(axios.delete).toHaveBeenCalledWith('http://test/api/admin/users/1', { withCredentials: true })
    })
  })

  describe('deleteUserGamesAndKeys', () => {
    it('calls DELETE /admin/users/:id/games-keys', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: {} })
      await deleteUserGamesAndKeys(1)
      expect(axios.delete).toHaveBeenCalledWith('http://test/api/admin/users/1/games-keys', { withCredentials: true })
    })
  })

  describe('refreshSteamApps', () => {
    it('calls POST /admin/steam/refresh-steam-apps', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      await refreshSteamApps()
      expect(axios.post).toHaveBeenCalledWith('http://test/api/admin/steam/refresh-steam-apps', {}, { withCredentials: true })
    })
  })

  describe('getSteamStats', () => {
    it('calls GET /admin/steam/steam-stats', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { total_steam_apps: 100 } })
      await getSteamStats()
      expect(axios.get).toHaveBeenCalledWith('http://test/api/admin/steam/steam-stats', { withCredentials: true })
    })
  })
})
