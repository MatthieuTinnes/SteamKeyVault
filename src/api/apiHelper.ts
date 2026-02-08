import axios from 'axios'
import { showErrorToast } from '../utils/toast'
import { i18n } from '@/i18n'

// In development (pnpm run dev), Vite loads VITE_API_BASE_URL from .env.local
// In production (Docker), the placeholder is replaced at container startup by env.sh
// Configure Axios to handle CSRF tokens automatically
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

// Priority:
// 1. Runtime config (window.config) - injected by env.sh in production or config.js in dev
// 2. Build-time env var (import.meta.env) - from .env files
// 3. Fallback default
export const API_BASE_URL = window.config?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
export const TURNSTILE_SITE_KEY = window.config?.VITE_TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

/**
 * Ensures that the CSRF cookie is present.
 * If not, it fetches it from the backend.
 * Axios will automatically pick up the cookie and set the X-CSRFToken header.
 */
export async function ensureCSRFToken(): Promise<void> {
  let csrftoken = getCookie('csrftoken')
  
  if (!csrftoken) {
    await axios.get(`${API_BASE_URL}/users/set-csrf-token`)
  }
}

export function getAxiosConfig() {
  ensureCSRFToken()
  return {
    withCredentials: true
  }
}

// Add a response interceptor to show toasts on errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // try to extract a useful message
    const msg = error?.response?.data?.error || error?.response?.data?.detail || error?.message || i18n.global.t('common.unknownError')
    showErrorToast(i18n.global.t('common.error'), String(msg))
    return Promise.reject(error)
  }
)
