import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRoute = {
  params: { locale: 'en' },
  path: '/en/my-keys',
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}))

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}))

vi.mock('@/i18n', () => ({
  SUPPORTED_LOCALES: ['en', 'fr'],
  DEFAULT_LOCALE: 'en',
}))

import { useHead } from '@unhead/vue'
import { useHreflang } from '../useHreflang'

describe('useHreflang', () => {
  beforeEach(() => {
    vi.mocked(useHead).mockClear()
    mockRoute.params = { locale: 'en' }
    mockRoute.path = '/en/my-keys'
  })

  it('calls useHead with computed link tags', () => {
    useHreflang()
    expect(useHead).toHaveBeenCalledTimes(1)
    const arg = vi.mocked(useHead).mock.calls[0][0] as any
    expect(arg.link).toBeDefined()
  })

  it('generates alternate links for all supported locales plus x-default', () => {
    useHreflang()
    const links = (vi.mocked(useHead).mock.calls[0][0] as any).link
    // links is a computed, get its value
    const value = links.value
    // 2 locales + 1 x-default = 3
    expect(value).toHaveLength(3)
    expect(value[0].hreflang).toBe('en')
    expect(value[1].hreflang).toBe('fr')
    expect(value[2].hreflang).toBe('x-default')
  })

  it('builds correct hrefs stripping current locale from path', () => {
    useHreflang()
    const links = (vi.mocked(useHead).mock.calls[0][0] as any).link.value
    const origin = window.location.origin
    expect(links[0].href).toBe(`${origin}/en/my-keys`)
    expect(links[1].href).toBe(`${origin}/fr/my-keys`)
    expect(links[2].href).toBe(`${origin}/en/my-keys`)
  })

  it('returns empty array when locale param is missing', () => {
    mockRoute.params = {} as any
    mockRoute.path = '/my-keys'
    vi.mocked(useHead).mockClear()

    useHreflang()
    const links = (vi.mocked(useHead).mock.calls[0][0] as any).link.value
    expect(links).toEqual([])
  })
})
