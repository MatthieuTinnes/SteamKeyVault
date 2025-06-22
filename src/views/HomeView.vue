<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

function goToMyKeys() {
  if (userStore.user && userStore.user.username) {
    router.push('/my-keys')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <main class="saas-landing">
    <section class="hero">
      <h1>SteamKeyVault</h1>
      <p class="subtitle">The SaaS solution to securely manage, organize, and share your Steam keys.</p>
      <button class="cta" @click="goToMyKeys">Get Started</button>
    </section>
    <section class="features">
      <div class="feature">
        <h2>Centralized Key Management</h2>
        <p>Store all your Steam keys in one secure place, accessible from anywhere.</p>
      </div>
      <div class="feature">
        <h2>Easy Organization</h2>
        <p>Tag, categorize, and search your keys for quick access and better control.</p>
      </div>
      <div class="feature">
        <h2>Team Collaboration</h2>
        <p>Share keys with your team or friends, track usage, and manage permissions.</p>
      </div>
      <div class="feature">
        <h2>Security First</h2>
        <p>Your keys are encrypted and protected with industry best practices.</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.saas-landing {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
.hero {
  text-align: center;
  margin-bottom: 3rem;
}
.hero h1 {
  font-size: 3rem;
  color: var(--skv-primary);
  margin-bottom: 1rem;
}
.subtitle {
  font-size: 1.3rem;
  color: var(--skv-secondary);
  margin-bottom: 2rem;
}
.cta {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--skv-primary);
  color: #fff;
  border-radius: 4px;
  font-size: 1.1rem;
  text-decoration: none;
  transition: background 0.2s;
}
.cta:hover {
  background: var(--skv-accent);
}
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
}
.feature {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(37,99,235,0.04);
  text-align: center;
}
.feature h2 {
  color: var(--skv-primary);
  margin-bottom: 0.5rem;
}
</style>
