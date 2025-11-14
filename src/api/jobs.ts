import axios from 'axios'
import { API_BASE_URL, getAxiosConfig, getCSRFHeaders } from './apiHelper'

export async function createImport(file: File) {
  const headers = await getCSRFHeaders()
  const form = new FormData()
  form.append('file', file)
  const config = getAxiosConfig(headers)
  const res = await axios.post(`${API_BASE_URL}/jobs/import/create`, form, config)
  return res.data
}

export async function getImportStatus(jobId: number) {
  const headers = await getCSRFHeaders()
  const res = await axios.get(`${API_BASE_URL}/jobs/import/status/${jobId}/`, getAxiosConfig(headers))
  return res.data
}
