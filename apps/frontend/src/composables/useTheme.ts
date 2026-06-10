import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'steamkeyvault-theme'
const DARK_CLASS = 'my-app-dark'

const currentTheme = ref<Theme>('light')

export function useTheme() {
  /**
   * Détecte la préférence système de l'utilisateur
   */
  const getSystemPreference = (): Theme => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  /**
   * Récupère le thème depuis le localStorage ou utilise la préférence système
   */
  const getStoredTheme = (): Theme => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
    return getSystemPreference()
  }

  /**
   * Applique le thème sur le DOM
   */
  const applyTheme = (theme: Theme) => {
    const htmlElement = document.documentElement
    
    if (theme === 'dark') {
      htmlElement.classList.add(DARK_CLASS)
    } else {
      htmlElement.classList.remove(DARK_CLASS)
    }
  }

  /**
   * Sauvegarde le thème dans le localStorage
   */
  const saveTheme = (theme: Theme) => {
    localStorage.setItem(THEME_KEY, theme)
  }

  /**
   * Change le thème actuel
   */
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    applyTheme(theme)
    saveTheme(theme)
  }

  /**
   * Bascule entre les thèmes clair et sombre
   */
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  /**
   * Initialise le thème au chargement
   */
  const initTheme = () => {
    const storedTheme = getStoredTheme()
    currentTheme.value = storedTheme
    applyTheme(storedTheme)
  }

  // Écoute les changements de préférence système
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Ne change que si l'utilisateur n'a pas défini de préférence manuelle
      if (!localStorage.getItem(THEME_KEY)) {
        const newTheme = e.matches ? 'dark' : 'light'
        currentTheme.value = newTheme
        applyTheme(newTheme)
      }
    }

    // Utilise addEventListener pour la compatibilité moderne
    mediaQuery.addEventListener('change', handleChange)
  })

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
    isDark: () => currentTheme.value === 'dark'
  }
}
