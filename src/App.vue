<template>
  <Toast ref="toastRef" />
  <ConfirmDialog />
  <Navbar />
  <main>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { ref, onMounted } from 'vue'
import { setGlobalToast } from './utils/toast'
import { useTheme } from './composables/useTheme'
import { useUserStore } from './stores/user'
import { getCookie } from './api/apiHelper'

const toastRef = ref<any | null>(null)
const { initTheme } = useTheme()
const userStore = useUserStore()

onMounted(async () => {
  if (toastRef.value) setGlobalToast(toastRef.value)
  initTheme()
  
  const isLoggedIn = getCookie('sessionid') !== null

  // Si l'utilisateur n'est pas déjà chargé (par exemple par le router guard), on tente de le récupérer
  if (!userStore.user && isLoggedIn) {
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
</style>
