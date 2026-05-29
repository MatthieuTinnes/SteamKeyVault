import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => {
  const mockAxios: any = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    clearUser: vi.fn(),
  }),
}))

vi.mock('@/stores/crypto', () => ({
  useCryptoStore: () => ({
    clearMasterKey: vi.fn(),
  }),
}))

import axios from 'axios'
import {
  fetchUser,
  logoutUser,
  loginUser,
  registerUser,
  updateEmail,
  updatePreferences,
  changePassword,
  fetchUserStats,
  verifyEmail,
  resendVerificationEmail,
  confirmEmailChange,
  forgotPassword,
  fetchResetPasswordInfo,
  resetPassword,
} from '../auth'

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchUser', () => {
    it('returns user data on 200', async () => {
      const user = { username: 'test', email: 'a@b.com', email_verified: true, is_admin: false }
      vi.mocked(axios.get).mockResolvedValue({ status: 200, data: user })

      const result = await fetchUser()
      expect(result).toEqual(user)
    })

    it('returns null on 401', async () => {
      vi.mocked(axios.get).mockResolvedValue({ status: 401, data: {} })

      const result = await fetchUser()
      expect(result).toBeNull()
    })
  })

  describe('logoutUser', () => {
    it('calls POST /users/logout', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      await logoutUser()
      expect(axios.post).toHaveBeenCalledWith('http://test/api/users/logout', {}, { withCredentials: true })
    })
  })

  describe('loginUser', () => {
    it('calls POST /users/login and returns data', async () => {
      const response = { wrapped_mk_password: 'x', mk_salt: 's', kdf_iterations: 310000, kdf_hash: 'SHA-256' }
      vi.mocked(axios.post).mockResolvedValue({ data: response })

      const result = await loginUser('a@b.com', 'password')
      expect(result).toEqual(response)
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/users/login',
        { email: 'a@b.com', password: 'password' },
        { withCredentials: true },
      )
    })
  })

  describe('registerUser', () => {
    it('calls POST /users/register', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      const payload = {
        email: 'a@b.com',
        username: 'user',
        password: 'pass',
        wrapped_mk_password: 'w',
        wrapped_mk_recovery: 'r',
        mk_salt: 's',
        rk_salt: 'rs',
        kdf_iterations: 310000,
        kdf_hash: 'SHA-256',
      }
      await registerUser(payload)
      expect(axios.post).toHaveBeenCalledWith('http://test/api/users/register', payload, { withCredentials: true })
    })
  })

  describe('updateEmail', () => {
    it('calls PUT /users/account', async () => {
      vi.mocked(axios.put).mockResolvedValue({ data: {} })
      await updateEmail({ email: 'new@b.com' })
      expect(axios.put).toHaveBeenCalledWith('http://test/api/users/account', { email: 'new@b.com' }, { withCredentials: true })
    })
  })

  describe('updatePreferences', () => {
    it('calls PUT /users/preferences', async () => {
      vi.mocked(axios.put).mockResolvedValue({ data: {} })
      await updatePreferences({ preferred_language: 'fr' })
      expect(axios.put).toHaveBeenCalledWith('http://test/api/users/preferences', { preferred_language: 'fr' }, { withCredentials: true })
    })
  })

  describe('changePassword', () => {
    it('calls POST /users/change-password', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      const payload = { current_password: 'old', new_password: 'new', wrapped_mk_password: 'w' }
      await changePassword(payload)
      expect(axios.post).toHaveBeenCalledWith('http://test/api/users/change-password', payload, { withCredentials: true })
    })
  })

  describe('fetchUserStats', () => {
    it('calls GET /users/stats', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { games: 5 } })
      await fetchUserStats()
      expect(axios.get).toHaveBeenCalledWith('http://test/api/users/stats', { withCredentials: true })
    })
  })

  describe('verifyEmail', () => {
    it('calls GET /users/verify-email with token', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: {} })
      await verifyEmail('tok123')
      expect(axios.get).toHaveBeenCalledWith('http://test/api/users/verify-email?token=tok123')
    })
  })

  describe('resendVerificationEmail', () => {
    it('calls POST /users/resend-verification-email', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      await resendVerificationEmail()
      expect(axios.post).toHaveBeenCalledWith('http://test/api/users/resend-verification-email', {}, { withCredentials: true })
    })
  })

  describe('confirmEmailChange', () => {
    it('calls GET /users/confirm-email-change with token', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: {} })
      await confirmEmailChange('tok456')
      expect(axios.get).toHaveBeenCalledWith('http://test/api/users/confirm-email-change?token=tok456')
    })
  })

  describe('forgotPassword', () => {
    it('calls POST /users/forgot-password', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      await forgotPassword('a@b.com', 'turnstile123')
      expect(axios.post).toHaveBeenCalledWith(
        'http://test/api/users/forgot-password',
        { email: 'a@b.com', turnstile_token: 'turnstile123' },
        { withCredentials: true },
      )
    })
  })

  describe('fetchResetPasswordInfo', () => {
    it('calls GET /users/reset-password-info with token', async () => {
      const info = { wrapped_mk_recovery: 'w', rk_salt: 'r', mk_salt: 'm', kdf_iterations: 310000, kdf_hash: 'SHA-256' }
      vi.mocked(axios.get).mockResolvedValue({ data: info })
      const result = await fetchResetPasswordInfo('tok789')
      expect(result).toEqual(info)
    })
  })

  describe('resetPassword', () => {
    it('calls POST /users/reset-password', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: {} })
      const payload = { token: 't', new_password: 'np', wrapped_mk_password: 'w' }
      await resetPassword(payload)
      expect(axios.post).toHaveBeenCalledWith('http://test/api/users/reset-password', payload, { withCredentials: true })
    })
  })
})
