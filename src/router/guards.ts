import { useUserStore } from '../stores/user'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export function requireAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const userStore = useUserStore()
  if (userStore.user && userStore.user.username) {
    next()
  } else {
    next('/login')
  }
}

export function requireAdmin(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const userStore = useUserStore()
  if (userStore.user && userStore.user.is_admin) {
    next()
  } else {
    next('/')
  }
}
