import axios from 'axios'
import { useUserStore } from '../stores/user'
import { useCryptoStore } from '@/stores/crypto'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'

export interface UserInfo {
  username: string
  email: string
  email_verified: boolean
  is_admin: boolean
  preferred_language?: string
}

export interface LoginResponse {
  wrapped_mk_password: string
  mk_salt: string
  kdf_iterations: number
  kdf_hash: string
}

export interface ResetPasswordInfoResponse {
  wrapped_mk_recovery: string
  rk_salt: string
  mk_salt: string
  kdf_iterations: number
  kdf_hash: string
}

export async function fetchUser(): Promise<UserInfo | null> {
  const response = await axios.get<UserInfo>(`${API_BASE_URL}/users/user`, { withCredentials: true })
  return response.data
}

export async function logoutUser(): Promise<void> {
  await axios.post(`${API_BASE_URL}/users/logout`, {}, getAxiosConfig())
  useUserStore().clearUser()
  useCryptoStore().clearMasterKey()
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>(`${API_BASE_URL}/users/login`, { email, password }, getAxiosConfig())
  return res.data
}

export async function registerUser(payload: {
  email: string
  username: string
  password: string
  preferred_language?: string
  wrapped_mk_password: string
  wrapped_mk_recovery: string
  mk_salt: string
  rk_salt: string
  kdf_iterations: number
  kdf_hash: string
  turnstile_token?: string
}) {
  return axios.post(`${API_BASE_URL}/users/register`, payload, getAxiosConfig())
}

export async function updateEmail(payload: { email: string }) {
  return axios.put(`${API_BASE_URL}/users/account`, payload, getAxiosConfig())
}

export async function updatePreferences(payload: { preferred_language: string }) {
  return axios.put(`${API_BASE_URL}/users/preferences`, payload, getAxiosConfig())
}

export async function changePassword(payload: { current_password: string; new_password: string; wrapped_mk_password: string }) {
  return axios.post(`${API_BASE_URL}/users/change-password`, payload, getAxiosConfig())
}

export async function fetchUserStats() {
  return axios.get(`${API_BASE_URL}/users/stats`, getAxiosConfig())
}

export async function verifyEmail(token: string) {
  return axios.get(`${API_BASE_URL}/users/verify-email?token=${token}`)
}

export async function resendVerificationEmail() {
  return axios.post(`${API_BASE_URL}/users/resend-verification-email`, {}, getAxiosConfig())
}

export async function confirmEmailChange(token: string) {
  return axios.get(`${API_BASE_URL}/users/confirm-email-change?token=${token}`)
}

export async function forgotPassword(email: string, turnstileToken?: string) {
  return axios.post(`${API_BASE_URL}/users/forgot-password`, { email, turnstile_token: turnstileToken }, getAxiosConfig())
}

export async function fetchResetPasswordInfo(token: string): Promise<ResetPasswordInfoResponse> {
  const res = await axios.get<ResetPasswordInfoResponse>(`${API_BASE_URL}/users/reset-password-info?token=${token}`)
  return res.data
}

export async function resetPassword(payload: { token: string; new_password: string; wrapped_mk_password: string }) {
  return axios.post(`${API_BASE_URL}/users/reset-password`, payload, getAxiosConfig())
}
