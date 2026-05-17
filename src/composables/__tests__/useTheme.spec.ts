import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { defineComponent, createApp } from 'vue'
import { useTheme } from '../useTheme'

const THEME_KEY = 'steamkeyvault-theme'
const DARK_CLASS = 'my-app-dark'

// jsdom may not fully implement localStorage in all vitest environments — use a simple stub.
const localStorageData: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageData[key] ?? null,
  setItem: (key: string, value: string) => { localStorageData[key] = value },
  removeItem: (key: string) => { delete localStorageData[key] },
  clear: () => { Object.keys(localStorageData).forEach((k) => delete localStorageData[k]) },
}

/**
 * Run a composable inside a component setup to avoid "onMounted outside setup" warnings.
 */
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

describe('useTheme', () => {
  beforeAll(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    // jsdom does not implement window.matchMedia — provide a minimal stub.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    localStorageMock.removeItem(THEME_KEY)
    document.documentElement.classList.remove(DARK_CLASS)
  })

  afterEach(() => {
    localStorageMock.removeItem(THEME_KEY)
    document.documentElement.classList.remove(DARK_CLASS)
  })

  describe('setTheme', () => {
    it('adds dark class to <html> when setting dark theme', () => {
      const { setTheme } = withSetup(useTheme)

      setTheme('dark')

      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    })

    it('removes dark class from <html> when setting light theme', () => {
      document.documentElement.classList.add(DARK_CLASS)
      const { setTheme } = withSetup(useTheme)

      setTheme('light')

      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
    })

    it('persists the chosen theme in localStorage', () => {
      const { setTheme } = withSetup(useTheme)

      setTheme('dark')
      expect(localStorage.getItem(THEME_KEY)).toBe('dark')

      setTheme('light')
      expect(localStorage.getItem(THEME_KEY)).toBe('light')
    })

    it('updates currentTheme ref', () => {
      const { currentTheme, setTheme } = withSetup(useTheme)

      setTheme('dark')
      expect(currentTheme.value).toBe('dark')

      setTheme('light')
      expect(currentTheme.value).toBe('light')
    })
  })

  describe('toggleTheme', () => {
    it('switches from light to dark', () => {
      const { currentTheme, setTheme, toggleTheme } = withSetup(useTheme)

      setTheme('light')
      toggleTheme()

      expect(currentTheme.value).toBe('dark')
      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    })

    it('switches from dark to light', () => {
      const { currentTheme, setTheme, toggleTheme } = withSetup(useTheme)

      setTheme('dark')
      toggleTheme()

      expect(currentTheme.value).toBe('light')
      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
    })
  })

  describe('initTheme', () => {
    it('applies the theme stored in localStorage', () => {
      localStorage.setItem(THEME_KEY, 'dark')
      const { initTheme } = withSetup(useTheme)

      initTheme()

      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(true)
    })

    it('falls back to light theme when localStorage has no value', () => {
      // Ensure no media query dark preference in jsdom (defaults to no match)
      const { initTheme } = withSetup(useTheme)

      initTheme()

      expect(document.documentElement.classList.contains(DARK_CLASS)).toBe(false)
    })
  })

  describe('isDark', () => {
    it('returns true when current theme is dark', () => {
      const { setTheme, isDark } = withSetup(useTheme)

      setTheme('dark')
      expect(isDark()).toBe(true)
    })

    it('returns false when current theme is light', () => {
      const { setTheme, isDark } = withSetup(useTheme)

      setTheme('light')
      expect(isDark()).toBe(false)
    })
  })
})
