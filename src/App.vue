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

const toastRef = ref<any | null>(null)
onMounted(() => {
  if (toastRef.value) setGlobalToast(toastRef.value)
})
</script>

<style scoped>
</style>
