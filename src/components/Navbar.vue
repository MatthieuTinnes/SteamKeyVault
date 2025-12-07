<template>
  <nav class="navbar">
    <div class="navbar-left">
      <RouterLink to="/" class="navbar-logo-link">
        <img src="../assets/logo.png" alt="Logo" class="navbar-logo" />
        <span class="navbar-title">SteamKeyVault</span>
      </RouterLink>
    </div>

    <Button 
      :icon="menuOpen ? 'pi pi-times' : 'pi pi-bars'" 
      text 
      rounded 
      aria-label="Toggle navigation"
      class="navbar-toggle-btn"
      @click="toggleMenu"
    />

    <div class="navbar-links" :class="{ open: menuOpen }">
      <Button 
        v-if="isLoggedIn" 
        label="My Keys" 
        icon="pi pi-key" 
        text
        class="nav-item"
        @click="goTo('/my-keys')" 
      />
      
      <template v-if="!isLoggedIn">
        <Button label="Login" text class="nav-item" @click="goTo('/login')" />
        <Button label="Register" class="nav-item" @click="goTo('/register')" />
      </template>
      
      <div v-if="isLoggedIn" class="user-menu-wrapper">
        <Button 
          :label="userStore.user?.username" 
          icon="pi pi-user" 
          outlined
          class="user-menu-button"
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
  cookieStore.delete('csrftoken')
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
  padding: 1rem 2rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg-primary);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  height: 5rem;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-logo-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
}

.navbar-logo {
  height: 2.5rem;
  width: auto;
}

.navbar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.navbar-toggle-btn {
  display: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu-wrapper {
  position: relative;
}

.user-menu-button {
  font-weight: 600 !important;
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-lg);
  min-width: 14rem;
  overflow: hidden;
  z-index: 1002;
  border: 1px solid var(--border-color);
  padding: 0.5rem 0;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9375rem;
}

.user-menu-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
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

@media (max-width: 768px) {
  .navbar {
    padding: 0.75rem 1rem;
  }

  .navbar-toggle-btn {
    display: inline-flex;
  }

  .navbar-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    background: var(--bg-primary);
    padding: 1rem;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px);
    transition: all 0.3s ease;
  }

  .navbar-links.open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .nav-item {
    width: 100%;
    justify-content: flex-start;
  }

  .user-menu-wrapper {
    width: 100%;
  }

  .user-menu-button {
    width: 100%;
    justify-content: flex-start;
  }

  .user-menu-dropdown {
    position: static;
    width: 100%;
    box-shadow: none;
    border: 1px solid var(--border-color);
    margin-top: 0.5rem;
    background: var(--bg-secondary);
  }
}
</style>
