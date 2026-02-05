import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'
import { useCryptoStore } from '@/stores/crypto'
import { encryptValue } from '@/utils/crypto'

export async function createImport(file: File) {
  const store = useCryptoStore()
  if (!store.masterKeyBytes) {
    throw new Error('Missing master key. Please log in again.')
  }

  const text = await file.text()
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  const encryptedRows = await Promise.all(
    lines.map(async (line) => {
      const cells = parseCsvLine(line)
      if (cells.length === 0) return ''
      const [gameName, ...keys] = cells
      const encryptedKeys = await Promise.all(
        keys.map(async (key) => (key.trim() ? await encryptValue(key, store.masterKeyBytes as Uint8Array) : key))
      )
      const row = [gameName, ...encryptedKeys]
      return row.map(escapeCsvCell).join(';')
    })
  )
  const payload = encryptedRows.join('\n') + '\n'
  const encryptedFile = new File([payload], file.name, { type: file.type || 'text/csv' })

  const form = new FormData()
  form.append('file', encryptedFile)
  const config = getAxiosConfig()
  const res = await axios.post(`${API_BASE_URL}/jobs/import/create`, form, config)
  return res.data
}

export async function getImportStatus(jobId: number) {
  const res = await axios.get(`${API_BASE_URL}/jobs/import/status/${jobId}/`, getAxiosConfig())
  return res.data
}

function escapeCsvCell(value: string) {
  const str = String(value ?? '')
  if (/[";\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function parseCsvLine(line: string) {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ';' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }

    current += char
  }

  result.push(current)
  return result
}
