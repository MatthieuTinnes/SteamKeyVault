import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'

export interface UserInfo {
  username: string
  email: string
}

const user: Ref<UserInfo | null> = ref(null)

export async function fetchUser(): Promise<UserInfo | null> {
  try {
    const response = await axios.get<UserInfo>('http://localhost:8000/api/users/user', { withCredentials: true })
    user.value = response.data
    return user.value
  } catch {
    user.value = null
    return null
  }
}

export async function logoutUser(): Promise<void> {
  await axios.post('http://localhost:8000/api/users/logout', {}, { withCredentials: true })
  user.value = null
}

export function useUser(): Ref<UserInfo | null> {
  return user
}
