import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'

export interface UserInfo {
  username: string
  email: string
}

const API_BASE_URL = 'http://localhost:8000/api/users'
const user: Ref<UserInfo | null> = ref(null)

// Helper to get CSRF token from cookies
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

export async function fetchUser(): Promise<UserInfo | null> {
  try {
    const response = await axios.get<UserInfo>(`${API_BASE_URL}/user`, { withCredentials: true })
    user.value = response.data
    return user.value
  } catch {
    user.value = null
    return null
  }
}

export async function logoutUser(): Promise<void> {
  await axios.get(`${API_BASE_URL}/set-csrf-token`, { withCredentials: true })
  const csrftoken = getCookie('csrftoken')
  await axios.post(
    `${API_BASE_URL}/logout`,
    {},
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrftoken,
      },
    }
  )
  user.value = null
}

export function useUser(): Ref<UserInfo | null> {
  return user
}

export async function loginUser(email: string, password: string) {
  return axios.post(
    `${API_BASE_URL}/login`,
    { email, password },
    {
      withCredentials: true,
    }
  )
}

export async function registerUser(email: string, username: string, password: string) {
  return axios.post(
    `${API_BASE_URL}/register`,
    { email, username, password },
    {
      withCredentials: true,
    }
  )
}
