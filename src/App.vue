<template>
  <Toast ref="toastRef" />
  <Navbar />
  <main>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Toast from 'primevue/toast'
import { ref, onMounted } from 'vue'
import { setGlobalToast } from './utils/toast'
import { useTheme } from './composables/useTheme'

const toastRef = ref<any | null>(null)
const { initTheme } = useTheme()

onMounted(() => {
  if (toastRef.value) setGlobalToast(toastRef.value)
  initTheme()
})
</script>

<style scoped>
</style>
