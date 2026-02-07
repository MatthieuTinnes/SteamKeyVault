import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'
import { useCryptoStore } from '@/stores/crypto'
import { decryptValue, encryptValue } from '@/utils/crypto'
import { handleMissingMasterKey } from '@/utils/missingMasterKey'

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
  const store = useCryptoStore()
  if (!store.masterKeyBytes) {
    await handleMissingMasterKey()
    throw new Error('Missing master key. Please log in again.')
  }

  const res = await axios.get(`${API_BASE_URL}/games/export_csv`, { ...getAxiosConfig(), responseType: 'blob' })
  const csvText = await res.data.text()
  const rows = parseCsv(csvText)

  const decryptedRows = await Promise.all(
    rows.map(async (row) => {
      const [gameName, ...keys] = row
      const decryptedKeys = await Promise.all(
        keys.map(async (keyValue) => {
          const rawKey = String(keyValue ?? '')
          if (!rawKey.trim()) return rawKey
          return decryptValue(rawKey, store.masterKeyBytes as Uint8Array)
        })
      )
      return [gameName, ...decryptedKeys]
    })
  )

  const csvLines = decryptedRows.map((row) => row.map(escapeCsvCell).join(';')).join('\n') + '\n'
  const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8' })
  const headerFilename = res.headers?.['x-filename'] || res.headers?.['X-Filename']
  const filename = headerFilename || `user_games_${new Date().toISOString().slice(0, 10)}.csv`
  return { blob, filename }
}

function escapeCsvCell(value: string) {
  const str = String(value ?? '')
  if (/[";\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function parseCsv(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.length > 0)
  return lines.map((line) => parseCsvLine(line))
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i += 1
        continue
      }
      if (char === '"') {
        inQuotes = false
        continue
      }
      current += char
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ';') {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  cells.push(current)
  return cells
}

export async function exportUserGamesJson() {
  const url = `${API_BASE_URL}/games/export_json`
  const res = await axios.get(url, { ...getAxiosConfig(), responseType: 'blob' })
  return res
}

export async function importUserGamesJson(file: File) {
  const store = useCryptoStore()
  if (!store.masterKeyBytes) {
    await handleMissingMasterKey()
    throw new Error('Missing master key. Please log in again.')
  }

  const rawText = await file.text()
  let payload: any
  try {
    payload = JSON.parse(rawText)
  } catch (e) {
    throw new Error('Invalid JSON file')
  }

  const games = Array.isArray(payload?.games) ? payload.games : []
  const encryptedGames = await Promise.all(
    games.map(async (game: any) => {
      const keys = Array.isArray(game?.keys) ? game.keys : []
      const encryptedKeys = await Promise.all(
        keys.map(async (keyEntry: any) => {
          const keyValue = String(keyEntry?.key ?? '')
          if (!keyValue.trim()) return keyEntry
          return {
            ...keyEntry,
            key: await encryptValue(keyValue, store.masterKeyBytes as Uint8Array)
          }
        })
      )
      return {
        ...game,
        keys: encryptedKeys
      }
    })
  )

  const encryptedPayload = {
    ...payload,
    games: encryptedGames
  }

  const encryptedFile = new File([
    JSON.stringify(encryptedPayload)
  ], file.name, { type: file.type || 'application/json' })

  const url = `${API_BASE_URL}/games/import_json`
  const formData = new FormData()
  formData.append('file', encryptedFile)
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
