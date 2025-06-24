<template>
  <Menubar :model="menuItems" class="main-menubar">
    <template #start>
      <img src="@/assets/logo.png" alt="SteamKeyVault Logo" height="40" style="margin-right:1rem;" />
    </template>
    <template #end>
      <div v-if="user && user.username" class="user-menu">
        <span class="user-name">{{ user.username }}</span>
        <Button icon="pi pi-sign-out" label="Logout" class="p-button-text p-button-sm" @click="handleLogout" />
      </div>
      <div v-else>
        <Button label="Login" class="p-button-text p-button-sm" @click="goTo('/login')" />
        <Button label="Register" class="p-button-text p-button-sm" @click="goTo('/register')" />
      </div>
    </template>
  </Menubar>
  <main>
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from './stores/user'
import { logoutUser } from './api/auth'
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)

const menuItems = [
  { label: 'Home', icon: 'pi pi-home', command: () => goTo('/') },
  { label: 'About', icon: 'pi pi-info-circle', command: () => goTo('/about') },
  { label: 'My Keys', icon: 'pi pi-key', command: () => goTo('/my-keys'), visible: !!(user.value && user.value.username) }
]

function goTo(path: string) {
  router.push(path)
}

async function handleLogout() {
  await logoutUser()
  router.push('/login')
}
</script>

<style scoped>
.main-menubar {
  border-radius: 0;
  margin-bottom: 2rem;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-name {
  font-weight: 600;
  margin-right: 0.5rem;
}
main {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
</style>
