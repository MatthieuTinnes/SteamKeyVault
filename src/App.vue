<template>
  <Toast ref="toastRef" />
  <ConfirmDialog />
  <Navbar />
  <main>
    <RouterView />
  </main>
  <footer v-if="showFooter" class="app-footer">
    <RouterLink to="/terms" class="footer-link">{{ t('footer.terms') }}</RouterLink>
    <span class="footer-sep">·</span>
    <RouterLink to="/privacy" class="footer-link">{{ t('footer.privacy') }}</RouterLink>
  </footer>
</template>

<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { ref, computed, onMounted } from 'vue'
import { setGlobalToast } from './utils/toast'
import { useTheme } from './composables/useTheme'
import { useUserStore } from './stores/user'
import { getCookie } from './api/apiHelper'
import { useI18n } from 'vue-i18n'
import { setLocale, SUPPORTED_LOCALES } from './i18n'

const { t } = useI18n()
const route = useRoute()

const FOOTER_ROUTES = new Set(['home', 'login', 'register', 'documentation'])
const showFooter = computed(() => FOOTER_ROUTES.has(route.name as string))

const toastRef = ref<any | null>(null)
const { initTheme } = useTheme()
const userStore = useUserStore()

onMounted(async () => {
  if (toastRef.value) setGlobalToast(toastRef.value)
  initTheme()

  // Apply locale from URL ?lang= param if present and supported
  const langParam = route.query.lang as string | undefined
  if (langParam && (SUPPORTED_LOCALES as readonly string[]).includes(langParam)) {
    setLocale(langParam as 'en' | 'fr')
  }

  const hasSession = getCookie('sessionid') !== null

  // Si l'utilisateur n'est pas déjà chargé (par exemple par le router guard), on tente de le récupérer
  if (!userStore.user && hasSession) {
    try {
      await userStore.fetchUser()
    } catch (error) {
      // User is not logged in or session expired
      console.debug('No active session found')
    }
  }
})
</script>

<style scoped>
.app-footer {
  width: 100%;
  text-align: center;
  padding: 1.25rem 1rem;
  font-size: 0.85rem;
  opacity: 0.7;
  border-top: 1px solid var(--p-surface-border);
  margin-top: 2rem;
}

.footer-link {
  color: inherit;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-sep {
  margin: 0 0.5rem;
  opacity: 0.4;
}
</style>
