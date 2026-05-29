import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => {
  const mockAxios: any = {
    get: vi.fn(),
    post: vi.fn(),
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

vi.mock('@/utils/toast', () => ({
  showErrorToast: vi.fn(),
}))

vi.mock('@/i18n', () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
}))

import { getCookie, ensureCSRFToken, getAxiosConfig, API_BASE_URL } from '../apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear cookies
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  })

  describe('getCookie', () => {
    it('returns null when cookie does not exist', () => {
      expect(getCookie('nonexistent')).toBeNull()
    })

    it('returns cookie value when it exists', () => {
      document.cookie = 'csrftoken=abc123'
      expect(getCookie('csrftoken')).toBe('abc123')
    })

    it('returns correct cookie among multiple cookies', () => {
      document.cookie = 'other=xyz'
      document.cookie = 'csrftoken=mytoken'
      expect(getCookie('csrftoken')).toBe('mytoken')
    })
  })

  describe('getAxiosConfig', () => {
    it('returns config with withCredentials true', () => {
      const config = getAxiosConfig()
      expect(config.withCredentials).toBe(true)
    })
  })

  describe('API_BASE_URL', () => {
    it('is defined', () => {
      expect(API_BASE_URL).toBeDefined()
      expect(typeof API_BASE_URL).toBe('string')
    })
  })
})
