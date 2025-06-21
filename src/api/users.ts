import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/users'

export async function loginUser(email: string, password: string) {
  return axios.post(
    `${API_BASE_URL}/login`,
    { email, password },
    {
      withCredentials: true,
    }
  )
}

export async function registerUser(email: string, username: string, password: string) {
  return axios.post(
    `${API_BASE_URL}/register`,
    { email, username, password },
    {
      withCredentials: true,
    }
  )
}
