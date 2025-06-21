import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/users'

/*export async function setCsrfToken() {
  const response = await axios.get(`${API_BASE_URL}/set-csrf-token`)
  axios.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken
}*/

export async function loginUser(email, password) {
  return axios.post(
    `${API_BASE_URL}/login`,
    { email, password },
    {
      withCredentials: true,
    }	
  )
}
