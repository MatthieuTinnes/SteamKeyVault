<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="../assets/logo.png" alt="Logo" class="navbar-logo" />
      <span class="navbar-title">SteamKeyVault</span>
    </div>
    <button class="navbar-toggle" @click="toggleMenu" aria-label="Toggle navigation">
      <span :class="{'bar': true, 'open': menuOpen}"></span>
      <span :class="{'bar': true, 'open': menuOpen}"></span>
      <span :class="{'bar': true, 'open': menuOpen}"></span>
    </button>
    <div class="navbar-links" :class="{ open: menuOpen }">
      <a @click.prevent="goTo('/my-keys')" v-if="isLoggedIn" :class="{active: isActive('/my-keys')}">My Keys</a>
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
  height: 3px;
  background: #222;
  margin: 0.25rem 0;
  border-radius: 2px;
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
  border-radius: 4px;
  transition: background 0.2s;
  cursor: pointer;
}
.navbar-links a.active, .navbar-links a:hover {
  background: #e5e7eb;
}
@media (max-width: 900px) {
  .navbar {
    flex-wrap: wrap;
    padding: 1rem 1rem 1rem 1rem;
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    width: 220px;
    padding: 1.5rem 1rem;
    gap: 1rem;
    border-radius: 0 0 1rem 1rem;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px);
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
