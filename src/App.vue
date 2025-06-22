<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useUserStore } from './stores/user'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)

onMounted(async () => {
  await userStore.fetchUser()
})

const handleLogout = async () => {
  await import('./api/auth').then(m => m.logoutUser())
  router.push('/login')
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.png" width="125" height="125" />

    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <template v-if="!user || !user.username">
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/register">Register</RouterLink>
        </template>
        <template v-else>
          <span class="user-info">{{ user.username }}</span>
          <a href="#" @click.prevent="handleLogout">Logout</a>
        </template>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--skv-primary);
  font-weight: bold;
}

nav a.router-link-exact-active:hover {
  background-color: var(--skv-accent);
  color: #fff;
  border-radius: 4px;
  transition: background 0.2s;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--skv-gray);
  color: var(--skv-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

nav a:hover {
  color: var(--skv-primary);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
