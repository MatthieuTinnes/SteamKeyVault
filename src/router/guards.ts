import { useUserStore } from '../stores/user'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

async function ensureUserLoaded() {
  const userStore = useUserStore()

  if (!userStore.user) {
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
    const locale = to.params.locale || 'en'
    next(`/${locale}/login`)
  }
}

export async function requireAdmin(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const userStore = await ensureUserLoaded()

  if (userStore.user && userStore.user.is_admin) {
    next()
  } else {
    const locale = to.params.locale || 'en'
    next(`/${locale}/`)
  }
}
