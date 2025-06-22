import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null)
  function setUser(u: UserInfo | null) {
    user.value = u
  }
  function clearUser() {
    user.value = null
  }
  return { user, setUser, clearUser }
})
