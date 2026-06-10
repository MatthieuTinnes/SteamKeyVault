import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import type { UserInfo } from '@/api/auth'

// Mock external dependencies
vi.mock('@/api/auth', () => ({
  fetchUser: vi.fn(),
}))

vi.mock('@/i18n', () => ({
  setLocale: vi.fn(),
}))

import { fetchUser } from '@/api/auth'
import { setLocale } from '@/i18n'

const mockUser: UserInfo = {
  username: 'testuser',
  email: 'test@example.com',
  email_verified: true,
  is_admin: false,
  preferred_language: 'en',
}

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with null user', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
  })

  it('setUser stores the provided user', () => {
    const store = useUserStore()
    store.setUser(mockUser)
    expect(store.user).toEqual(mockUser)
  })

  it('setUser accepts null to clear the user', () => {
    const store = useUserStore()
    store.setUser(mockUser)
    store.setUser(null)
    expect(store.user).toBeNull()
  })

  it('clearUser resets user to null', () => {
    const store = useUserStore()
    store.setUser(mockUser)
    store.clearUser()
    expect(store.user).toBeNull()
  })

  it('fetchUser fetches and stores the user', async () => {
    vi.mocked(fetchUser).mockResolvedValueOnce(mockUser)

    const store = useUserStore()
    const result = await store.fetchUser()

    expect(result).toEqual(mockUser)
    expect(store.user).toEqual(mockUser)
  })

  it('fetchUser sets locale when preferred_language is present', async () => {
    const userWithFrench = { ...mockUser, preferred_language: 'fr' }
    vi.mocked(fetchUser).mockResolvedValueOnce(userWithFrench)

    const store = useUserStore()
    await store.fetchUser()

    expect(setLocale).toHaveBeenCalledWith('fr')
  })

  it('fetchUser stores null when API returns null', async () => {
    vi.mocked(fetchUser).mockResolvedValueOnce(null)

    const store = useUserStore()
    const result = await store.fetchUser()

    expect(result).toBeNull()
    expect(store.user).toBeNull()
  })
})
