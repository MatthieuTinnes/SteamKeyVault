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
  encryptValue: vi.fn(async (val: string) => `encrypted_${val}`),
}))

vi.mock('@/utils/missingMasterKey', () => ({
  handleMissingMasterKey: vi.fn(),
}))

import axios from 'axios'
import { getImportStatus } from '../jobs'

describe('jobs API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getImportStatus', () => {
    it('calls GET /jobs/import/status/:jobId/', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: { status: 'completed' } })

      const result = await getImportStatus(42)
      expect(axios.get).toHaveBeenCalledWith('http://test/api/jobs/import/status/42/', { withCredentials: true })
      expect(result).toEqual({ status: 'completed' })
    })
  })
})
