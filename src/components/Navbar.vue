<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="../assets/logo.png" alt="Logo" class="navbar-logo" />
      <span class="navbar-title">SteamKeyVault</span>
    </div>
    <div class="navbar-links">
      <a @click.prevent="goTo('/')" :class="{active: isActive('/')}" >Home</a>
      <a @click.prevent="goTo('/about')" :class="{active: isActive('/about')}">About</a>
      <a @click.prevent="goTo('/my-keys')" v-if="isLoggedIn" :class="{active: isActive('/my-keys')}">My Keys</a>
      <Button v-if="!isLoggedIn" label="Login" class="p-button-text p-button-sm" @click="goTo('/login')" />
      <Button v-if="!isLoggedIn" label="Register" class="p-button-text p-button-sm" @click="goTo('/register')" />
      <Button v-if="isLoggedIn" icon="pi pi-sign-out" label="Logout" class="p-button-text p-button-sm" @click="handleLogout" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { logoutUser } from '../api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.user && !!userStore.user.username)

function goTo(path: string) {
  router.push(path)
}
function isActive(path: string) {
  return route.path === path
}
async function handleLogout() {
  await logoutUser()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2.5rem 1.5rem 2.5rem;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 1000;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.navbar-logo {
  height: 3rem;
}
.navbar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -1px;
}
.navbar-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.navbar-links a {
  color: #222;
  font-weight: 500;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
  cursor: pointer;
}
.navbar-links a.active, .navbar-links a:hover {
  background: #e5e7eb;
}
</style>
