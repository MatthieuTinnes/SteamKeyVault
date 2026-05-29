import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp, nextTick } from 'vue'
import { useTableRowsPerPage } from '../useTableRowsPerPage'

function withSetup<T>(composable: () => T): T {
  let result!: T
  const app = createApp(
    defineComponent({
      setup() {
        result = composable()
        return {}
      },
      template: '<div />',
    }),
  )
  app.mount(document.createElement('div'))
  return result
}

describe('useTableRowsPerPage', () => {
  beforeEach(() => {
    // Default window.innerHeight is 768 in jsdom
    Object.defineProperty(window, 'innerHeight', { value: 900, writable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('computes rows based on default params and window height', () => {
    // (900 - 550) / 80 = 4.375 → floor = 4
    const { rowsPerPage } = withSetup(() => useTableRowsPerPage())
    expect(rowsPerPage.value).toBe(4)
  })

  it('computes rows with custom baseOffset and rowHeight', () => {
    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true })
    // (1000 - 200) / 100 = 8
    const { rowsPerPage } = withSetup(() => useTableRowsPerPage(200, 100))
    expect(rowsPerPage.value).toBe(8)
  })

  it('returns minRows when available height is too small', () => {
    Object.defineProperty(window, 'innerHeight', { value: 400, writable: true })
    // (400 - 550) / 80 = -1.875 → max(1, floor) = 1
    const { rowsPerPage } = withSetup(() => useTableRowsPerPage(550, 80, 3))
    expect(rowsPerPage.value).toBe(3)
  })

  it('updates on window resize', async () => {
    const { rowsPerPage } = withSetup(() => useTableRowsPerPage())
    expect(rowsPerPage.value).toBe(4)

    Object.defineProperty(window, 'innerHeight', { value: 1200, writable: true })
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    // (1200 - 550) / 80 = 8.125 → 8
    expect(rowsPerPage.value).toBe(8)
  })

  it('provides a containerRef', () => {
    const { containerRef } = withSetup(() => useTableRowsPerPage())
    expect(containerRef.value).toBeNull()
  })
})
