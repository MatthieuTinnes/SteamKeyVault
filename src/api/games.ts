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
  return axios.post(`${API_BASE_URL}/games/add`, { name, steamappid }, getAxiosConfig(headers))
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
