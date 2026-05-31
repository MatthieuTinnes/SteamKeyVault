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
import type { AdminUser } from '../admin'

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

    it('returns users with last_login field', async () => {
      const mockUser: AdminUser = {
        id: 1,
        username: 'alice',
        email: 'alice@test.com',
        email_verified: true,
        is_admin: false,
        date_joined: '2026-01-01T00:00:00Z',
        last_login: '2026-05-30T14:30:00Z',
        games_count: 3,
        keys_count: 5,
      }
      vi.mocked(axios.get).mockResolvedValue({ data: { users: [mockUser], total: 1 } })
      const result = await getAllUsers()
      const user = result.data.users[0]
      expect(user.last_login).toBe('2026-05-30T14:30:00Z')
    })

    it('returns null last_login for users who never logged in', async () => {
      const mockUser: AdminUser = {
        id: 2,
        username: 'bob',
        email: 'bob@test.com',
        email_verified: false,
        is_admin: false,
        date_joined: '2026-01-01T00:00:00Z',
        last_login: null,
        games_count: 0,
        keys_count: 0,
      }
      vi.mocked(axios.get).mockResolvedValue({ data: { users: [mockUser], total: 1 } })
      const result = await getAllUsers()
      const user = result.data.users[0]
      expect(user.last_login).toBeNull()
    })
  })

  describe('getUserDetails', () => {
    it('calls GET /admin/users/:id', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { id: 1 } })
      await getUserDetails(1)
      expect(axios.get).toHaveBeenCalledWith('http://test/api/admin/users/1', { withCredentials: true })
    })

    it('returns last_login when set', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          id: 1, username: 'alice', email: 'alice@test.com',
          email_verified: true, is_admin: false,
          date_joined: '2026-01-01T00:00:00Z',
          last_login: '2026-05-30T14:30:00Z',
          games_count: 0, keys_count: 0,
        },
      })
      const result = await getUserDetails(1)
      expect(result.data.last_login).toBe('2026-05-30T14:30:00Z')
    })

    it('returns null last_login when never logged in', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          id: 1, username: 'bob', email: 'bob@test.com',
          email_verified: false, is_admin: false,
          date_joined: '2026-01-01T00:00:00Z',
          last_login: null,
          games_count: 0, keys_count: 0,
        },
      })
      const result = await getUserDetails(1)
      expect(result.data.last_login).toBeNull()
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
