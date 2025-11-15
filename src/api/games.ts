import axios from 'axios'
import { API_BASE_URL, getCookie, getCSRFHeaders, getAxiosConfig } from './apiHelper'

export async function searchSteamGames(query: string) {
  if (!query.trim()) return []
  const headers = await getCSRFHeaders()
    return axios.get(`${API_BASE_URL}/steam/search/?name=${encodeURIComponent(query)}`, getAxiosConfig(headers))
    .then(response => response.data);
}

export async function addUserGame({ name, steamappid }: { name: string; steamappid?: number }) {
  const headers = await getCSRFHeaders()
  // send backend field name as steamapp_id when present
  const payload: any = { name }
  if (typeof steamappid !== 'undefined') payload.steamapp_id = steamappid
  return axios.post(`${API_BASE_URL}/games/add`, payload, getAxiosConfig(headers))
}

export async function getUserGames() {
  const headers = await getCSRFHeaders()
  const res = await axios.get(`${API_BASE_URL}/games/list`, getAxiosConfig(headers))
  return res.data
}

export async function getSteamAppDetails(appid: number, lang?: string) {
  const headers = await getCSRFHeaders()
  const langParam = lang ? `?lang=${encodeURIComponent(lang)}` : ''
  const url = `${API_BASE_URL}/steam/appdetails/${appid}/${langParam}`
  return axios.get(url, getAxiosConfig(headers)).then(response => response.data)
}

export async function exportUserGamesCsv() {
  const headers = await getCSRFHeaders()
  const url = `${API_BASE_URL}/games/export_csv`
  // Request as blob so we can trigger download
  const res = await axios.get(url, { ...getAxiosConfig(headers), responseType: 'blob' })
  return res
}

export async function updateUserGame(user_game_id: number, payload: { name?: string; steamapp_id?: number | null }) {
  const headers = await getCSRFHeaders()
  const url = `${API_BASE_URL}/games/${user_game_id}/update`
  return axios.patch(url, payload, getAxiosConfig(headers))
}
