import { useUserStore } from '../stores/user'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { getCookie } from '../api/apiHelper'

async function ensureUserLoaded() {
  const userStore = useUserStore()
  const isLoggedIn = getCookie('is_logged_in') === 'true'

  if (!userStore.user && isLoggedIn) {
    try {
      await userStore.fetchUser()
    } catch (e) {
      // Session invalide ou expirée
    }
  }
  return userStore
}

export async function requireAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const userStore = await ensureUserLoaded()

  if (userStore.user && userStore.user.username) {
    next()
  } else {
    next('/login')
  }
}

export async function requireAdmin(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const userStore = await ensureUserLoaded()

  if (userStore.user && userStore.user.is_admin) {
    next()
  } else {
    next('/')
  }
}
