import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'


export async function getKeysForGame(userGameId: number | string) {
  const res = await axios.get(`${API_BASE_URL}/keys/list/${userGameId}`, getAxiosConfig())
  return res.data
}

export async function addKey({ key, user_game_id, current_use }: { key: string, user_game_id: number, current_use?: string }) {
  const res = await axios.post(`${API_BASE_URL}/keys/add`, { key, user_game_id, current_use }, getAxiosConfig())
  return res.data
}

export async function updateKey(userGameId: number, keyId: number | string, data: { key?: string, used?: boolean, current_use?: string }) {
  const res = await axios.patch(`${API_BASE_URL}/keys/${userGameId}/update/${keyId}`, data, getAxiosConfig())
  return res.data
}

export async function removeKey(userGameId: number, keyId: number | string) {
  const res = await axios.delete(`${API_BASE_URL}/keys/${userGameId}/remove/${keyId}`, getAxiosConfig())
  return res.data
}

