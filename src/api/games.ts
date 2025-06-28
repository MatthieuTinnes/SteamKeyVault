import axios from 'axios'
import { API_BASE_URL, getCookie, getCSRFHeaders, getAxiosConfig } from './apiHelper'

export async function searchSteamGames(query: string) {
  if (!query.trim()) return []
  const res = await fetch(`${API_BASE_URL}/steam/search/?name=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('API error')
  const data = await res.json()
  return data
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
