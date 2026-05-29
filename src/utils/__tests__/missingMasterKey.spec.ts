import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/auth', () => ({
  logoutUser: vi.fn(),
}))

vi.mock('@/stores/crypto', () => ({
  useCryptoStore: vi.fn(() => ({
    clearMasterKey: vi.fn(),
  })),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    clearUser: vi.fn(),
  })),
}))

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

import { logoutUser } from '@/api/auth'
import { useCryptoStore } from '@/stores/crypto'
import { useUserStore } from '@/stores/user'
import { showErrorToast } from '@/utils/toast'
import { handleMissingMasterKey } from '../missingMasterKey'

describe('handleMissingMasterKey', () => {
  let originalPathname: string
  let assignMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    originalPathname = window.location.pathname
    assignMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { pathname: '/my-keys', assign: assignMock },
      writable: true,
    })
  })

  it('shows an error toast', async () => {
    vi.mocked(logoutUser).mockResolvedValue(undefined)
    await handleMissingMasterKey()
    expect(showErrorToast).toHaveBeenCalledWith('errors.missingMasterKey', 'errors.loginAgain')
  })

  it('calls logoutUser', async () => {
    vi.mocked(logoutUser).mockResolvedValue(undefined)
    await handleMissingMasterKey()
    expect(logoutUser).toHaveBeenCalled()
  })

  it('redirects to /login when not already on login page', async () => {
    vi.mocked(logoutUser).mockResolvedValue(undefined)
    await handleMissingMasterKey()
    expect(assignMock).toHaveBeenCalledWith('/login')
  })

  it('does not redirect when already on /login', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/login', assign: assignMock },
      writable: true,
    })
    vi.mocked(logoutUser).mockResolvedValue(undefined)
    await handleMissingMasterKey()
    expect(assignMock).not.toHaveBeenCalled()
  })

  it('clears stores if logoutUser throws', async () => {
    vi.mocked(logoutUser).mockRejectedValue(new Error('network'))
    const clearMasterKey = vi.fn()
    const clearUser = vi.fn()
    vi.mocked(useCryptoStore).mockReturnValue({ clearMasterKey } as any)
    vi.mocked(useUserStore).mockReturnValue({ clearUser } as any)

    await handleMissingMasterKey()

    expect(clearMasterKey).toHaveBeenCalled()
    expect(clearUser).toHaveBeenCalled()
  })
})
