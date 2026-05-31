import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'

export interface AdminUser {
  id: number
  username: string
  email: string
  email_verified: boolean
  is_admin: boolean
  date_joined: string
  last_login: string | null
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

export interface ActionLogEntry {
  id: number
  user_id: number
  username: string
  email: string
  action_type: string
  created_at: string
  ip_address: string | null
  user_agent: string
  metadata: Record<string, unknown> | null
}

export interface ActionLogStats {
  total_actions: number
  logins: number
  registrations: number
  password_changes: number
  email_changes: number
  unique_users: number
  start: string
  end: string
}

export interface VersionInfo {
  commit_hash: string
  deploy_date: string
}

export async function getAdminStats() {
  return axios.get<AdminStats>(`${API_BASE_URL}/admin/stats`, getAxiosConfig())
}

export async function getBackendVersion() {
  return axios.get<VersionInfo>(`${API_BASE_URL}/admin/version`, getAxiosConfig())
}

export async function getAllUsers(limit = 25, offset = 0, search?: string) {
  return axios.get<{ users: AdminUser[]; total: number }>(
    `${API_BASE_URL}/admin/users`,
    {
      ...getAxiosConfig(),
      params: { limit, offset, ...(search ? { search } : {}) },
    }
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

export async function deleteUserGamesAndKeys(userId: number) {
  return axios.delete(`${API_BASE_URL}/admin/users/${userId}/games-keys`, getAxiosConfig())
}

export async function refreshSteamApps() {
  return axios.post(`${API_BASE_URL}/admin/steam/refresh-steam-apps`, {}, getAxiosConfig())
}

export async function getSteamStats() {
  return axios.get<SteamStats>(`${API_BASE_URL}/admin/steam/steam-stats`, getAxiosConfig())
}

export async function getActionLogStats(params?: {
  start?: string
  end?: string
  period_hours?: number
}) {
  return axios.get<ActionLogStats>(`${API_BASE_URL}/admin/action-logs/stats`, {
    ...getAxiosConfig(),
    params,
  })
}

export async function getActionLogs(params?: {
  start?: string
  end?: string
  period_hours?: number
  action_type?: string
  user_query?: string
  limit?: number
  offset?: number
}) {
  return axios.get<{ logs: ActionLogEntry[]; total: number; start: string; end: string }>(
    `${API_BASE_URL}/admin/action-logs`,
    {
      ...getAxiosConfig(),
      params,
    }
  )
}
