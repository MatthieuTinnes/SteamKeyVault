import axios from 'axios'
import { API_BASE_URL, getCookie, getAxiosConfig } from './apiHelper'

export async function searchSteamGames(query: string) {
  if (!query.trim()) return []
    return axios.get(`${API_BASE_URL}/steam/search/?name=${encodeURIComponent(query)}`, getAxiosConfig())
    .then(response => response.data);
}

export async function addUserGame({ name, steamappid }: { name: string; steamappid?: number }) {
  // send backend field name as steamapp_id when present
  const payload: any = { name }
  if (typeof steamappid !== 'undefined') payload.steamapp_id = steamappid
  return axios.post(`${API_BASE_URL}/games/add`, payload, getAxiosConfig())
}

export async function getUserGames() {
  const res = await axios.get(`${API_BASE_URL}/games/list`, getAxiosConfig())
  return res.data
}

export async function getSteamAppDetails(appid: number, lang?: string) {
  const langParam = lang ? `?lang=${encodeURIComponent(lang)}` : ''
  const url = `${API_BASE_URL}/steam/appdetails/${appid}/${langParam}`
  return axios.get(url, getAxiosConfig()).then(response => response.data)
}

export async function exportUserGamesCsv() {
  const url = `${API_BASE_URL}/games/export_csv`
  // Request as blob so we can trigger download
  const res = await axios.get(url, { ...getAxiosConfig(), responseType: 'blob' })
  return res
}

export async function exportUserGamesJson() {
  const url = `${API_BASE_URL}/games/export_json`
  const res = await axios.get(url, { ...getAxiosConfig(), responseType: 'blob' })
  return res
}

export async function importUserGamesJson(file: File) {
  const url = `${API_BASE_URL}/games/import_json`
  const formData = new FormData()
  formData.append('file', file)
  return axios.post(url, formData, {
    ...getAxiosConfig(),
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export async function updateUserGame(user_game_id: number, payload: { name?: string; steamapp_id?: number | null }) {
  const url = `${API_BASE_URL}/games/${user_game_id}/update`
  return axios.patch(url, payload, getAxiosConfig())
}

export async function removeUserGame(user_game_id: number) {
  const url = `${API_BASE_URL}/games/remove/${user_game_id}`
  return axios.delete(url, getAxiosConfig())
}
