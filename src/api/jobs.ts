import axios from 'axios'
import { API_BASE_URL, getAxiosConfig } from './apiHelper'

export async function createImport(file: File) {
  const form = new FormData()
  form.append('file', file)
  const config = getAxiosConfig()
  const res = await axios.post(`${API_BASE_URL}/jobs/import/create`, form, config)
  return res.data
}

export async function getImportStatus(jobId: number) {
  const res = await axios.get(`${API_BASE_URL}/jobs/import/status/${jobId}/`, getAxiosConfig())
  return res.data
}
