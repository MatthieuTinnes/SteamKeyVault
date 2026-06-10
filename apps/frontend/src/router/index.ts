import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { requireAuth, requireAdmin, redirectIfAuthenticated } from './guards'
import { i18n, SUPPORTED_LOCALES, getInitialLocale } from '../i18n'
import type { RouteLocationNormalized } from 'vue-router'
import { setLocale } from '../i18n'

const localeChildren = [
    {
      path: '',
      name: 'home',
      component: HomeView,
    },
    {
      path: 'about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: 'documentation',
      name: 'documentation',
      component: () => import('../views/DocumentationView.vue'),
    },
    {
      path: 'login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: 'register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: 'forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: 'reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: 'my-keys',
      name: 'my-keys',
      component: () => import('../views/MyKeysView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: 'my-account',
      name: 'my-account',
      component: () => import('../views/MyAccountView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: 'import',
      name: 'import',
      component: () => import('../views/ImportView.vue'),
      beforeEnter: requireAuth,
    },
    {
      path: 'verify-email',
      name: 'verify-email',
      component: () => import('../views/VerifyEmailView.vue'),
    },
    {
      path: 'share/:token',
      name: 'share-key',
      component: () => import('../views/ShareKeyView.vue'),
    },
    {
      path: 'confirm-email-change',
      name: 'confirm-email-change',
      component: () => import('../views/ConfirmEmailChangeView.vue'),
    },
    {
      path: 'admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: 'admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: 'admin/steam',
      name: 'admin-steam',
      component: () => import('../views/AdminSteamSyncView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: 'admin/logs',
      name: 'admin-logs',
      component: () => import('../views/AdminActionLogsView.vue'),
      beforeEnter: requireAdmin,
    },
    {
      path: 'terms',
      name: 'terms',
      component: () => import('../views/TermsOfServiceView.vue'),
    },
    {
      path: 'privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyPolicyView.vue'),
    },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:locale(en|fr)',
      children: localeChildren,
    },
    {
      path: '/',
      redirect: () => `/${getInitialLocale()}/`,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: (to) => {
        const locale = i18n.global.locale.value || getInitialLocale()
        return `/${locale}${to.path}`
      },
    },
  ],
})

// Sync i18n locale from URL and handle ?lang= backward compatibility
router.beforeEach((to: RouteLocationNormalized) => {
  const locale = to.params.locale as string
  if (locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    if (i18n.global.locale.value !== locale) {
      setLocale(locale as 'en' | 'fr')
    }
  }

  // Backward compatibility: redirect ?lang=xx to /:lang/ path
  const langQuery = to.query.lang as string | undefined
  if (langQuery && (SUPPORTED_LOCALES as readonly string[]).includes(langQuery)) {
    const { lang, ...restQuery } = to.query
    const newPath = to.path.replace(/^\/(en|fr)/, `/${langQuery}`)
    return { path: newPath, query: restQuery }
  }
})

export default router
