<template>
  <WindmillNavbar />
  <main>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import WindmillNavbar from './components/Navbar.vue'
</script>

<style scoped>
</style>
