import axios from 'axios'

export const API_BASE_URL = 'http://localhost:8000/api'

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
