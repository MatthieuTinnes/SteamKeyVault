import axios from 'axios'
import { showErrorToast } from '../utils/toast'
import { i18n } from '@/i18n'

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "__API_BASE_URL__";
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "__TURNSTILE_SITE_KEY__";

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
