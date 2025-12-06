import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/user'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'

export interface UserInfo {
  username: string
  email: string
  email_verified: boolean
  is_admin: boolean
}

export async function fetchUser(): Promise<UserInfo | null> {
  const response = await axios.get<UserInfo>(`${API_BASE_URL}/users/user`, { withCredentials: true })
  return response.data
}

export async function logoutUser(): Promise<void> {
  await axios.post(`${API_BASE_URL}/users/logout`, {}, getAxiosConfig())
  useUserStore().clearUser()
}

export async function loginUser(email: string, password: string) {
  return axios.post(`${API_BASE_URL}/users/login`, { email, password }, getAxiosConfig())
}

export async function registerUser(email: string, username: string, password: string) {
  return axios.post(
    `${API_BASE_URL}/users/register`,
    { email, username, password },
    getAxiosConfig()
  )
}

export async function updateEmail(payload: { email: string }) {
  return axios.put(`${API_BASE_URL}/users/account`, payload, getAxiosConfig())
}

export async function changePassword(payload: { current_password: string; new_password: string }) {
  return axios.post(`${API_BASE_URL}/users/change-password`, payload, getAxiosConfig())
}

export async function fetchUserStats() {
  return axios.get(`${API_BASE_URL}/users/stats`, getAxiosConfig())
}

export async function verifyEmail(token: string) {
  return axios.get(`${API_BASE_URL}/users/verify-email?token=${token}`)
}

export async function confirmEmailChange(token: string) {
  return axios.get(`${API_BASE_URL}/users/confirm-email-change?token=${token}`)
}
