import axios from 'axios'
import { showErrorToast } from '../utils/toast'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export async function getCSRFHeaders(): Promise<{ [key: string]: string }> {
  await axios.get(`${API_BASE_URL}/users/set-csrf-token`, { withCredentials: true })
  const csrftoken = getCookie('csrftoken')
  return { 'X-CSRFToken': csrftoken || '' }
}

export function getAxiosConfig(headers: Record<string, string> = {}) {
  return {
    withCredentials: true,
    headers,
  }
}

// Add a response interceptor to show toasts on errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // try to extract a useful message
    const msg = error?.response?.data?.error || error?.response?.data?.detail || error?.message || 'Unknown error'
    showErrorToast('Error', String(msg))
    return Promise.reject(error)
  }
)
