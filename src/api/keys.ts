import axios from 'axios'
import { API_BASE_URL, getAxiosConfig, getCSRFHeaders } from './apiHelper'


export async function getKeysForGame(userGameId: number | string) {
  const headers = await getCSRFHeaders()
  const res = await axios.get(`${API_BASE_URL}/keys/list/${userGameId}`, getAxiosConfig(headers))
  return res.data
}

export async function addKey({ key, user_game_id, current_use }: { key: string, user_game_id: number, current_use?: string }) {
  const headers = await getCSRFHeaders()
  const res = await axios.post(`${API_BASE_URL}/keys/add`, { key, user_game_id, current_use }, getAxiosConfig(headers))
  return res.data
}

export async function updateKey(userGameId: number, key: string, data: { key?: string, used?: boolean, current_use?: string }) {
  const headers = await getCSRFHeaders()
  const res = await axios.put(`${API_BASE_URL}/keys/${userGameId}/update/${key}`, data, getAxiosConfig(headers))
  return res.data
}

export async function removeKey(userGameId: number, key: string) {
  const headers = await getCSRFHeaders()
  const res = await axios.delete(`${API_BASE_URL}/keys/${userGameId}/remove/${key}`, getAxiosConfig(headers))
  return res.data
}
