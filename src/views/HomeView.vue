<template>
  <main class="saas-landing">
    <Card class="hero-card">
      <template #title>
        <span class="hero-title">SteamKeyVault</span>
      </template>
      <template #content>
        <p class="subtitle">The SaaS solution to securely manage, organize, and share your Steam keys.</p>
        <Button class="cta" label="Get Started" @click="goToMyKeys" />
      </template>
    </Card>
    <div class="features-grid">
      <Panel header="Centralized Key Management" class="feature-panel">
        <p>Store all your Steam keys in one secure place, accessible from anywhere.</p>
      </Panel>
      <Panel header="Easy Organization" class="feature-panel">
        <p>Tag, categorize, and search your keys for quick access and better control.</p>
      </Panel>
      <Panel header="Team Collaboration" class="feature-panel">
        <p>Share keys with your team or friends, track usage, and manage permissions.</p>
      </Panel>
      <Panel header="Security First" class="feature-panel">
        <p>Your keys are encrypted and protected with industry best practices.</p>
      </Panel>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import Card from 'primevue/card';
import Panel from 'primevue/panel';
import Button from 'primevue/button';

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

<style scoped>
.saas-landing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.hero-card {
  width: 100%;
  max-width: 600px;
  text-align: center;
}
.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
}
.subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}
.cta {
  margin-top: 1rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
}
.feature-panel {
  min-height: 120px;
}
</style>
