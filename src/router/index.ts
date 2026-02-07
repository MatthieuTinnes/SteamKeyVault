import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { requireAuth, requireAdmin } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: '/my-keys',
      name: 'my-keys',
      component: () => import('../views/MyKeysView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/my-account',
      name: 'my-account',
      component: () => import('../views/MyAccountView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/import',
      name: 'import',
      component: () => import('../views/ImportView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/VerifyEmailView.vue'),
    },
    {
      path: '/confirm-email-change',
      name: 'confirm-email-change',
      component: () => import('../views/ConfirmEmailChangeView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin/steam',
      name: 'admin-steam',
      component: () => import('../views/AdminSteamSyncView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: '/admin/logs',
      name: 'admin-logs',
      component: () => import('../views/AdminActionLogsView.vue'),
      beforeEnter: requireAdmin,
    },
  ],
})

export default router
