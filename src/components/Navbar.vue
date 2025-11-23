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
      <Button v-if="isLoggedIn" label="My Keys" icon="pi pi-key" class="p-button-lg p-button" @click="goTo('/my-keys')" />
      <Button v-if="!isLoggedIn" label="Login" class="p-button-lg p-button" @click="goTo('/login')" />
      <Button v-if="!isLoggedIn" label="Register" class="p-button-lg p-button" @click="goTo('/register')" />
      
      <div v-if="isLoggedIn" class="user-menu-wrapper">
        <Button 
          :label="userStore.user?.username" 
          icon="pi pi-user" 
          class="p-button-lg p-button-outlined user-menu-button"
          @click="toggleUserMenu"
          aria-haspopup="true"
          :aria-expanded="userMenuOpen"
        />
        <Transition name="dropdown">
          <div v-if="userMenuOpen" class="user-menu-dropdown">
            <div class="user-menu-item" @click="goTo('/my-account')">
              <i class="pi pi-user"></i>
              <span>My Account</span>
            </div>
            <div v-if="isAdmin" class="user-menu-item admin-item" @click="goTo('/admin')">
              <i class="pi pi-shield"></i>
              <span>Admin</span>
            </div>
            <div class="user-menu-divider"></div>
            <ThemeToggle />
            <div class="user-menu-divider"></div>
            <div class="user-menu-item logout-item" @click="handleLogout">
              <i class="pi pi-sign-out"></i>
              <span>Logout</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import ThemeToggle from './ThemeToggle.vue';
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
const userMenuOpen = ref(false)

function goTo(path: string) {
  menuOpen.value = false
  userMenuOpen.value = false
  router.push(path)
}
function isActive(path: string) {
  return route.path === path
}
async function handleLogout() {
  await logoutUser()
  router.push('/login')
  menuOpen.value = false
  userMenuOpen.value = false
}
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}
</script>

<style scoped>
.navbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem clamp(1rem, 4vw, 2.5rem);
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg-primary);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.my-app-dark .navbar {
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.4);
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
  color: var(--text-primary);
  letter-spacing: -0.0625rem;
  transition: color 0.3s ease;
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
  background: var(--text-primary);
  margin: 0.25rem 0;
  border-radius: 0.125rem;
  transition: all 0.3s;
  display: block;
}
.navbar-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}
.navbar-links a {
  color: var(--text-primary);
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
}
.navbar-links a.active, .navbar-links a:hover {
  background: var(--bg-tertiary);
  transform: translateY(-0.125rem);
}

.user-menu-wrapper {
  position: relative;
}

.user-menu-button {
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s ease !important;
}

.user-menu-button:hover {
  transform: translateY(-0.125rem);
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  background: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  min-width: 14rem;
  overflow: hidden;
  z-index: 1002;
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9375rem;
}

.user-menu-item i {
  font-size: 1.125rem;
  width: 1.25rem;
  text-align: center;
}

.user-menu-item:hover {
  background: var(--bg-tertiary);
  padding-left: 1.5rem;
}

.user-menu-item.admin-item {
  color: #059669;
}

.user-menu-item.admin-item:hover {
  background: #f0fdf4;
  color: #047857;
}

.user-menu-item.logout-item {
  color: #dc2626;
}

.user-menu-item.logout-item:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.user-menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
  transition: background-color 0.3s ease;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

@media (max-width: 56.25rem) {
  .navbar {
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
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
    background: var(--bg-primary);
    box-shadow: var(--shadow-md);
    width: min(85vw, 15rem);
    padding: 1.5rem 1rem;
    gap: 0.75rem;
    border-radius: 0 0 0.5rem 0.5rem;
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
  .navbar-links a {
    width: 100%;
  }
  
  .user-menu-wrapper {
    width: 100%;
  }
  
  .user-menu-button {
    width: 100%;
    justify-content: flex-start !important;
  }
  
  .user-menu-dropdown {
    position: static;
    box-shadow: var(--shadow-sm);
    margin-top: 0.5rem;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
  }
  
  .user-menu-item:hover {
    padding-left: 1.25rem;
  }
}
</style>
