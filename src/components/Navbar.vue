<template>
  <nav class="navbar">
    <div class="navbar-left">
      <RouterLink to="/" class="navbar-logo-link">
        <img src="../assets/logo.png" alt="Logo" class="navbar-logo" />
      </RouterLink>
      <span class="navbar-title">SteamKeyVault</span>
    </div>
    <button class="navbar-toggle" @click="toggleMenu" aria-label="Toggle navigation">
      <span :class="{'bar': true, 'open': menuOpen}"></span>
      <span :class="{'bar': true, 'open': menuOpen}"></span>
      <span :class="{'bar': true, 'open': menuOpen}"></span>
    </button>
    <div class="navbar-links" :class="{ open: menuOpen }">
  <Button v-if="isLoggedIn" label="My Keys" class="p-button-lg p-button-outlined" @click="goTo('/my-keys')" />
  <Button v-if="isLoggedIn" label="My Account" class="p-button-lg p-button-outlined" @click="goTo('/my-account')" />
  <Button v-if="isAdmin" label="Admin" icon="pi pi-shield" class="p-button-lg p-button-outlined p-button-danger" @click="goTo('/admin')" />
      <Button v-if="!isLoggedIn" label="Login" class="p-button-lg p-button-outlined" @click="goTo('/login')" />
      <Button v-if="!isLoggedIn" label="Register" class="p-button-lg p-button-outlined" @click="goTo('/register')" />
      <Button v-if="isLoggedIn" icon="pi pi-sign-out" label="Logout" class="p-button-lg p-button-outlined" @click="handleLogout" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { logoutUser } from '../api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoggedIn = computed(() => !!userStore.user && !!userStore.user.username)
const isAdmin = computed(() => !!userStore.user && !!userStore.user.is_admin)
const menuOpen = ref(false)

function goTo(path: string) {
  menuOpen.value = false
  router.push(path)
}
function isActive(path: string) {
  return route.path === path
}
async function handleLogout() {
  await logoutUser()
  router.push('/login')
  menuOpen.value = false
}
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<style scoped>
.navbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1rem, 2vw, 1.5rem) clamp(1rem, 4vw, 2.5rem);
  box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.04);
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
  letter-spacing: -0.0625rem;
}
.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
}
.bar {
  width: 2rem;
  height: 0.1875rem;
  background: #222;
  margin: 0.25rem 0;
  border-radius: 0.125rem;
  transition: all 0.3s;
  display: block;
}
.navbar-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s;
}
.navbar-links a {
  color: #222;
  font-weight: 500;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.2s;
  cursor: pointer;
}
.navbar-links a.active, .navbar-links a:hover {
  background: #e5e7eb;
}
@media (max-width: 56.25rem) {
  .navbar {
    flex-wrap: wrap;
    padding: clamp(0.75rem, 2vw, 1rem);
  }
  .navbar-toggle {
    display: flex;
  }
  .navbar-links {
    flex-direction: column;
    align-items: flex-start;
    position: absolute;
    top: 100%;
    right: 0;
    background: #fff;
    box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.08);
    width: min(85vw, 13.75rem);
    padding: 1.5rem 1rem;
    gap: 1rem;
    border-radius: 0 0 1rem 1rem;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.625rem);
    transition: all 0.3s;
    z-index: 1001;
  }
  .navbar-links.open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
}
</style>
