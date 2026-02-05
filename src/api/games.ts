import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'
import { getKeysForGame } from './keys'

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
  const games = await getUserGames()
  const rows = await Promise.all(
    (games || []).map(async (game: any) => {
      const keys = await getKeysForGame(game.user_game_id)
      const keyValues = (keys || []).map((k: any) => k.key)
      return [game.name, ...keyValues]
    })
  )

  const csvLines = rows.map((row) => row.map(escapeCsvCell).join(';')).join('\n') + '\n'
  const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8' })
  const filename = `user_games_${new Date().toISOString().slice(0, 10)}.csv`
  return { blob, filename }
}

function escapeCsvCell(value: string) {
  const str = String(value ?? '')
  if (/[";\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function updateUserGame(user_game_id: number, payload: { name?: string; steamapp_id?: number | null }) {
  const url = `${API_BASE_URL}/games/${user_game_id}/update`
  return axios.patch(url, payload, getAxiosConfig())
}

export async function removeUserGame(user_game_id: number) {
  const url = `${API_BASE_URL}/games/remove/${user_game_id}`
  return axios.delete(url, getAxiosConfig())
}
