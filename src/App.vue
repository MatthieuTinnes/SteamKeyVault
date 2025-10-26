<template>
  <Toast />
  <Navbar />
  <main>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Toast from 'primevue/toast'
</script>

<style scoped>
</style>
