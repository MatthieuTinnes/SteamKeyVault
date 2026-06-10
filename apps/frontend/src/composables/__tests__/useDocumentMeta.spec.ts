import { describe, it, expect, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  }),
}))

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
}))

import { useHead } from '@unhead/vue'
import { useDocumentMeta } from '../useDocumentMeta'

describe('useDocumentMeta', () => {
  it('calls useHead with computed title and meta tags', () => {
    useDocumentMeta()

    expect(useHead).toHaveBeenCalledTimes(1)
    const arg = vi.mocked(useHead).mock.calls[0][0] as any

    expect(arg.title).toBeDefined()
    expect(arg.htmlAttrs).toBeDefined()
    expect(arg.meta).toBeInstanceOf(Array)
    expect(arg.meta.length).toBe(5)
  })

  it('includes og:title and twitter:title in meta', () => {
    vi.mocked(useHead).mockClear()
    useDocumentMeta()

    const meta = (vi.mocked(useHead).mock.calls[0][0] as any).meta
    const names = meta.map((m: any) => m.property || m.name)
    expect(names).toContain('og:title')
    expect(names).toContain('og:description')
    expect(names).toContain('twitter:title')
    expect(names).toContain('twitter:description')
    expect(names).toContain('description')
  })
})
