import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/user'

export interface UserInfo {
  username: string
  email: string
}

const API_BASE_URL = 'http://localhost:8000/api/users'



export async function fetchUser(): Promise<UserInfo | null> {
  const response = await axios.get<UserInfo>(`${API_BASE_URL}/user`, { withCredentials: true })
  return response.data
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
  useUserStore().clearUser()
}

export async function loginUser(email: string, password: string) {
  await axios.get(`${API_BASE_URL}/set-csrf-token`, { withCredentials: true })
  const csrftoken = getCookie('csrftoken')
  return axios.post(
    `${API_BASE_URL}/login`,
    { email, password },
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrftoken,
      },
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
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}
