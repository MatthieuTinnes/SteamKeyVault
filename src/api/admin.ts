import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'

export interface AdminUser {
  id: number
  username: string
  email: string
  email_verified: boolean
  is_admin: boolean
  date_joined: string
  games_count: number
  keys_count: number
}

export interface AdminStats {
  total_users: number
  verified_users: number
  admin_users: number
  total_games: number
  total_keys: number
}

export interface SteamStats {
  total_steam_apps: number
  total_user_games: number
  unique_games_added: number
}

export async function getAdminStats() {
  return axios.get<AdminStats>(`${API_BASE_URL}/admin/stats`, getAxiosConfig())
}

export async function getAllUsers() {
  return axios.get<{ users: AdminUser[]; total: number }>(
    `${API_BASE_URL}/admin/users`,
    getAxiosConfig()
  )
}

export async function getUserDetails(userId: number) {
  return axios.get<AdminUser>(`${API_BASE_URL}/admin/users/${userId}`, getAxiosConfig())
}

export async function updateUserEmail(userId: number, email: string) {
  return axios.put(
    `${API_BASE_URL}/admin/users/${userId}/email`,
    { email },
    getAxiosConfig()
  )
}

export async function updateUserPassword(userId: number, password: string) {
  return axios.put(
    `${API_BASE_URL}/admin/users/${userId}/password`,
    { password },
    getAxiosConfig()
  )
}

export async function updateUserAdminStatus(userId: number, isAdmin: boolean) {
  return axios.put(
    `${API_BASE_URL}/admin/users/${userId}/admin`,
    { is_admin: isAdmin },
    getAxiosConfig()
  )
}

export async function deleteUser(userId: number) {
  return axios.delete(`${API_BASE_URL}/admin/users/${userId}`, getAxiosConfig())
}

export async function refreshSteamApps() {
  return axios.post(`${API_BASE_URL}/admin/steam/refresh-steam-apps`, {}, getAxiosConfig())
}

export async function getSteamStats() {
  return axios.get<SteamStats>(`${API_BASE_URL}/admin/steam/steam-stats`, getAxiosConfig())
}
