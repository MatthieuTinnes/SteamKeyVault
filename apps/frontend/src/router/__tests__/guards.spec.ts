import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { requireAuth, redirectIfAuthenticated, requireAdmin } from '../guards'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

// Mock useUserStore — path is relative to this test file
vi.mock('../../stores/user', () => ({
  useUserStore: vi.fn(),
}))

import { useUserStore } from '../../stores/user'

function makeRoute(locale = 'en'): RouteLocationNormalized {
  return {
    params: { locale },
    fullPath: `/${locale}/`,
  } as unknown as RouteLocationNormalized
}

function makeNext(): NavigationGuardNext {
  return vi.fn() as unknown as NavigationGuardNext
}

function makeStore(overrides: Record<string, unknown> = {}) {
  return {
    user: null,
    fetchUser: vi.fn().mockResolvedValue(null),
    ...overrides,
  }
}

describe('requireAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('calls next() when user is authenticated', async () => {
    const store = makeStore({ user: { username: 'alice', is_admin: false } })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const next = makeNext()
    await requireAuth(makeRoute(), makeRoute(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('redirects to /{locale}/login when not authenticated', async () => {
    const store = makeStore({ user: null })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const next = makeNext()
    await requireAuth(makeRoute('fr'), makeRoute(), next)

    expect(next).toHaveBeenCalledWith('/fr/login')
  })

  it('redirects to /en/login when locale param is absent', async () => {
    const store = makeStore({ user: null })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const routeWithoutLocale = { params: {}, fullPath: '/' } as unknown as RouteLocationNormalized
    const next = makeNext()
    await requireAuth(routeWithoutLocale, makeRoute(), next)

    expect(next).toHaveBeenCalledWith('/en/login')
  })
})

describe('redirectIfAuthenticated', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('redirects to /{locale}/my-keys when user is authenticated', async () => {
    const store = makeStore({ user: { username: 'alice', is_admin: false } })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const next = makeNext()
    await redirectIfAuthenticated(makeRoute('fr'), makeRoute(), next)

    expect(next).toHaveBeenCalledWith('/fr/my-keys')
  })

  it('calls next() when user is not authenticated', async () => {
    const store = makeStore({ user: null })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const next = makeNext()
    await redirectIfAuthenticated(makeRoute(), makeRoute(), next)

    expect(next).toHaveBeenCalledWith()
  })
})

describe('requireAdmin', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('calls next() when user is an admin', async () => {
    const store = makeStore({ user: { username: 'admin', is_admin: true } })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const next = makeNext()
    await requireAdmin(makeRoute(), makeRoute(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('redirects to /{locale}/ when user is not an admin', async () => {
    const store = makeStore({ user: { username: 'alice', is_admin: false } })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const next = makeNext()
    await requireAdmin(makeRoute('en'), makeRoute(), next)

    expect(next).toHaveBeenCalledWith('/en/')
  })

  it('redirects when user is not authenticated', async () => {
    const store = makeStore({ user: null })
    vi.mocked(useUserStore).mockReturnValue(store as any)

    const next = makeNext()
    await requireAdmin(makeRoute('en'), makeRoute(), next)

    expect(next).toHaveBeenCalledWith('/en/')
  })
})
